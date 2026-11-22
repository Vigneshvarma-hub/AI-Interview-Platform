
package com.varma.aiinterviewplatform.service;

import com.varma.aiinterviewplatform.dto.UserProfileResponse;
import com.varma.aiinterviewplatform.entity.User;
import com.varma.aiinterviewplatform.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getUserByEmail(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getEmailVerified(),

                user.getSubscriptionPlan(),
                user.getTrialUsed(),

                user.getTrialStartDate(),
                user.getTrialEndDate(),

                user.getSubscriptionStartDate(),
                user.getSubscriptionEndDate()
        );
    }
}
