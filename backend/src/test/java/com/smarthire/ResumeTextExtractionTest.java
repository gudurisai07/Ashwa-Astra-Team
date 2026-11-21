package com.smarthire;

import com.smarthire.exception.ApiException;
import com.smarthire.service.ResumeService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;

import static org.junit.jupiter.api.Assertions.*;

class ResumeTextExtractionTest {
    @Test
    void extractsTextFromPdf() throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                cs.newLineAtOffset(50, 700);
                cs.showText("Java Spring Boot developer");
                cs.endText();
            }
            doc.save(out);
        }
        assertTrue(ResumeService.extractText(out.toByteArray()).contains("Spring Boot"));
    }

    @Test
    void rejectsCorruptPdf() {
        assertThrows(ApiException.class, () -> ResumeService.extractText("%PDF-not really".getBytes()));
    }
}
