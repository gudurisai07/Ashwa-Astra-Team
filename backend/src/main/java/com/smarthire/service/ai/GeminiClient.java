package com.smarthire.service.ai;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.HttpOptions;
import com.smarthire.exception.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/**
 * Thin wrapper around the official Google Gen AI Java SDK. The API key is read only from the
 * environment (GEMINI_API_KEY) on the server; it is never sent to the browser.
 * If the key is missing a clear configuration error is returned - no mock output is ever produced.
 */
@Component
public class GeminiClient {
    private static final Logger log = LoggerFactory.getLogger(GeminiClient.class);

    private final String apiKey;
    private final String model;
    private final int timeoutMs;
    private volatile Client client;

    public GeminiClient(@Value("${smarthire.gemini.api-key:}") String apiKey,
                        @Value("${smarthire.gemini.model}") String model,
                        @Value("${smarthire.gemini.timeout-ms}") int timeoutMs) {
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.model = model;
        this.timeoutMs = timeoutMs;
    }

    public String model() {
        return model;
    }

    public boolean isConfigured() {
        return !apiKey.isBlank();
    }

    /** Sends the prompt to Gemini and returns the raw JSON text of the response. */
    public String generateJson(String prompt) {
        if (!isConfigured()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Gemini is not configured. Set the GEMINI_API_KEY environment variable on the backend and restart it.");
        }
        try {
            GenerateContentConfig config = GenerateContentConfig.builder()
                    .responseMimeType("application/json")
                    .temperature(0.2f)
                    .build();
            GenerateContentResponse response = client().models.generateContent(model, prompt, config);
            String text = response.text();
            if (text == null || text.isBlank()) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "Gemini returned an empty response. Please try again.");
            }
            return text;
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw translate(e);
        }
    }

    private Client client() {
        Client c = client;
        if (c == null) {
            synchronized (this) {
                if (client == null) {
                    client = Client.builder()
                            .apiKey(apiKey)
                            .httpOptions(HttpOptions.builder().timeout(timeoutMs).build())
                            .build();
                }
                c = client;
            }
        }
        return c;
    }

    private ApiException translate(Exception e) {
        String msg = String.valueOf(e.getMessage()).toLowerCase();
        log.warn("Gemini call failed: {}", e.getClass().getSimpleName());
        if (msg.contains("429") || msg.contains("quota") || msg.contains("resource_exhausted") || msg.contains("rate")) {
            return new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Gemini quota or rate limit reached. Please wait a moment and try again.");
        }
        if (msg.contains("api key") || msg.contains("401") || msg.contains("403") || msg.contains("permission") || msg.contains("unauthenticated")) {
            return new ApiException(HttpStatus.BAD_GATEWAY, "Gemini rejected the API key. Check GEMINI_API_KEY.");
        }
        if (msg.contains("404") || msg.contains("not found") || msg.contains("model")) {
            return new ApiException(HttpStatus.BAD_GATEWAY, "Gemini model '" + model + "' is not available for this key. Change GEMINI_MODEL.");
        }
        if (msg.contains("timeout") || msg.contains("timed out")) {
            return new ApiException(HttpStatus.GATEWAY_TIMEOUT, "Gemini took too long to respond. Please try again.");
        }
        return new ApiException(HttpStatus.BAD_GATEWAY, "The AI service failed to process this request. Please try again.");
    }
}
