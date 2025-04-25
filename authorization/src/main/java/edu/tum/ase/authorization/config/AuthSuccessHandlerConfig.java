package edu.tum.ase.authorization.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.tum.ase.authorization.model.UserEntity;
import edu.tum.ase.authorization.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.web.server.ResponseStatusException;

import java.io.PrintWriter;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Configuration
@RequiredArgsConstructor
public class AuthSuccessHandlerConfig {

    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;
    private final JwtEncoder jwtEncoder;

    @Value("${urls.gateway}")
    private String gatewayUrl;


    @Bean
    public AuthenticationSuccessHandler jwtGeneratingSuccessHandler() {

        return (request, response, authentication) -> {
            String subject;
            String username;
            UserEntity user;

            if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
                OAuth2User oauthUser = oauthToken.getPrincipal();
                String provider = oauthToken.getAuthorizedClientRegistrationId();
                String providerId = oauthUser.getName();
                username = provider + "_" + providerId;

                Optional<UserEntity> existingUser = userRepository.findByUsername(username);

                if (existingUser.isPresent()) {
                    user = existingUser.get();
                } else {
                    user = new UserEntity();
                    user.setUsername(username);
                    user.setPassword("");
                    userRepository.save(user);
                }

                subject = user.getId().toString();

            } else if (authentication instanceof JwtAuthenticationToken jwtAuth) {
                subject = jwtAuth.getToken().getSubject();
                username = jwtAuth.getName();
            } else if (authentication instanceof UsernamePasswordAuthenticationToken) {
                username = authentication.getName();
                subject = userRepository.findByUsername(username)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with name: " + username))
                        .getId().toString();
            } else {
                throw new InternalAuthenticationServiceException("Unsupported authentication method");
            }


            Instant now = Instant.now();
            long expiry = 3600L;

            String scope = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.joining(" "));

            JwsHeader jwsHeader = JwsHeader.with(SignatureAlgorithm.RS256)
                    .keyId("auth-rsa-key")
                    .build();

            JwtClaimsSet claims = JwtClaimsSet.builder()
                    .issuer("auth-service")
                    .issuedAt(now)
                    .expiresAt(now.plusSeconds(expiry))
                    .subject(subject)
                    .claim("scope", scope)
                    .claim("username", username)
                    .build();

            String token = jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();

            if(authentication instanceof OAuth2AuthenticationToken) {
                String redirectUrl = gatewayUrl + "/callback"
                        + "#access_token=" + token
                        + "&token_type=Bearer"
                        + "&expires_in=" + expiry;
                response.sendRedirect(redirectUrl);
            } else {
                Map<String, String> tokenResponse = new HashMap<>();
                tokenResponse.put("access_token", token);

                response.setStatus(HttpServletResponse.SC_OK);
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");

                PrintWriter writer = response.getWriter();
                objectMapper.writeValue(writer, tokenResponse);
                writer.flush();
            }
        };
    }

}
