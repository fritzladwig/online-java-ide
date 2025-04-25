package edu.tum.ase.authorization.controller;

import com.nimbusds.jose.jwk.JWKSet;
import edu.tum.ase.authorization.model.AuthRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import edu.tum.ase.authorization.service.AuthService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JWKSet jwkSet;

    @GetMapping("/authenticated")
    public ResponseEntity<Boolean> authenticated() {
        return ResponseEntity.ok(authService.authenticated());
    }

    @GetMapping("/.well-known/jwks.json")
    public Map<String, Object> jwks() {
        return this.jwkSet.toJSONObject(true);
    }

    @PostMapping("/register")
    public ResponseEntity<String> register (@Valid @RequestBody AuthRequest request) {
        System.out.println("Request received by controller");
        return ResponseEntity.ok(authService.registerUser(request));
    }
}
