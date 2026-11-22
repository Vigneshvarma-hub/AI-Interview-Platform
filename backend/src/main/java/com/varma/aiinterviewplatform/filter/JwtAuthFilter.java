package com.varma.aiinterviewplatform.filter;

import com.varma.aiinterviewplatform.entity.User;
import com.varma.aiinterviewplatform.repository.UserRepository;
import com.varma.aiinterviewplatform.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Locale;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger logger =
            LoggerFactory.getLogger(JwtAuthFilter.class);

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

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7).trim();

        if (token.isBlank()) {
            SecurityContextHolder.clearContext();
            writeError(response, 401,
                    "Authentication token is missing.");
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
                writeError(response, 401,
                        "Invalid authentication token.");
                return;
            }

            User user = userRepository.findByEmail(email)
                    .orElse(null);

            if (user == null) {
                SecurityContextHolder.clearContext();
                writeError(response, 401,
                        "Authentication failed. Please log in again.");
                return;
            }

            // Reject tokens issued before a password reset or
            // another event that increments the user's token version.
            long tokenVersion = jwtService.extractTokenVersion(token);

            long currentTokenVersion = user.getTokenVersion() == null
                    ? 0L
                    : user.getTokenVersion();

            if (tokenVersion != currentTokenVersion) {
                SecurityContextHolder.clearContext();
                writeError(response, 401,
                        "Your session is no longer valid. Please log in again.");
                return;
            }

            if (!Boolean.TRUE.equals(user.getActive())) {
                SecurityContextHolder.clearContext();
                writeError(response, 403,
                        "Your account is deactivated.");
                return;
            }

            if (!Boolean.TRUE.equals(user.getEmailVerified())) {
                SecurityContextHolder.clearContext();
                writeError(response, 403,
                        "Please verify your email before accessing this resource.");
                return;
            }

            String role = user.getRole();

            if (role == null || role.isBlank()) {
                SecurityContextHolder.clearContext();
                writeError(response, 403,
                        "Your account does not have a valid role.");
                return;
            }

            String normalizedRole = role.trim()
                    .toUpperCase(Locale.ROOT);

            if (normalizedRole.startsWith("ROLE_")) {
                normalizedRole = normalizedRole.substring(5);
            }

            if (!normalizedRole.equals("USER")
                    && !normalizedRole.equals("ADMIN")) {

                SecurityContextHolder.clearContext();
                writeError(response, 403,
                        "Your account does not have an authorized role.");
                return;
            }

            String authority = "ROLE_" + normalizedRole;

            if (SecurityContextHolder.getContext()
                    .getAuthentication() == null) {

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

            logger.warn(
                    "JWT authentication failed for URI {}: {}",
                    request.getRequestURI(),
                    exception.getClass().getSimpleName()
            );

            if (!response.isCommitted()) {
                writeError(response, 401,
                        "Authentication failed. Please log in again.");
            }

            return;
        }

        filterChain.doFilter(request, response);
    }

    private void writeError(
            HttpServletResponse response,
            int status,
            String message) throws IOException {

        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Cache-Control", "no-store");

        response.getWriter().write(
                "{\"message\":\"" + message + "\"}"
        );
    }
}