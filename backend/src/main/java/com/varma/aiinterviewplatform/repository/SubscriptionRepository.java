
package com.varma.aiinterviewplatform.repository;

import com.varma.aiinterviewplatform.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubscriptionRepository
        extends JpaRepository<Subscription, Long> {

    List<Subscription> findByUser_IdOrderByCreatedAtDesc(Long userId);

    Optional<Subscription> findFirstByUser_IdOrderByCreatedAtDesc(
            Long userId
    );

    Optional<Subscription> findByProviderSubscriptionId(
            String providerSubscriptionId
    );

    boolean existsByProviderSubscriptionId(
            String providerSubscriptionId
    );
}
