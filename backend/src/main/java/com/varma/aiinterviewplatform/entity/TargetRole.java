package com.varma.aiinterviewplatform.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "target_roles")
public class TargetRole {

    // Primary key of the target role record.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Job role selected by the candidate.
    // Examples: Java Developer, Backend Developer, Full Stack Developer.
    @Column(nullable = false)
    private String roleName;

    // Each target role belongs to one user.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Default constructor required by JPA.
    public TargetRole() {
    }

    // Constructor for creating a target role.
    public TargetRole(String roleName, User user) {
        this.roleName = roleName;
        this.user = user;
    }

    // Returns target role ID.
    public Long getId() {
        return id;
    }

    // Sets target role ID.
    public void setId(Long id) {
        this.id = id;
    }

    // Returns selected role name.
    public String getRoleName() {
        return roleName;
    }

    // Sets selected role name.
    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

    // Returns the user associated with this role.
    public User getUser() {
        return user;
    }

    // Sets the user associated with this role.
    public void setUser(User user) {
        this.user = user;
    }
}