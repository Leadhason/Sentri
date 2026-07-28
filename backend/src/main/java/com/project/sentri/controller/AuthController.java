package com.project.sentri.controller;

import com.project.sentri.dto.AuthSyncRequest;
import com.project.sentri.dto.AuthSyncResponse;
import com.project.sentri.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/sync")
    public ResponseEntity<AuthSyncResponse> syncUser(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody(required = false) AuthSyncRequest request) {
        
        UUID userId = UUID.fromString(jwt.getSubject());
        String email = jwt.getClaimAsString("email");
        AuthSyncRequest req = (request != null) ? request : new AuthSyncRequest();
        
        // If role is missing in request body, try reading from user_metadata in JWT claims
        if (req.getRole() == null || req.getRole().isBlank()) {
            Object metadataObj = jwt.getClaim("user_metadata");
            if (metadataObj instanceof java.util.Map<?, ?> metadata) {
                Object roleObj = metadata.get("role");
                if (roleObj instanceof String roleStr) {
                    req.setRole(roleStr);
                }
            }
        }

        AuthSyncResponse response = userService.syncUser(userId, email, req);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<AuthSyncResponse> getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        String email = jwt.getClaimAsString("email");
        AuthSyncResponse response = userService.syncUser(userId, email, new AuthSyncRequest());
        return ResponseEntity.ok(response);
    }
}
