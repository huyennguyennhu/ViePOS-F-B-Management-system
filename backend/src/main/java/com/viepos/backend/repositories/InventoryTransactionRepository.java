package com.viepos.backend.repositories;

import com.viepos.backend.models.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.viepos.backend.models.enums.TransactionType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, UUID> {
    Optional<InventoryTransaction> findByInvenTransactionId(String invenTransactionId);

    List<InventoryTransaction> findByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime from,
            LocalDateTime to
    );

    List<InventoryTransaction> findByCreatedAtBetweenAndTransactionTypeOrderByCreatedAtDesc(
            LocalDateTime from,
            LocalDateTime to,
            TransactionType type
    );
}
