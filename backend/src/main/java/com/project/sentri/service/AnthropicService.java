package com.project.sentri.service;

import tools.jackson.databind.json.JsonMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
public class AnthropicService {

    private final RestClient restClient;
    private final JsonMapper jsonMapper;

    @Value("${anthropic.api.key:}")
    private String apiKey;

    @Value("${anthropic.api.url:https://api.anthropic.com/v1/messages}")
    private String apiUrl;

    @Value("${anthropic.model:claude-3-5-sonnet-20241022}")
    private String model;

    public AnthropicService(JsonMapper jsonMapper) {
        this.jsonMapper = jsonMapper;
        this.restClient = RestClient.builder().build();
    }

    public String callClaude(String systemPrompt, String userMessage) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalStateException("Anthropic API key is not configured");
        }

        try {
            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "max_tokens", 4000,
                    "system", systemPrompt,
                    "messages", List.of(
                            Map.of("role", "user", "content", userMessage)
                    )
            );

            String requestJson = jsonMapper.writeValueAsString(requestBody);

            String responseJson = restClient.post()
                    .uri(apiUrl)
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestJson)
                    .retrieve()
                    .body(String.class);

            Map<String, Object> responseMap = jsonMapper.readValue(responseJson, Map.class);
            List<Map<String, Object>> contentList = (List<Map<String, Object>>) responseMap.get("content");
            if (contentList != null && !contentList.isEmpty()) {
                Map<String, Object> firstContent = contentList.get(0);
                return (String) firstContent.get("text");
            }
            throw new RuntimeException("Empty response from Claude API");
        } catch (Exception e) {
            throw new RuntimeException("Failed to call Claude API: " + e.getMessage(), e);
        }
    }

    public String callClaudeWithImage(String systemPrompt, String userPrompt, byte[] imageBytes, String mediaType) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalStateException("Anthropic API key is not configured");
        }

        try {
            String base64Data = Base64.getEncoder().encodeToString(imageBytes);
            
            Map<String, Object> imageSource = Map.of(
                    "type", "base64",
                    "media_type", mediaType,
                    "data", base64Data
            );
            
            Map<String, Object> imageContent = Map.of(
                    "type", "image",
                    "source", imageSource
            );
            
            Map<String, Object> textContent = Map.of(
                    "type", "text",
                    "text", userPrompt
            );

            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "max_tokens", 4000,
                    "system", systemPrompt,
                    "messages", List.of(
                            Map.of("role", "user", "content", List.of(imageContent, textContent))
                    )
            );

            String requestJson = jsonMapper.writeValueAsString(requestBody);

            String responseJson = restClient.post()
                    .uri(apiUrl)
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestJson)
                    .retrieve()
                    .body(String.class);

            Map<String, Object> responseMap = jsonMapper.readValue(responseJson, Map.class);
            List<Map<String, Object>> contentList = (List<Map<String, Object>>) responseMap.get("content");
            if (contentList != null && !contentList.isEmpty()) {
                Map<String, Object> firstContent = contentList.get(0);
                return (String) firstContent.get("text");
            }
            throw new RuntimeException("Empty response from Claude API");
        } catch (Exception e) {
            throw new RuntimeException("Failed to call Claude API with image: " + e.getMessage(), e);
        }
    }
}
