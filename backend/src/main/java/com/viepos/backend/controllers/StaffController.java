package com.viepos.backend.controllers;

import com.viepos.backend.models.Role;
import com.viepos.backend.models.User;
import com.viepos.backend.models.UserStatus;
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
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/staff")
public class StaffController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    // Staff Register
    @PostMapping("/register")
    public ResponseEntity<?> registerStaff(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String email = request.get("email");
        String phone = request.get("phone");
        String pin = request.get("pin");

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already in use"));
        }

        User staff = new User();
        staff.setName(name);
        staff.setEmail(email);
        staff.setPhone(phone);
        // Save the PIN as the hashed password
        staff.setPassword(passwordEncoder.encode(pin));
        staff.setRole(Role.STAFF);
        staff.setStatus(UserStatus.PENDING); // Wait for Manager approval

        userRepository.save(staff);

        return ResponseEntity.ok(Map.of("message", "Registration successful. Please wait for manager approval."));
    }

    // Get Pending Staff (For Manager)
    @GetMapping("/pending")
    public ResponseEntity<List<User>> getPendingStaff() {
        // Retrieve all staff with PENDING status
        List<User> pendingStaff = userRepository.findByRoleAndStatus(Role.STAFF, UserStatus.PENDING);
        // Usually we shouldn't send passwords, but let's assume they are hashed and safe for a demo.
        // It's better to clean up passwords in DTOs, but returning User works for quick demo.
        for(User u : pendingStaff) {
            u.setPassword(null); // hide password hash
        }
        return ResponseEntity.ok(pendingStaff);
    }

    // Approve Staff (For Manager)
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveStaff(@PathVariable String id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setStatus(UserStatus.APPROVED);
            userRepository.save(user);

            // Mock sending email
            System.out.println("=========================================================");
            System.out.println("MOCK EMAIL SENT TO: " + user.getEmail());
            System.out.println("SUBJECT: Your ViePOS account has been approved");
            System.out.println("BODY: You can now login with your email and PIN.");
            System.out.println("=========================================================");

            return ResponseEntity.ok(Map.of("message", "Staff account approved. Email sent."));
        }
        return ResponseEntity.notFound().build();
    }
    
    // Reject Staff (For Manager)
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectStaff(@PathVariable String id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setStatus(UserStatus.REJECTED);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Staff account rejected."));
        }
        return ResponseEntity.notFound().build();
    }

    // Staff Login
    @PostMapping("/login")
    public ResponseEntity<?> loginStaff(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String pin = request.get("pin");

        // Verify if account is approved before generating token
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Tài khoản không tồn tại."));
        }

        User user = userOpt.get();
        if (user.getRole() != Role.STAFF) {
            return ResponseEntity.status(403).body(Map.of("ok", false, "message", "Bạn không có quyền truy cập ứng dụng nhân viên."));
        }
        if (user.getStatus() == UserStatus.PENDING) {
            return ResponseEntity.status(403).body(Map.of("ok", false, "message", "Tài khoản đang chờ duyệt. Vui lòng thử lại sau!"));
        }
        if (user.getStatus() == UserStatus.REJECTED) {
            return ResponseEntity.status(403).body(Map.of("ok", false, "message", "Tài khoản đã bị từ chối."));
        }

        try {
            // Check credentials using AuthenticationManager (compares raw pin with hashed password)
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, pin)
            );
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Email hoặc mã PIN không chính xác."));
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        final String jwt = jwtUtil.generateToken(userDetails);

        Map<String, Object> response = new HashMap<>();
        response.put("ok", true);
        response.put("token", jwt);
        response.put("role", user.getRole().name());
        return ResponseEntity.ok(response);
    }
}
