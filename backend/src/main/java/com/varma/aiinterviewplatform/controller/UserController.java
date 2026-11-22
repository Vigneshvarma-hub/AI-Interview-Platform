
package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.dto.UserProfileResponse;
import com.varma.aiinterviewplatform.service.UserService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserProfileResponse getCurrentUser(
            Authentication authentication) {
        return userService.getUserByEmail(authentication.getName());

    }
}
