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
        Candidate any = candidateRepository.findAll().stream().findFirst().orElseThrow();
        currentUserService.setTestCandidate(any);

        byte[] pdfBytes;
        try (org.apache.pdfbox.pdmodel.PDDocument doc = new org.apache.pdfbox.pdmodel.PDDocument()) {
            org.apache.pdfbox.pdmodel.PDPage page = new org.apache.pdfbox.pdmodel.PDPage();
            doc.addPage(page);
            try (org.apache.pdfbox.pdmodel.PDPageContentStream cs = new org.apache.pdfbox.pdmodel.PDPageContentStream(doc, page)) {
                cs.beginText();
                cs.setFont(new org.apache.pdfbox.pdmodel.font.PDType1Font(org.apache.pdfbox.pdmodel.font.Standard14Fonts.FontName.HELVETICA), 12);
                cs.showText("John Doe - Software Engineer Resume");
                cs.endText();
            }
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            doc.save(baos);
            pdfBytes = baos.toByteArray();
        }

        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", pdfBytes);
        ResumeResponse resp = resumeService.upload(file);
        Assertions.assertTrue(resp.resumeUploaded());
    }
}
