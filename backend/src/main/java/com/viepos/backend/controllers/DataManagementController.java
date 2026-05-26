package com.viepos.backend.controllers;

import com.viepos.backend.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class DataManagementController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private InventoryTransactionRepository inventoryTransactionRepository;

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    @Autowired
    private ServiceSessionRepository serviceSessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private com.viepos.backend.repositories.EmployeeRepository employeeRepository;

    @GetMapping("/data-range")
    public ResponseEntity<?> getDataRange(@RequestParam(value = "module", defaultValue = "all_transactions") String module) {
        LocalDateTime minDate = null;
        LocalDateTime maxDate = null;

        if ("orders".equals(module) || "all_transactions".equals(module)) {
            LocalDateTime oMin = orderRepository.findEarliestCreatedAt();
            LocalDateTime oMax = orderRepository.findLatestCreatedAt();
            if (oMin != null && (minDate == null || oMin.isBefore(minDate))) minDate = oMin;
            if (oMax != null && (maxDate == null || oMax.isAfter(maxDate))) maxDate = oMax;
        }

        if ("inventory".equals(module) || "all_transactions".equals(module)) {
            LocalDateTime iMin = inventoryTransactionRepository.findEarliestCreatedAt();
            LocalDateTime iMax = inventoryTransactionRepository.findLatestCreatedAt();
            if (iMin != null && (minDate == null || iMin.isBefore(minDate))) minDate = iMin;
            if (iMax != null && (maxDate == null || iMax.isAfter(maxDate))) maxDate = iMax;
        }

        if ("sessions".equals(module) || "all_transactions".equals(module)) {
            LocalDateTime sMin = serviceSessionRepository.findEarliestStartedAt();
            LocalDateTime sMax = serviceSessionRepository.findLatestStartedAt();
            if (sMin != null && (minDate == null || sMin.isBefore(minDate))) minDate = sMin;
            if (sMax != null && (maxDate == null || sMax.isAfter(maxDate))) maxDate = sMax;
        }

        if ("resigned_staff".equals(module) || "all_transactions".equals(module)) {
            java.time.LocalDate eMin = employeeRepository.findEarliestResignedEndDate();
            java.time.LocalDate eMax = employeeRepository.findLatestResignedEndDate();
            if (eMin != null) {
                LocalDateTime eMinDt = eMin.atStartOfDay();
                if (minDate == null || eMinDt.isBefore(minDate)) minDate = eMinDt;
            }
            if (eMax != null) {
                LocalDateTime eMaxDt = eMax.atTime(23, 59, 59);
                if (maxDate == null || eMaxDt.isAfter(maxDate)) maxDate = eMaxDt;
            }
        }
        
        // Return using a HashMap to avoid NPE with null values
        Map<String, String> response = new java.util.HashMap<>();
        response.put("minDate", minDate != null ? minDate.toString() : null);
        response.put("maxDate", maxDate != null ? maxDate.toString() : null);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/data")
    @Transactional
    public ResponseEntity<?> deleteData(
            @RequestParam("module") String module,
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        try {
            if ("orders".equals(module) || "all_transactions".equals(module)) {
                List<UUID> orderIds = orderRepository.findIdsByCreatedAtBetween(startDate, endDate);
                if (!orderIds.isEmpty()) {
                    // Clear foreign key references in ServiceSessions first to prevent constraint violations
                    serviceSessionRepository.clearOrderReferences(startDate, endDate);
                    
                    orderItemRepository.deleteByOrderIdIn(orderIds);
                    paymentRepository.deleteByOrderIdIn(orderIds);
                    orderRepository.deleteByCreatedAtBetween(startDate, endDate);
                }
            }

            if ("inventory".equals(module) || "all_transactions".equals(module)) {
                List<UUID> transactionIds = inventoryTransactionRepository.findIdsByCreatedAtBetween(startDate, endDate);
                if (!transactionIds.isEmpty()) {
                    inventoryItemRepository.deleteByInventoryTransactionIdIn(transactionIds);
                    inventoryTransactionRepository.deleteByCreatedAtBetween(startDate, endDate);
                }
            }

            if ("sessions".equals(module) || "all_transactions".equals(module)) {
                // To delete sessions cleanly, we detach orders first
                orderRepository.clearSessionReferences(startDate, endDate);
                serviceSessionRepository.deleteByStartedAtBetween(startDate, endDate);
            }

            if ("resigned_staff".equals(module)) {
                // Find resigned employees in the date range (endDate)
                List<UUID> employeeIds = employeeRepository.findIdsByStatusAndEndDateBetween(
                        com.viepos.backend.models.enums.EmployeeStatus.RESIGNED,
                        startDate.toLocalDate(),
                        endDate.toLocalDate()
                );

                if (!employeeIds.isEmpty()) {
                    try {
                        userRepository.deleteByEmployeeIdIn(employeeIds);
                        employeeRepository.deleteByIdIn(employeeIds);
                    } catch (org.springframework.dao.DataIntegrityViolationException ex) {
                        return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT)
                            .body(Map.of("message", "Không thể xóa một số nhân viên vì họ đã phát sinh giao dịch trong hệ thống. Hệ thống đã huỷ thao tác để đảm bảo an toàn dữ liệu."));
                    }
                }
                return ResponseEntity.ok(Map.of("message", "Đã xóa " + employeeIds.size() + " nhân viên đã nghỉ."));
            }

            return ResponseEntity.ok(Map.of("message", "Dữ liệu rác đã được xóa thành công."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi xóa dữ liệu: " + e.getMessage()));
        }
    }

    @GetMapping("/export/zip")
    public ResponseEntity<byte[]> exportDataZip(
            @RequestParam(value = "startDate", required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(value = "endDate", required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            String dateStr = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss"));

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ZipOutputStream zos = new ZipOutputStream(baos);

            // Export Orders
            List<com.viepos.backend.models.Order> orders;
            if (startDate != null && endDate != null) {
                orders = orderRepository.findAll().stream()
                        .filter(o -> o.getCreatedAt() != null && !o.getCreatedAt().isBefore(startDate) && !o.getCreatedAt().isAfter(endDate))
                        .toList();
            } else {
                orders = orderRepository.findAll();
            }
            StringBuilder ordersCsv = new StringBuilder("ID,Order Code,Subtotal,Discount,Tax,Total,Status,Created At\n");
            for (com.viepos.backend.models.Order o : orders) {
                ordersCsv.append(String.format("%s,%s,%s,%s,%s,%s,%s,%s\n",
                        o.getId(), o.getOrderCode(), o.getSubtotalAmount(), o.getDiscountAmount(),
                        o.getTaxAmount(), o.getTotalAmount(), o.getStatus(), o.getCreatedAt()));
            }
            addCsvToZip(zos, "orders_export.csv", ordersCsv.toString());
            
            // Export Inventory
            List<com.viepos.backend.models.InventoryTransaction> invTransactions;
            if (startDate != null && endDate != null) {
                invTransactions = inventoryTransactionRepository.findAll().stream()
                        .filter(it -> !it.getCreatedAt().isBefore(startDate) && !it.getCreatedAt().isAfter(endDate))
                        .toList();
            } else {
                invTransactions = inventoryTransactionRepository.findAll();
            }
            StringBuilder invCsv = new StringBuilder("ID,Transaction Code,Type,Reference ID,Created At\n");
            for (com.viepos.backend.models.InventoryTransaction it : invTransactions) {
                invCsv.append(String.format("%s,%s,%s,%s,%s\n",
                        it.getId(), it.getInvenTransactionId(), it.getTransactionType(),
                        it.getReferenceId(), it.getCreatedAt()));
            }
            addCsvToZip(zos, "inventory_export.csv", invCsv.toString());

            // Export Staff
            List<com.viepos.backend.models.User> users = userRepository.findAll();
            StringBuilder staffCsv = new StringBuilder("ID,Employee ID,Name,Email,Phone,Role,Status,Created At\n");
            for (com.viepos.backend.models.User u : users) {
                com.viepos.backend.models.Employee emp = u.getEmployee();
                if (emp != null) {
                    staffCsv.append(String.format("%s,%s,%s,%s,%s,%s,%s,%s\n",
                            u.getId(), emp.getEmployeeId(), emp.getFullName(), u.getEmail(), emp.getPhone(),
                            emp.getRole(), emp.getStatus(), u.getCreatedAt()));
                }
            }
            addCsvToZip(zos, "staff_export.csv", staffCsv.toString());
            
            // Export Products
            List<com.viepos.backend.models.Product> products;
            if (startDate != null && endDate != null) {
                products = productRepository.findAll().stream()
                        .filter(p -> p.getCreatedAt() != null && !p.getCreatedAt().isBefore(startDate) && !p.getCreatedAt().isAfter(endDate))
                        .toList();
            } else {
                products = productRepository.findAll();
            }
            StringBuilder productCsv = new StringBuilder("ID,Code,Name,Takeaway Price,Stock,Active\n");
            for (com.viepos.backend.models.Product p : products) {
                productCsv.append(String.format("%s,%s,%s,%s,%s,%s\n",
                        p.getId(), p.getProductCode(), p.getName(), p.getPriceTakeaway(), p.getCurrentStock(), p.getIsActive()));
            }
            addCsvToZip(zos, "products_export.csv", productCsv.toString());

            zos.close();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "ViePOS_Data_Export_" + dateStr + ".zip");

            return new ResponseEntity<>(baos.toByteArray(), headers, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private void addCsvToZip(ZipOutputStream zos, String filename, String content) throws Exception {
        ZipEntry entry = new ZipEntry(filename);
        zos.putNextEntry(entry);
        zos.write(content.getBytes("UTF-8"));
        zos.closeEntry();
    }
}
