package com.viepos.backend.repositories;

import com.viepos.backend.models.ServiceSession;
import com.viepos.backend.models.enums.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ServiceSessionRepository extends JpaRepository<ServiceSession, UUID> {
    Optional<ServiceSession> findBySessionCode(String sessionCode);
    Optional<ServiceSession> findByCard_IdAndStatus(UUID cardId, SessionStatus status);
    List<ServiceSession> findByStatusOrderByStartedAtDesc(SessionStatus status);
}
