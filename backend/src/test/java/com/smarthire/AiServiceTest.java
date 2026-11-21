package com.smarthire;

import com.smarthire.service.ai.AiService;
import com.smarthire.service.ai.PromptBuilder;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AiServiceTest {
    @Test
    void keywordCoverageCountsOnlySkillsPresentInResume() {
        String resume = "Built REST APIs with Java and Spring Boot. Used MySQL daily.";
        assertEquals(75, AiService.keywordCoverage(resume, "Java, Spring Boot, MySQL, Kubernetes"));
        assertEquals(0, AiService.keywordCoverage(resume, "Rust, Go"));
        assertEquals(0, AiService.keywordCoverage(resume, ""));
    }

    @Test
    void promptsContainRealDataAndFairnessRules() {
        String p = PromptBuilder.jobMatch("RESUME-TEXT-XYZ", "Backend Engineer", "Acme", "JOB-DESC-ABC", "Java, SQL", 3, 50);
        assertTrue(p.contains("RESUME-TEXT-XYZ"));
        assertTrue(p.contains("JOB-DESC-ABC"));
        assertTrue(p.contains("protected characteristic"));
        assertTrue(p.contains("decision support"));
    }
}
