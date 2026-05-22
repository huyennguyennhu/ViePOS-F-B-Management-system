package com.viepos.backend.repositories;

import com.viepos.backend.models.PinResetRequest;
import com.viepos.backend.models.PinChangeRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PinResetRequestRepository extends JpaRepository<PinResetRequest, String> {
    List<PinResetRequest> findByStatusOrderByCreatedAtDesc(PinChangeRequestStatus status);
    List<PinResetRequest> findByStatusInOrderByCreatedAtDesc(List<PinChangeRequestStatus> statuses);
}
