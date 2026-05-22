package com.viepos.backend.controllers;

import com.viepos.backend.models.Role;
import com.viepos.backend.models.User;
import com.viepos.backend.models.UserStatus;
import com.viepos.backend.repositories.UserRepository;
import com.viepos.backend.repositories.PinChangeRequestRepository;
import com.viepos.backend.repositories.PinResetRequestRepository;
import com.viepos.backend.models.PinChangeRequest;
import com.viepos.backend.models.PinResetRequest;
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
    private PinChangeRequestRepository pinChangeRequestRepository;

    @Autowired
    private PinResetRequestRepository pinResetRequestRepository;

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

        Optional<User> existingUserOpt = userRepository.findByEmail(email);
        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            if (existingUser.getStatus() == UserStatus.PENDING) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email này đã được đăng ký và đang chờ duyệt!"));
            } else if (existingUser.getStatus() == UserStatus.APPROVED) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email này đã có tài khoản hoạt động. Vui lòng đăng nhập!"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Email này đã được sử dụng."));
            }
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
        response.put("name", user.getName());
        response.put("id", user.getId());
        response.put("phone", user.getPhone() != null ? user.getPhone() : "");
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-pin")
    public ResponseEntity<?> verifyPin(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String pin = request.get("pin");

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, pin)
            );
            return ResponseEntity.ok(Map.of("ok", true, "message", "Mã PIN chính xác."));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Mã PIN cũ không chính xác."));
        }
    }

    @PostMapping("/pin-change-request")
    public ResponseEntity<?> requestPinChange(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String oldPin = request.get("oldPin");
        String newPin = request.get("newPin");

        if (oldPin.equals(newPin)) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "message", "Mã PIN mới không được trùng với mã PIN cũ."));
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Tài khoản không tồn tại."));
        }

        User user = userOpt.get();

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, oldPin)
            );
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Mã PIN cũ không chính xác."));
        }

        PinChangeRequest pinRequest = new PinChangeRequest();
        pinRequest.setUser(user);
        pinRequest.setNewPin(passwordEncoder.encode(newPin));
        pinChangeRequestRepository.save(pinRequest);

        return ResponseEntity.ok(Map.of("ok", true, "message", "Yêu cầu đổi mã PIN đã được gửi thành công và đang chờ duyệt."));
    }

    @PostMapping("/forgot-pin")
    public ResponseEntity<?> requestForgotPin(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPin = request.get("newPin");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Email không tồn tại trong hệ thống."));
        }

        User user = userOpt.get();

        PinResetRequest resetReq = new PinResetRequest();
        resetReq.setUser(user);
        resetReq.setNewPin(passwordEncoder.encode(newPin));
        pinResetRequestRepository.save(resetReq);

        return ResponseEntity.ok(Map.of("ok", true, "message", "Yêu cầu cấp lại mã PIN đã được gửi thành công. Vui lòng chờ Quản lý duyệt."));
    }

    // ==============================================================
    // ADMIN ENDPOINTS
    // ==============================================================

    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllStaff() {
        List<User> staff = userRepository.findByRole(Role.STAFF);
        for(User u : staff) {
            u.setPassword(null); // hide password hash
        }
        return ResponseEntity.ok(staff);
    }

    @GetMapping("/history/accounts")
    public ResponseEntity<List<User>> getAccountHistory() {
        List<User> history = userRepository.findByRoleAndStatusNot(Role.STAFF, UserStatus.PENDING);
        for(User u : history) {
            u.setPassword(null);
        }
        return ResponseEntity.ok(history);
    }

    @GetMapping("/pin-change-requests/pending")
    public ResponseEntity<List<PinChangeRequest>> getPendingPinRequests() {
        List<PinChangeRequest> pending = pinChangeRequestRepository.findByStatusOrderByCreatedAtDesc(com.viepos.backend.models.PinChangeRequestStatus.PENDING);
        for(PinChangeRequest req : pending) {
            req.getUser().setPassword(null);
        }
        return ResponseEntity.ok(pending);
    }

    @GetMapping("/pin-change-requests/history")
    public ResponseEntity<List<PinChangeRequest>> getPinChangeHistory() {
        List<PinChangeRequest> history = pinChangeRequestRepository.findByStatusInOrderByCreatedAtDesc(
            List.of(com.viepos.backend.models.PinChangeRequestStatus.APPROVED, com.viepos.backend.models.PinChangeRequestStatus.REJECTED)
        );
        for(PinChangeRequest req : history) {
            req.getUser().setPassword(null);
        }
        return ResponseEntity.ok(history);
    }

    @PutMapping("/pin-change-requests/{id}/approve")
    public ResponseEntity<?> approvePinRequest(@PathVariable String id) {
        Optional<PinChangeRequest> reqOpt = pinChangeRequestRepository.findById(id);
        if (reqOpt.isPresent()) {
            PinChangeRequest req = reqOpt.get();
            req.setStatus(com.viepos.backend.models.PinChangeRequestStatus.APPROVED);
            
            // Update user password
            User user = req.getUser();
            user.setPassword(req.getNewPin());
            userRepository.save(user);
            pinChangeRequestRepository.save(req);

            return ResponseEntity.ok(Map.of("message", "Đã duyệt yêu cầu đổi mã PIN."));
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/pin-change-requests/{id}/reject")
    public ResponseEntity<?> rejectPinRequest(@PathVariable String id) {
        Optional<PinChangeRequest> reqOpt = pinChangeRequestRepository.findById(id);
        if (reqOpt.isPresent()) {
            PinChangeRequest req = reqOpt.get();
            req.setStatus(com.viepos.backend.models.PinChangeRequestStatus.REJECTED);
            pinChangeRequestRepository.save(req);
            return ResponseEntity.ok(Map.of("message", "Đã từ chối yêu cầu đổi mã PIN."));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/pin-reset-requests/pending")
    public ResponseEntity<List<PinResetRequest>> getPendingPinResets() {
        List<PinResetRequest> pending = pinResetRequestRepository.findByStatusOrderByCreatedAtDesc(com.viepos.backend.models.PinChangeRequestStatus.PENDING);
        for(PinResetRequest req : pending) {
            req.getUser().setPassword(null);
        }
        return ResponseEntity.ok(pending);
    }

    @GetMapping("/pin-reset-requests/history")
    public ResponseEntity<List<PinResetRequest>> getPinResetHistory() {
        List<PinResetRequest> history = pinResetRequestRepository.findByStatusInOrderByCreatedAtDesc(
            List.of(com.viepos.backend.models.PinChangeRequestStatus.APPROVED, com.viepos.backend.models.PinChangeRequestStatus.REJECTED)
        );
        for(PinResetRequest req : history) {
            req.getUser().setPassword(null);
        }
        return ResponseEntity.ok(history);
    }

    @PutMapping("/pin-reset-requests/{id}/approve")
    public ResponseEntity<?> approvePinReset(@PathVariable String id) {
        Optional<PinResetRequest> reqOpt = pinResetRequestRepository.findById(id);
        if (reqOpt.isPresent()) {
            PinResetRequest req = reqOpt.get();
            req.setStatus(com.viepos.backend.models.PinChangeRequestStatus.APPROVED);
            
            // Update user password
            User user = req.getUser();
            user.setPassword(req.getNewPin());
            userRepository.save(user);
            pinResetRequestRepository.save(req);

            return ResponseEntity.ok(Map.of("message", "Đã duyệt yêu cầu cấp lại mã PIN."));
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/pin-reset-requests/{id}/reject")
    public ResponseEntity<?> rejectPinReset(@PathVariable String id) {
        Optional<PinResetRequest> reqOpt = pinResetRequestRepository.findById(id);
        if (reqOpt.isPresent()) {
            PinResetRequest req = reqOpt.get();
            req.setStatus(com.viepos.backend.models.PinChangeRequestStatus.REJECTED);
            pinResetRequestRepository.save(req);
            return ResponseEntity.ok(Map.of("message", "Đã từ chối yêu cầu cấp lại mã PIN."));
        }
        return ResponseEntity.notFound().build();
    }
}
