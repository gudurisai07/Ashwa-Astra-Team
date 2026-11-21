package com.smarthire.service;

import com.smarthire.dto.ProfileDtos.ResumeResponse;
import com.smarthire.entity.Candidate;
import com.smarthire.repository.CandidateRepository;
import com.smarthire.repository.ApplicationRepository;
import com.smarthire.service.CurrentUserService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;

import java.io.FileInputStream;
import java.nio.file.Path;
import java.nio.file.Paths;

@SpringBootTest
public class ResumeServiceUploadTest {

    @Autowired
    private ResumeService resumeService;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private CurrentUserService currentUserService;

    @Test
    public void testUploadValidPdf() throws Exception {
        // Ensure a candidate is logged in (use first candidate)
        Candidate any = candidateRepository.findAll().stream().findFirst().orElseThrow();
        currentUserService.setTestCandidate(any); // assuming a method for test, else skip
        Path pdfPath = Paths.get("C:/Users/asus0/Downloads/SmartHire_Recuriment/SmartHire_Recuriment/test.pdf");
        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", new FileInputStream(pdfPath.toFile()));
        ResumeResponse resp = resumeService.upload(file);
        Assertions.assertTrue(resp.resumeUploaded());
    }
}
