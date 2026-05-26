package com.viepos.backend.controllers;

import com.viepos.backend.models.AccountRequest;
import com.viepos.backend.models.Employee;
import com.viepos.backend.models.User;
import com.viepos.backend.models.enums.AuditAction;
import com.viepos.backend.models.enums.EmployeeRole;
import com.viepos.backend.models.enums.EmployeeStatus;
import com.viepos.backend.models.enums.RequestStatus;
import com.viepos.backend.models.enums.RequestType;
import com.viepos.backend.repositories.AccountRequestRepository;
import com.viepos.backend.repositories.EmployeeRepository;
import com.viepos.backend.repositories.UserRepository;
import com.viepos.backend.security.JwtUtil;
import com.viepos.backend.services.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import com.viepos.backend.util.ApiDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class StaffController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AccountRequestRepository requestRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuditLogService auditLogService;

    /** DB: ACTIVE/RESIGNED → UI: APPROVED/REJECTED */
    private static String statusToUi(EmployeeStatus status) {
        if (status == null || status == EmployeeStatus.ACTIVE) {
            return "APPROVED";
        }
        return "REJECTED";
    }

    private static EmployeeStatus statusFromUi(String uiStatus) {
        if (uiStatus == null || uiStatus.isBlank()) {
            return EmployeeStatus.ACTIVE;
        }
        String s = uiStatus.trim().toUpperCase();
        if ("APPROVED".equals(s) || "ACTIVE".equals(s)) {
            return EmployeeStatus.ACTIVE;
        }
        if ("REJECTED".equals(s) || "RESIGNED".equals(s)) {
            return EmployeeStatus.RESIGNED;
        }
        return EmployeeStatus.valueOf(s);
    }

    private static String roleToUi(EmployeeRole role) {
        if (role == null || role == EmployeeRole.STAFF) {
            return "Nhân viên";
        }
        if (role == EmployeeRole.ADMIN || role == EmployeeRole.ROOT_ADMIN) {
            return "Quản lý";
        }
        return role.name();
    }

    // Helper to format User to old UI struct
    private Map<String, Object> mapUserToOldStruct(User user, String statusOverride) {
        Map<String, Object> map = new HashMap<>();
        Employee emp = user.getEmployee();
        map.put("id", user.getId().toString());
        map.put("employeeId", emp != null ? emp.getEmployeeId() : null);
        map.put("name", emp != null ? emp.getFullName() : "");
        map.put("email", user.getEmail());
        map.put("phone", emp != null ? emp.getPhone() : "");
        map.put("role", emp != null ? roleToUi(emp.getRole()) : "Nhân viên");
        map.put("status", statusOverride != null ? statusOverride : statusToUi(emp != null ? emp.getStatus() : null));
        map.put("createdAt", ApiDateTime.toVietnamOffset(user.getCreatedAt()));
        return map;
    }

    private Map<String, Object> mapRequestToOldStruct(AccountRequest req, String status) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", req.getId().toString());
        map.put("name", req.getRequestFullName() != null ? req.getRequestFullName() : (req.getEmployee() != null ? req.getEmployee().getFullName() : ""));
        map.put("email", req.getRequestEmail() != null ? req.getRequestEmail() : "");
        map.put("phone", req.getRequestPhone() != null ? req.getRequestPhone() : "");
        map.put("role", "STAFF");
        map.put("status", status);
        map.put("createdAt", ApiDateTime.toVietnamOffset(req.getCreatedAt()));
        
        // Wrap for pin requests where frontend expects req.user.name
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("name", req.getEmployee() != null ? req.getEmployee().getFullName() : "");
        userMap.put("email", req.getEmployee() != null ? req.getEmployee().getPersonalEmail() : "");
        map.put("user", userMap);
        
        return map;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            return null;
        }
        String username;
        if (auth.getPrincipal() instanceof UserDetails details) {
            username = details.getUsername();
        } else if (auth.getPrincipal() instanceof String principalString) {
            username = principalString;
        } else {
            return null;
        }
        return userRepository.findByEmail(username).orElse(null);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerStaff(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String email = request.get("email");
        String phone = request.get("phone");
        String pin = request.get("pin");

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email này đã được đăng ký!"));
        }

        AccountRequest req = new AccountRequest();
        req.setRequestCode("REQ" + System.currentTimeMillis());
        req.setRequestType(RequestType.REGISTER);
        req.setRequestFullName(name);
        req.setRequestEmail(email);
        req.setRequestPhone(phone);
        req.setRequestPinHash(passwordEncoder.encode(pin));
        req.setStatus(RequestStatus.PENDING);
        requestRepository.save(req);

        return ResponseEntity.ok(Map.of("message", "Registration successful. Please wait for manager approval."));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Map<String, Object>>> getPendingStaff() {
        List<AccountRequest> pending = requestRepository.findByRequestTypeAndStatusOrderByCreatedAtDesc(RequestType.REGISTER, RequestStatus.PENDING);
        return ResponseEntity.ok(pending.stream().map(r -> mapRequestToOldStruct(r, "PENDING")).collect(Collectors.toList()));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveStaff(@PathVariable String id) {
        Optional<AccountRequest> reqOpt = requestRepository.findById(UUID.fromString(id));
        if (reqOpt.isPresent() && reqOpt.get().getRequestType() == RequestType.REGISTER) {
            AccountRequest req = reqOpt.get();
            if (req.getStatus() != RequestStatus.PENDING) {
                return ResponseEntity.status(400).body(Map.of("message", "Yêu cầu này đã được xử lý."));
            }
            if (userRepository.existsByEmail(req.getRequestEmail())) {
                return ResponseEntity.status(400).body(Map.of("message", "Email này đã tồn tại trong hệ thống."));
            }
            User currentUser = getCurrentUser();
            if (currentUser != null && currentUser.getEmployee() != null) {
                req.setApprovedBy(currentUser.getEmployee());
            }
            req.setStatus(RequestStatus.APPROVED);
            req.setApprovedAt(LocalDateTime.now());
            requestRepository.save(req);

            Employee emp = new Employee();
            emp.setEmployeeId("EMP" + System.currentTimeMillis());
            emp.setFullName(req.getRequestFullName());
            emp.setPersonalEmail(req.getRequestEmail());
            emp.setPhone(req.getRequestPhone());
            emp.setRole(EmployeeRole.STAFF);
            emp.setStatus(EmployeeStatus.ACTIVE);
            employeeRepository.save(emp);

            User user = new User();
            user.setEmployee(emp);
            user.setEmail(req.getRequestEmail());
            user.setPassword(req.getRequestPinHash());
            userRepository.save(user);

            if (currentUser != null) {
                auditLogService.log(currentUser, AuditAction.APPROVE, "account_requests", req.getId(), null, Map.of("requestCode", req.getRequestCode()));
            }

            return ResponseEntity.ok(Map.of("message", "Staff account approved. Email sent."));
        }
        return ResponseEntity.notFound().build();
    }
    
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectStaff(@PathVariable String id) {
        Optional<AccountRequest> reqOpt = requestRepository.findById(UUID.fromString(id));
        if (reqOpt.isPresent() && reqOpt.get().getRequestType() == RequestType.REGISTER) {
            AccountRequest req = reqOpt.get();
            if (req.getStatus() != RequestStatus.PENDING) {
                return ResponseEntity.status(400).body(Map.of("message", "Yêu cầu này đã được xử lý."));
            }
            User currentUser = getCurrentUser();
            if (currentUser != null && currentUser.getEmployee() != null) {
                req.setApprovedBy(currentUser.getEmployee());
            }
            req.setStatus(RequestStatus.REJECTED);
            req.setApprovedAt(LocalDateTime.now());
            requestRepository.save(req);
            if (currentUser != null) {
                auditLogService.log(currentUser, AuditAction.REJECT, "account_requests", req.getId(), null, Map.of("requestCode", req.getRequestCode()));
            }
            return ResponseEntity.ok(Map.of("message", "Staff account rejected."));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginStaff(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String pin = request.get("pin");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Tài khoản không tồn tại."));
        }

        User user = userOpt.get();
        
        if (user.getEmployee() == null) {
            return ResponseEntity.status(500).body(Map.of("ok", false, "message", "User employee record not found"));
        }
        
        // Luồng POS: chỉ nhân viên (STAFF) đăng nhập bằng PIN
        if (user.getEmployee().getRole() != EmployeeRole.STAFF) {
            return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Email hoặc mã PIN không chính xác."));
        }

        if (user.getEmployee().getStatus() != EmployeeStatus.ACTIVE) {
            return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Tài khoản của bạn đã bị vô hiệu hóa hoặc nghỉ việc."));
        }

        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, pin));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Email hoặc mã PIN không chính xác."));
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        final String jwt = jwtUtil.generateToken(userDetails);

        Map<String, Object> response = new HashMap<>();
        response.put("ok", true);
        response.put("token", jwt);
        response.put("role", user.getEmployee().getRole().name());
        response.put("name", user.getEmployee().getFullName());
        response.put("id", user.getId());
        response.put("employeeId", user.getEmployee().getEmployeeId()); // "EMPxxx" — dùng để filter đơn hàng
        response.put("phone", user.getEmployee().getPhone());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-pin")
    public ResponseEntity<?> verifyPin(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String pin = request.get("pin");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent() && userOpt.get().getEmployee() != null && userOpt.get().getEmployee().getStatus() != EmployeeStatus.ACTIVE) {
            return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Tài khoản của bạn đã bị vô hiệu hóa hoặc nghỉ việc."));
        }

        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, pin));
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

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Tài khoản không tồn tại."));
        if (userOpt.get().getEmployee() != null && userOpt.get().getEmployee().getStatus() != EmployeeStatus.ACTIVE) {
            return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Tài khoản của bạn đã bị vô hiệu hóa hoặc nghỉ việc."));
        }

        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, oldPin));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Mã PIN cũ không chính xác."));
        }

        AccountRequest req = new AccountRequest();
        req.setRequestCode("REQ" + System.currentTimeMillis());
        req.setRequestType(RequestType.CHANGE_PIN);
        req.setEmployee(userOpt.get().getEmployee());
        req.setRequestPinHash(passwordEncoder.encode(newPin));
        requestRepository.save(req);

        return ResponseEntity.ok(Map.of("ok", true, "message", "Yêu cầu đổi mã PIN đã được gửi thành công."));
    }

    @PostMapping("/forgot-pin")
    public ResponseEntity<?> requestForgotPin(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPin = request.get("newPin");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Email không tồn tại trong hệ thống."));
        if (userOpt.get().getEmployee() != null && userOpt.get().getEmployee().getStatus() != EmployeeStatus.ACTIVE) {
            return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Tài khoản của bạn đã bị vô hiệu hóa hoặc nghỉ việc."));
        }

        AccountRequest req = new AccountRequest();
        req.setRequestCode("REQ" + System.currentTimeMillis());
        req.setRequestType(RequestType.RESET_PIN);
        req.setEmployee(userOpt.get().getEmployee());
        req.setRequestPinHash(passwordEncoder.encode(newPin));
        requestRepository.save(req);

        return ResponseEntity.ok(Map.of("ok", true, "message", "Yêu cầu cấp lại mã PIN đã được gửi thành công."));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllStaff() {
        List<Map<String, Object>> staff = userRepository.findAllWithEmployeeByRole(EmployeeRole.STAFF).stream()
                .map(u -> mapUserToOldStruct(u, null))
                .collect(Collectors.toList());
        return ResponseEntity.ok(staff);
    }

    @GetMapping("/history/accounts")
    public ResponseEntity<List<Map<String, Object>>> getAccountHistory() {
        List<AccountRequest> history = requestRepository.findByRequestTypeAndStatusOrderByCreatedAtDesc(RequestType.REGISTER, RequestStatus.APPROVED);
        history.addAll(requestRepository.findByRequestTypeAndStatusOrderByCreatedAtDesc(RequestType.REGISTER, RequestStatus.REJECTED));
        return ResponseEntity.ok(history.stream().map(r -> mapRequestToOldStruct(r, r.getStatus().name())).collect(Collectors.toList()));
    }

    @GetMapping("/pin-change-requests/pending")
    public ResponseEntity<List<Map<String, Object>>> getPendingPinRequests() {
        List<AccountRequest> pending = requestRepository.findByRequestTypeAndStatusOrderByCreatedAtDesc(RequestType.CHANGE_PIN, RequestStatus.PENDING);
        return ResponseEntity.ok(pending.stream().map(r -> mapRequestToOldStruct(r, "PENDING")).collect(Collectors.toList()));
    }

    @GetMapping("/pin-change-requests/history")
    public ResponseEntity<List<Map<String, Object>>> getPinChangeHistory() {
        List<AccountRequest> history = requestRepository.findByRequestTypeAndStatusOrderByCreatedAtDesc(RequestType.CHANGE_PIN, RequestStatus.APPROVED);
        history.addAll(requestRepository.findByRequestTypeAndStatusOrderByCreatedAtDesc(RequestType.CHANGE_PIN, RequestStatus.REJECTED));
        return ResponseEntity.ok(history.stream().map(r -> mapRequestToOldStruct(r, r.getStatus().name())).collect(Collectors.toList()));
    }

    @PutMapping("/pin-change-requests/{id}/approve")
    public ResponseEntity<?> approvePinRequest(@PathVariable String id) {
        Optional<AccountRequest> reqOpt = requestRepository.findById(UUID.fromString(id));
        if (reqOpt.isPresent()) {
            AccountRequest req = reqOpt.get();
            if (req.getStatus() != RequestStatus.PENDING) {
                return ResponseEntity.status(400).body(Map.of("message", "Yêu cầu này đã được xử lý."));
            }
            User currentUser = getCurrentUser();
            if (currentUser != null && currentUser.getEmployee() != null) {
                req.setApprovedBy(currentUser.getEmployee());
            }
            req.setStatus(RequestStatus.APPROVED);
            req.setApprovedAt(LocalDateTime.now());
            
            User user = userRepository.findByEmail(req.getEmployee().getPersonalEmail()).orElseThrow();
            user.setPassword(req.getRequestPinHash());
            user.setPinChangeCount(user.getPinChangeCount() + 1);
            userRepository.save(user);
            requestRepository.save(req);
            if (currentUser != null) {
                auditLogService.log(currentUser, AuditAction.APPROVE, "account_requests", req.getId(), null, Map.of("requestCode", req.getRequestCode()));
            }
            return ResponseEntity.ok(Map.of("message", "Đã duyệt yêu cầu đổi mã PIN."));
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/pin-change-requests/{id}/reject")
    public ResponseEntity<?> rejectPinRequest(@PathVariable String id) {
        Optional<AccountRequest> reqOpt = requestRepository.findById(UUID.fromString(id));
        if (reqOpt.isPresent()) {
            AccountRequest req = reqOpt.get();
            if (req.getStatus() != RequestStatus.PENDING) {
                return ResponseEntity.status(400).body(Map.of("message", "Yêu cầu này đã được xử lý."));
            }
            User currentUser = getCurrentUser();
            if (currentUser != null && currentUser.getEmployee() != null) {
                req.setApprovedBy(currentUser.getEmployee());
            }
            req.setStatus(RequestStatus.REJECTED);
            req.setApprovedAt(LocalDateTime.now());
            requestRepository.save(req);
            if (currentUser != null) {
                auditLogService.log(currentUser, AuditAction.REJECT, "account_requests", req.getId(), null, Map.of("requestCode", req.getRequestCode()));
            }
            return ResponseEntity.ok(Map.of("message", "Đã từ chối yêu cầu."));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/pin-reset-requests/pending")
    public ResponseEntity<List<Map<String, Object>>> getPendingPinResets() {
        List<AccountRequest> pending = requestRepository.findByRequestTypeAndStatusOrderByCreatedAtDesc(RequestType.RESET_PIN, RequestStatus.PENDING);
        return ResponseEntity.ok(pending.stream().map(r -> mapRequestToOldStruct(r, "PENDING")).collect(Collectors.toList()));
    }

    @GetMapping("/pin-reset-requests/history")
    public ResponseEntity<List<Map<String, Object>>> getPinResetHistory() {
        List<AccountRequest> history = requestRepository.findByRequestTypeAndStatusOrderByCreatedAtDesc(RequestType.RESET_PIN, RequestStatus.APPROVED);
        history.addAll(requestRepository.findByRequestTypeAndStatusOrderByCreatedAtDesc(RequestType.RESET_PIN, RequestStatus.REJECTED));
        return ResponseEntity.ok(history.stream().map(r -> mapRequestToOldStruct(r, r.getStatus().name())).collect(Collectors.toList()));
    }

    @PutMapping("/pin-reset-requests/{id}/approve")
    public ResponseEntity<?> approvePinReset(@PathVariable String id) {
        return approvePinRequest(id); // Same logic
    }

    @PutMapping("/pin-reset-requests/{id}/reject")
    public ResponseEntity<?> rejectPinReset(@PathVariable String id) {
        return rejectPinRequest(id); // Same logic
    }

    /** Create a new staff account directly (admin action, skips approval flow) */
    @PostMapping
    public ResponseEntity<?> createStaff(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String phone = body.get("phone");
        String roleStr = body.getOrDefault("role", "STAFF");
        String pin = body.getOrDefault("pin", "123456");
        String password = body.get("password");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email không được để trống"));
        }
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email này đã được đăng ký!"));
        }

        EmployeeRole empRole = resolveEmployeeRole(roleStr);

        Employee emp = new Employee();
        emp.setEmployeeId("EMP" + System.currentTimeMillis());
        emp.setFullName(name);
        emp.setPersonalEmail(email);
        emp.setPhone(phone);
        emp.setRole(empRole);
        emp.setStatus(EmployeeStatus.ACTIVE);
        employeeRepository.save(emp);

        User user = new User();
        user.setEmployee(emp);
        user.setEmail(email);
        if (empRole == EmployeeRole.STAFF) {
            user.setPassword(passwordEncoder.encode(pin));
        } else {
            if (password == null || password.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Tài khoản quản lý cần mật khẩu đăng nhập"));
            }
            user.setPassword(passwordEncoder.encode(password));
        }
        userRepository.save(user);

        return ResponseEntity.ok(mapUserToOldStruct(user, "APPROVED"));
    }

    /** Update staff info (name, phone, status) */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStaff(@PathVariable String id, @RequestBody Map<String, String> body) {
        Optional<User> userOpt = userRepository.findById(UUID.fromString(id));
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Nhân viên không tìm thấy"));
        }
        User user = userOpt.get();
        Employee emp = user.getEmployee();

        if (body.containsKey("name")) emp.setFullName(body.get("name"));
        if (body.containsKey("phone")) emp.setPhone(body.get("phone"));
        if (body.containsKey("email")) {
            String newEmail = body.get("email").trim();
            if (!newEmail.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email này đã được sử dụng"));
            }
            user.setEmail(newEmail);
            emp.setPersonalEmail(newEmail);
        }
        if (body.containsKey("status")) {
            try {
                emp.setStatus(statusFromUi(body.get("status")));
            } catch (IllegalArgumentException ignored) {}
        }
        if (body.containsKey("role")) {
            emp.setRole(resolveEmployeeRole(body.get("role")));
        }
        employeeRepository.save(emp);
        userRepository.save(user);
        return ResponseEntity.ok(mapUserToOldStruct(user, null));
    }

    /** Soft-delete: deactivate staff account */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStaff(@PathVariable String id) {
        Optional<User> userOpt = userRepository.findById(UUID.fromString(id));
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Nhân viên không tìm thấy"));
        }
        User user = userOpt.get();
        Employee emp = user.getEmployee();
        emp.setStatus(EmployeeStatus.RESIGNED);
        employeeRepository.save(emp);
        return ResponseEntity.ok(Map.of("message", "Đã vô hiệu hoá tài khoản nhân viên " + emp.getFullName()));
    }

    private static EmployeeRole resolveEmployeeRole(String roleStr) {
        if (roleStr == null || roleStr.isBlank()) {
            return EmployeeRole.STAFF;
        }
        String normalized = roleStr.trim().toUpperCase();
        if ("MANAGER".equals(normalized) || "QUAN_LY".equals(normalized) || "QUẢN_LÝ".equalsIgnoreCase(roleStr.trim())) {
            return EmployeeRole.ADMIN;
        }
        try {
            return EmployeeRole.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            return EmployeeRole.STAFF;
        }
    }
}
