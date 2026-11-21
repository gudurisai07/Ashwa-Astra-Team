package com.smarthire.controller;

import com.smarthire.service.AnalyticsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {
    private final AnalyticsService analytics;

    public AnalyticsController(AnalyticsService analytics) {
        this.analytics = analytics;
    }

    @GetMapping("/candidate")
    public Map<String, Object> candidate() {
        return analytics.candidate();
    }

    @GetMapping("/recruiter")
    public Map<String, Object> recruiter() {
        return analytics.recruiter();
    }
}
