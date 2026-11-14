package com.varma.aiinterviewplatform.service;

import com.varma.aiinterviewplatform.entity.TargetRole;
import com.varma.aiinterviewplatform.entity.User;
import com.varma.aiinterviewplatform.repository.TargetRoleRepository;
import com.varma.aiinterviewplatform.repository.UserRepository;

import org.springframework.stereotype.Service;

@Service
public class TargetRoleService {

    private final TargetRoleRepository targetRoleRepository;
    private final UserRepository userRepository;

    // Constructor injection for the required repositories.
    public TargetRoleService(
            TargetRoleRepository targetRoleRepository,
            UserRepository userRepository) {

        this.targetRoleRepository = targetRoleRepository;
        this.userRepository = userRepository;
    }

    // Save or update the target role for the logged-in user.
    public TargetRole saveTargetRole(String roleName, String email) {

        // Validate the role name before saving.
        if (roleName == null || roleName.isBlank()) {
            throw new RuntimeException("Target role cannot be empty.");
        }

        // Find the logged-in user using the email from JWT.
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));

        // Check whether the user already has a target role.
        TargetRole targetRole =
                targetRoleRepository.findByUser_Email(email)
                        .orElse(null);

        // If no target role exists, create a new record.
        if (targetRole == null) {
            targetRole = new TargetRole();
            targetRole.setUser(user);
        }

        // Save the selected role.
        targetRole.setRoleName(roleName.trim());

        return targetRoleRepository.save(targetRole);
    }

    // Get the current target role of the logged-in user.
    public TargetRole getMyTargetRole(String email) {

        return targetRoleRepository.findByUser_Email(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Target role not found. Please select your target role first."
                        )
                );
    }
}