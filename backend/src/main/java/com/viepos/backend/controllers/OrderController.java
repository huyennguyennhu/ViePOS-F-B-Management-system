package com.viepos.backend.controllers;

import com.viepos.backend.repositories.CardSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * OrderController cung cấp endpoint để tạo mã đơn hàng theo chuẩn:
 * - Lưu trong hệ thống: [STORE_CODE]-[YYMMDD]-[SEQUENCE] e.g. HCM01-260522-0001
 * - Hiển thị cho khách: chỉ phần [SEQUENCE] e.g. 0001
 */
@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class OrderController {

    @Autowired
    private CardSessionRepository cardSessionRepository;

    @Value("${store.code:HCM01}")
    private String storeCode;

    /**
     * Trả về mã đơn hàng tiếp theo cho ngày hôm nay.
     * Response: { "orderId": "HCM01-260522-0001", "displayId": "0001" }
     */
    @GetMapping("/next-id")
    public ResponseEntity<?> getNextOrderId() {
        // Format ngày: YYMMDD
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        // Prefix để đếm: HCM01-260522-
        String prefix = storeCode + "-" + datePart + "-";

        // Đếm số phiên đã tạo hôm nay bằng cách lọc orderId theo prefix
        long todayCount = cardSessionRepository.findAll().stream()
                .filter(s -> s.getOrderId() != null && s.getOrderId().startsWith(prefix))
                .count();

        // Sequence tiếp theo (bắt đầu từ 0001)
        long nextSeq = todayCount + 1;
        String sequence = String.format("%04d", nextSeq);
        String orderId = prefix + sequence;

        return ResponseEntity.ok(Map.of(
                "orderId", orderId,
                "displayId", sequence
        ));
    }
}
