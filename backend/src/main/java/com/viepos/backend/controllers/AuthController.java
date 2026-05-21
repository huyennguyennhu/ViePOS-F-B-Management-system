package com.viepos.backend.controllers;

import com.viepos.backend.models.User;
import com.viepos.backend.repositories.UserRepository;
import com.viepos.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Incorrect email or password"));
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        final String jwt = jwtUtil.generateToken(userDetails);

        Map<String, Object> response = new HashMap<>();
        response.put("ok", true);
        response.put("token", jwt);
        return ResponseEntity.ok(response);
    }
    
    // Seed an admin user for testing if the DB is empty
    @PostMapping("/seed")
    public ResponseEntity<?> seedAdmin() {
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setEmail("nguyennlt.ncc@gmail.com");
            admin.setPassword(passwordEncoder.encode("Admin123!@#"));
            admin.setName("Admin");
            userRepository.save(admin);
            return ResponseEntity.ok(Map.of("message", "Admin seeded successfully"));
        }
        return ResponseEntity.ok(Map.of("message", "Database already seeded"));
    }
}
