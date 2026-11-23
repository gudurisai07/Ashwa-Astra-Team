package com.smarthire.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.smarthire.service.ai.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {
    private final AiService ai;

    public AiController(AiService ai) {
        this.ai = ai;
    }

    @PostMapping("/resume-analysis")
    public JsonNode analyze() {
        return ai.analyzeResume();
    }

    @PostMapping("/job-match/{jobId}")
    public JsonNode match(@PathVariable Long jobId) {
        return ai.matchJob(jobId);
    }

    @PostMapping("/interview-questions/{jobId}")
    public JsonNode interview(@PathVariable Long jobId) {
        return ai.interviewQuestions(jobId);
    }

    public record ResumeChatRequest(String message, String currentResumeText) {}

    @PostMapping("/resume-chat")
    public JsonNode resumeChat(@RequestBody ResumeChatRequest req) {
        return ai.chatEditResume(req.message(), req.currentResumeText());
    }

    @PostMapping("/resume-improvement")
    public JsonNode improve() {
        return ai.improveResume();
    }

    // Stored results (no Gemini call), so pages can show the last result on load.
    @GetMapping("/resume-analysis/latest")
    public ResponseEntity<JsonNode> latestAnalysis() {
        return ai.latestAnalysis().map(ResponseEntity::ok).orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/resume-improvement/latest")
    public ResponseEntity<JsonNode> latestImprovement() {
        return ai.latestImprovement().map(ResponseEntity::ok).orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/job-match/{jobId}/latest")
    public ResponseEntity<JsonNode> latestMatch(@PathVariable Long jobId) {
        return ai.latestMatch(jobId).map(ResponseEntity::ok).orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/interview-questions/{jobId}/latest")
    public ResponseEntity<JsonNode> latestInterview(@PathVariable Long jobId) {
        return ai.latestInterview(jobId).map(ResponseEntity::ok).orElse(ResponseEntity.noContent().build());
    }
}
