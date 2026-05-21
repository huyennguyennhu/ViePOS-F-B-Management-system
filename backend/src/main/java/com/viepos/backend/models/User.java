package com.viepos.backend.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private String name;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    private String password;
    
    @Enumerated(EnumType.STRING)
    private Role role = Role.STAFF;

    private String phone;

    @Enumerated(EnumType.STRING)
    private UserStatus status = UserStatus.PENDING;

    private boolean emailVerified = false;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PreUpdate
    public void setPreUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
