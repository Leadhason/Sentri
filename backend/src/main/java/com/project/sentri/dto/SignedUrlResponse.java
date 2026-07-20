package com.project.sentri.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SignedUrlResponse {
    private String uploadUrl;
    private String publicUrl;
}
