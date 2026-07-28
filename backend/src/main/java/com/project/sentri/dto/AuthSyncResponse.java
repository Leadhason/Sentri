package com.project.sentri.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthSyncResponse {
    private UUID id;
    private String email;
    private String fullName;
    private String phone;
    private String role;
    private OffsetDateTime createdAt;
}
