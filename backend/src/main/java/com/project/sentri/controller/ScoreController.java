package com.project.sentri.controller;

import com.project.sentri.dto.ScoreBreakdownResponse;
import com.project.sentri.dto.ScoreReviewResponse;
import com.project.sentri.service.BehavioralScoreService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ScoreController {

    private final BehavioralScoreService behavioralScoreService;

    public ScoreController(BehavioralScoreService behavioralScoreService) {
        this.behavioralScoreService = behavioralScoreService;
    }

    @GetMapping("/professionals/me/score")
    public ResponseEntity<ScoreBreakdownResponse> getOwnScore(@AuthenticationPrincipal Jwt jwt) {
        UUID professionalId = UUID.fromString(jwt.getSubject());
        ScoreBreakdownResponse response = behavioralScoreService.getScoreBreakdown(professionalId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/professionals/{id}/score-history")
    public ResponseEntity<List<ScoreReviewResponse>> getScoreHistory(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        // Enforce admin check if needed (or through Spring Security configuration)
        List<ScoreReviewResponse> response = behavioralScoreService.getScoreHistory(id);
        return ResponseEntity.ok(response);
    }
}
