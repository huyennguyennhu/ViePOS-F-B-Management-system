package com.viepos.backend.repositories;

import com.viepos.backend.models.CardSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CardSessionRepository extends JpaRepository<CardSession, Long> {
    List<CardSession> findByStatus(String status);
    List<CardSession> findByCardCardNumberAndStatus(String cardNumber, String status);
    List<CardSession> findByStatusNot(String status);
}
