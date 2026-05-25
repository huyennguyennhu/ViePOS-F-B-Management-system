package com.viepos.backend.repositories;

import com.viepos.backend.models.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, UUID> {
    Optional<Employee> findByEmployeeId(String employeeId);
    Optional<Employee> findByPersonalEmail(String personalEmail);
    Optional<Employee> findByPhone(String phone);
    boolean existsByEmployeeId(String employeeId);
    boolean existsByPersonalEmail(String personalEmail);
    boolean existsByPhone(String phone);
}
