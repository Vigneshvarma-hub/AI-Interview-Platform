package com.varma.aiinterviewplatform.repository;

import com.varma.aiinterviewplatform.entity.TargetRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TargetRoleRepository extends JpaRepository<TargetRole, Long> {

    // Find the target role belonging to the logged-in user.
    Optional<TargetRole> findByUser_Email(String email);
}