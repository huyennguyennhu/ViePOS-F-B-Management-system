package com.viepos.backend.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "pin_change_requests")
public class PinChangeRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    private String newPin;
    
    @Enumerated(EnumType.STRING)
    private PinChangeRequestStatus status = PinChangeRequestStatus.PENDING;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PreUpdate
    public void setPreUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
