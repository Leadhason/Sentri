package com.project.sentri.dto;

import lombok.Data;
import java.util.List;

@Data
public class DisputeRequest {
    private String reason;
    private List<String> evidenceUrls;
}
