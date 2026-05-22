package com.viepos.backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pin_reset_requests")
public class PinResetRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String newPin;

    @Enumerated(EnumType.STRING)
    private PinChangeRequestStatus status = PinChangeRequestStatus.PENDING;

    private LocalDateTime createdAt = LocalDateTime.now();

    public PinResetRequest() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getNewPin() { return newPin; }
    public void setNewPin(String newPin) { this.newPin = newPin; }

    public PinChangeRequestStatus getStatus() { return status; }
    public void setStatus(PinChangeRequestStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
