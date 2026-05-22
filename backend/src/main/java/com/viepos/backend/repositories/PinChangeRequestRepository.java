package com.viepos.backend.repositories;

import com.viepos.backend.models.PinChangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import com.viepos.backend.models.PinChangeRequestStatus;

@Repository
public interface PinChangeRequestRepository extends JpaRepository<PinChangeRequest, String> {
    List<PinChangeRequest> findByUserIdOrderByCreatedAtDesc(String userId);
    List<PinChangeRequest> findByStatusOrderByCreatedAtDesc(PinChangeRequestStatus status);
    List<PinChangeRequest> findByStatusInOrderByCreatedAtDesc(List<PinChangeRequestStatus> statuses);
}
