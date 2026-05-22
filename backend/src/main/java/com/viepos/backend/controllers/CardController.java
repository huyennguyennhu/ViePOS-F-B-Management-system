package com.viepos.backend.controllers;

import com.viepos.backend.models.Card;
import com.viepos.backend.models.CardSession;
import com.viepos.backend.repositories.CardRepository;
import com.viepos.backend.repositories.CardSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cards")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class CardController {

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private CardSessionRepository cardSessionRepository;

    // Lấy tất cả các thẻ
    @GetMapping
    public ResponseEntity<List<Card>> getAllCards() {
        return ResponseEntity.ok(cardRepository.findAll());
    }

    // Lấy danh sách thẻ trống (trạng thái "trống")
    @GetMapping("/free")
    public ResponseEntity<List<Card>> getFreeCards() {
        List<Card> freeCards = cardRepository.findAll().stream()
                .filter(c -> "trống".equalsIgnoreCase(c.getStatus()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(freeCards);
    }

    // Bắt đầu một phiên sử dụng thẻ mới
    @PostMapping("/session")
    public ResponseEntity<?> startSession(@RequestBody Map<String, String> payload) {
        String cardNumber = payload.get("cardNumber");
        String orderId = payload.get("orderId");
        String duration = payload.get("duration"); // "4h" hoặc "all_day" (mặc định "all_day")

        Optional<Card> cardOpt = cardRepository.findByCardNumber(cardNumber);
        if (!cardOpt.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không tìm thấy thẻ có số " + cardNumber));
        }

        Card card = cardOpt.get();
        if (!"trống".equalsIgnoreCase(card.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Thẻ này không trống. Trạng thái hiện tại: " + card.getStatus()));
        }

        // Cập nhật trạng thái thẻ
        card.setStatus("Đang sử dụng");
        cardRepository.save(card);

        // Tính toán thời gian bắt đầu và kết thúc dự kiến
        LocalDateTime startTime = LocalDateTime.now();
        LocalDateTime endTime = "4h".equalsIgnoreCase(duration) ? startTime.plusHours(4) : startTime.withHour(22).withMinute(0).withSecond(0);

        CardSession session = new CardSession(null, card, startTime, endTime, orderId, "Đang sử dụng");
        CardSession savedSession = cardSessionRepository.save(session);

        return ResponseEntity.ok(savedSession);
    }

    // Giải phóng thẻ khi trả thẻ
    @PostMapping("/release/{cardNumber}")
    public ResponseEntity<?> releaseCard(@PathVariable String cardNumber) {
        Optional<Card> cardOpt = cardRepository.findByCardNumber(cardNumber);
        if (!cardOpt.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không tìm thấy thẻ có số " + cardNumber));
        }

        Card card = cardOpt.get();
        card.setStatus("trống");
        cardRepository.save(card);

        // Tìm phiên đang sử dụng của thẻ này để đóng
        List<CardSession> activeSessions = cardSessionRepository.findByCardCardNumberAndStatus(cardNumber, "Đang sử dụng");

        for (CardSession session : activeSessions) {
            session.setStatus("Hoàn thành");
            session.setActualEndTime(LocalDateTime.now());
            cardSessionRepository.save(session);
        }

        return ResponseEntity.ok(Map.of("message", "Giải phóng thẻ " + cardNumber + " thành công!"));
    }

    // Lấy tất cả các phiên sử dụng thẻ
    @GetMapping("/sessions")
    public ResponseEntity<List<CardSession>> getAllSessions(@RequestParam(required = false) Boolean activeOnly) {
        if (Boolean.TRUE.equals(activeOnly)) {
            return ResponseEntity.ok(cardSessionRepository.findByStatusNot("Hoàn thành"));
        }
        return ResponseEntity.ok(cardSessionRepository.findAll());
    }

    // Cập nhật trạng thái thẻ trực tiếp
    @PostMapping("/{cardNumber}/status")
    public ResponseEntity<?> updateCardStatus(@PathVariable String cardNumber, @RequestBody Map<String, String> payload) {
        String newStatus = payload.get("status");
        Optional<Card> cardOpt = cardRepository.findByCardNumber(cardNumber);
        if (!cardOpt.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không tìm thấy thẻ có số " + cardNumber));
        }
        Card card = cardOpt.get();
        card.setStatus(newStatus);
        cardRepository.save(card);
        return ResponseEntity.ok(card);
    }
    
    // Gia hạn thời gian phiên
    @PutMapping("/session/{cardNumber}/extend")
    public ResponseEntity<?> extendSession(@PathVariable String cardNumber, @RequestBody Map<String, String> payload) {
        String newEndTimeStr = payload.get("newEndTime");
        if (newEndTimeStr == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Thiếu newEndTime"));
        }

        List<CardSession> activeSessions = cardSessionRepository.findByCardCardNumberAndStatus(cardNumber, "Đang sử dụng");
        if (activeSessions.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không tìm thấy phiên đang hoạt động cho thẻ " + cardNumber));
        }

        CardSession session = activeSessions.get(0);
        try {
            LocalDateTime newEndTime = LocalDateTime.parse(newEndTimeStr);
            session.setEndTime(newEndTime);
            cardSessionRepository.save(session);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Định dạng ngày giờ không hợp lệ"));
        }
    }
}