package com.viepos.backend.repositories;

import com.viepos.backend.models.ServiceCard;
import com.viepos.backend.models.enums.CardStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ServiceCardRepository extends JpaRepository<ServiceCard, UUID> {
    Optional<ServiceCard> findByCardCode(String cardCode);
    Optional<ServiceCard> findByRfidUid(String rfidUid);
    List<ServiceCard> findByStatus(CardStatus status);
}
