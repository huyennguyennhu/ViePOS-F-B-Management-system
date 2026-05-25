package com.viepos.backend.controllers;

import com.viepos.backend.models.User;
import com.viepos.backend.models.enums.EmployeeRole;
import com.viepos.backend.repositories.UserRepository;
import com.viepos.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getLockoutUntil() != null && user.getLockoutUntil().isAfter(LocalDateTime.now())) {
                return ResponseEntity.status(423)
                        .body(Map.of("ok", false, "message", "Tài khoản bị khóa đến " + user.getLockoutUntil()));
            }
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );
        } catch (Exception e) {
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
                if (user.getFailedLoginAttempts() >= 3) {
                    user.setLockoutUntil(LocalDateTime.now().plusMinutes(15));
                }
                userRepository.save(user);
            }
            return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Incorrect email or password"));
        }

        User user = userOpt.orElseThrow();
        if (user.getEmployee() == null) {
            return ResponseEntity.status(500).body(Map.of("ok", false, "message", "User employee record not found"));
        }

        // Luồng Quản lý: chỉ ADMIN / ROOT_ADMIN đăng nhập bằng mật khẩu (không dùng PIN)
        EmployeeRole role = user.getEmployee().getRole();
        if (role != EmployeeRole.ADMIN && role != EmployeeRole.ROOT_ADMIN) {
            return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Incorrect email or password"));
        }

        user.setLastLoginAt(LocalDateTime.now());
        user.setFailedLoginAttempts(0);
        user.setLockoutUntil(null);
        userRepository.save(user);

        final UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        final String jwt = jwtUtil.generateToken(userDetails);

        Map<String, Object> response = new HashMap<>();
        response.put("ok", true);
        response.put("token", jwt);
        response.put("role", user.getEmployee().getRole().name());
        response.put("name", user.getEmployee().getFullName());
        response.put("id", user.getId().toString());
        return ResponseEntity.ok(response);
    }
}
