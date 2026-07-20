package com.project.sentri.controller;

import com.project.sentri.dto.DocumentRejectionRequest;
import com.project.sentri.dto.DocumentRequest;
import com.project.sentri.dto.DocumentResponse;
import com.project.sentri.service.VerificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class DocumentController {

    private final VerificationService verificationService;

    public DocumentController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @PostMapping("/professionals/me/documents")
    public ResponseEntity<DocumentResponse> registerDocument(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody DocumentRequest request) {
        UUID professionalId = UUID.fromString(jwt.getSubject());
        DocumentResponse response = verificationService.registerDocument(professionalId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/professionals/me/documents")
    public ResponseEntity<List<DocumentResponse>> getOwnDocuments(@AuthenticationPrincipal Jwt jwt) {
        UUID professionalId = UUID.fromString(jwt.getSubject());
        List<DocumentResponse> response = verificationService.getOwnDocuments(professionalId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/documents/pending")
    public ResponseEntity<List<DocumentResponse>> getPendingDocuments() {
        List<DocumentResponse> response = verificationService.getPendingDocuments();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/documents/{id}")
    public ResponseEntity<DocumentResponse> getDocumentById(@PathVariable UUID id) {
        DocumentResponse response = verificationService.getDocumentById(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/admin/documents/{id}/approve")
    public ResponseEntity<DocumentResponse> approveDocument(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID adminId = UUID.fromString(jwt.getSubject());
        DocumentResponse response = verificationService.approveDocument(id, adminId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/admin/documents/{id}/reject")
    public ResponseEntity<DocumentResponse> rejectDocument(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody DocumentRejectionRequest request) {
        UUID adminId = UUID.fromString(jwt.getSubject());
        DocumentResponse response = verificationService.rejectDocument(id, adminId, request);
        return ResponseEntity.ok(response);
    }
}
