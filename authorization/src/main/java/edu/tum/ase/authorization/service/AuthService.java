package edu.tum.ase.authorization.service;

import edu.tum.ase.authorization.model.AuthRequest;
import edu.tum.ase.authorization.model.UserEntity;
import edu.tum.ase.authorization.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;


@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public Boolean authenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        return authentication != null &&
                !(authentication instanceof AnonymousAuthenticationToken) &&
                authentication.isAuthenticated();
    }

    public String registerUser(AuthRequest authenticationRequest) {
        if(authenticationRequest == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid request");
        }

        if(authenticationRequest.username().length() < 6 || authenticationRequest.password().length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username or password too short.");
        }

        Optional<UserEntity> existingUser = userRepository.findByUsername(authenticationRequest.username());
        if (existingUser.isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "USER ALREADY EXISTS");
        } else {
            UserEntity newUser = new UserEntity();
            newUser.setUsername(authenticationRequest.username());
            newUser.setPassword(passwordEncoder.encode(authenticationRequest.password()));
            userRepository.save(newUser);
            return newUser.getUsername();
        }
    }
}
