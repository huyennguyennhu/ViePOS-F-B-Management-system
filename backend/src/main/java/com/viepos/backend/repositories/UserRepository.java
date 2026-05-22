package com.viepos.backend.repositories;

import com.viepos.backend.models.User;
import com.viepos.backend.models.Role;
import com.viepos.backend.models.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    List<User> findByRoleAndStatus(Role role, UserStatus status);
    List<User> findByRole(Role role);
    List<User> findByRoleAndStatusNot(Role role, UserStatus status);
}
