
package com.varma.aiinterviewplatform.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore
    private String password;

    private String role;

    // Existing account status.
    @Column(nullable = false, columnDefinition = "boolean default true")
    private Boolean active = true;

    // Existing email-verification status.
    @Column(nullable = false, columnDefinition = "boolean default true")
    private Boolean emailVerified = false;

    // Subscription plan: FREE, TRIAL, or PREMIUM.
    // New users start on the Free plan.
    @Column(nullable = false, columnDefinition = "varchar(20) default 'FREE'")
    private String subscriptionPlan = "FREE";

    // Records whether the user has already used the free trial.
    // This helps prevent repeated trials for the same account.
    @Column(nullable = false, columnDefinition = "boolean default false")
    private Boolean trialUsed = false;

    // Trial start and expiry timestamps.
    // These remain null until the user starts a trial.
    private LocalDateTime trialStartDate;
    private LocalDateTime trialEndDate;

    // Paid subscription start and expiry timestamps.
    // These remain null until a paid subscription is activated.
    private LocalDateTime subscriptionStartDate;
    private LocalDateTime subscriptionEndDate;

    public User() {
    }

    public User(String name, String email, String password, String role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;

        // Preserve existing account defaults.
        this.active = true;
        this.emailVerified = false;

        // Initialize new users with no paid subscription or trial.
        this.subscriptionPlan = "FREE";
        this.trialUsed = false;
    }

    // Existing user ID accessors.
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // Existing name accessors.
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // Existing email accessors.
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    // Existing password accessors.
    // @JsonIgnore prevents the password from being serialized in JSON.
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    // Existing role accessors.
    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    // Existing account-status accessors.
    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    // Existing email-verification accessors.
    public Boolean getEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(Boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    // Subscription plan accessors.
    public String getSubscriptionPlan() {
        return subscriptionPlan;
    }

    public void setSubscriptionPlan(String subscriptionPlan) {
        this.subscriptionPlan = subscriptionPlan;
    }

    // Free-trial usage accessors.
    public Boolean getTrialUsed() {
        return trialUsed;
    }

    public void setTrialUsed(Boolean trialUsed) {
        this.trialUsed = trialUsed;
    }

    // Trial start-time accessors.
    public LocalDateTime getTrialStartDate() {
        return trialStartDate;
    }

    public void setTrialStartDate(LocalDateTime trialStartDate) {
        this.trialStartDate = trialStartDate;
    }

    // Trial expiry-time accessors.
    public LocalDateTime getTrialEndDate() {
        return trialEndDate;
    }

    public void setTrialEndDate(LocalDateTime trialEndDate) {
        this.trialEndDate = trialEndDate;
    }

    // Paid subscription start-time accessors.
    public LocalDateTime getSubscriptionStartDate() {
        return subscriptionStartDate;
    }

    public void setSubscriptionStartDate(LocalDateTime subscriptionStartDate) {
        this.subscriptionStartDate = subscriptionStartDate;
    }

    // Paid subscription expiry-time accessors.
    public LocalDateTime getSubscriptionEndDate() {
        return subscriptionEndDate;
    }

    public void setSubscriptionEndDate(LocalDateTime subscriptionEndDate) {
        this.subscriptionEndDate = subscriptionEndDate;
    }
}
