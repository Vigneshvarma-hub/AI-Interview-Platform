
package com.varma.aiinterviewplatform.filter;

import com.varma.aiinterviewplatform.entity.User;
import com.varma.aiinterviewplatform.repository.UserRepository;
import com.varma.aiinterviewplatform.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthFilter(
            JwtService jwtService,
            UserRepository userRepository) {

        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // No token: let Spring Security handle authentication.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7).trim();

        if (token.isBlank()) {
            writeError(response, 401, "Authentication token is missing.");
            return;
        }

        try {
            if (!jwtService.isTokenValid(token)) {
                SecurityContextHolder.clearContext();
                writeError(response, 401,
                        "Your session has expired. Please log in again.");
                return;
            }

            String email = jwtService.extractEmail(token);

            if (email == null || email.isBlank()) {
                SecurityContextHolder.clearContext();
                writeError(response, 401, "Invalid authentication token.");
                return;
            }

            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                SecurityContextHolder.clearContext();
                writeError(response, 401, "User account was not found.");
                return;
            }

            if (!Boolean.TRUE.equals(user.getActive())) {
                SecurityContextHolder.clearContext();
                writeError(response, 403,
                        "Your account is deactivated. Please contact the administrator.");
                return;
            }

            String role = user.getRole();

            if (role == null || role.isBlank()) {
                SecurityContextHolder.clearContext();
                writeError(response, 403,
                        "Your account does not have an assigned role.");
                return;
            }

            String authority = role.startsWith("ROLE_")
                    ? role
                    : "ROLE_" + role;

            if (SecurityContextHolder.getContext().getAuthentication() == null) {

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                Collections.singletonList(
                                        new SimpleGrantedAuthority(authority)
                                )
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );

                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);
            }

        } catch (Exception exception) {

            SecurityContextHolder.clearContext();

            System.err.println(
                    "JWT authentication failed: "
                            + exception.getClass().getSimpleName()
            );

            if (!response.isCommitted()) {
                writeError(response, 401,
                        "Authentication failed. Please log in again.");
            }
            return;
        }

        // Important: execute the remaining security chain OUTSIDE the try-catch.
        filterChain.doFilter(request, response);
    }

    private void writeError(
            HttpServletResponse response,
            int status,
            String message) throws IOException {

        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        response.getWriter().write(
                "{\"message\":\"" + message + "\"}"
        );
    }
}
