package com.smarthire.service;

import com.smarthire.dto.ProfileDtos.ProfileRequest;
import com.smarthire.dto.ProfileDtos.ResumeResponse;
import com.smarthire.entity.Candidate;
import com.smarthire.entity.User;
import com.smarthire.exception.ApiException;
import com.smarthire.repository.ApplicationRepository;
import com.smarthire.repository.CandidateRepository;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

@Service
public class ResumeService {
    private final CandidateRepository candidates;
    private final ApplicationRepository applications;
    private final CurrentUserService current;
    private final Path uploadRoot;
    private final long maxBytes;

    public ResumeService(CandidateRepository candidates, ApplicationRepository applications, CurrentUserService current,
                         @Value("${smarthire.upload-dir}") String uploadDir,
                         @Value("${smarthire.max-resume-bytes}") long maxBytes) {
        this.candidates = candidates;
        this.applications = applications;
        this.current = current;
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.maxBytes = maxBytes;
    }

    @Transactional
    public ResumeResponse upload(MultipartFile file) {
        Candidate c = current.candidate();
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("Please choose a PDF file to upload");
        }
        if (file.getSize() > maxBytes) {
            throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "File is too large. Maximum allowed size is 5 MB.");
        }
        String original = file.getOriginalFilename() == null ? "resume.pdf" : Paths.get(file.getOriginalFilename()).getFileName().toString();
        if (!original.toLowerCase(Locale.ROOT).endsWith(".pdf")) {
            throw ApiException.badRequest("Only PDF resumes are supported");
        }
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw ApiException.badRequest("Could not read the uploaded file");
        }
        // Validate content, not just the filename: real PDFs start with %PDF-
        if (bytes.length < 5 || bytes[0] != '%' || bytes[1] != 'P' || bytes[2] != 'D' || bytes[3] != 'F' || bytes[4] != '-') {
            throw ApiException.badRequest("The file is not a valid PDF");
        }
        String text = extractText(bytes);
        if (text.isBlank()) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "No readable text found in this PDF. Scanned/image-only PDFs are not supported yet.");
        }
        try {
            Path dir = uploadRoot.resolve("candidate-" + c.getId());
            Files.createDirectories(dir);
            Path target = dir.resolve(UUID.randomUUID() + ".pdf").normalize();
            if (!target.startsWith(uploadRoot)) {
                throw ApiException.badRequest("Invalid file path");
            }
            Files.write(target, bytes);
            deleteQuietly(c.getResumePath(), true);
            c.setResumePath(uploadRoot.relativize(target).toString());
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store the resume file");
        }
        c.setResumeFileName(original);
        c.setResumeContentType("application/pdf");
        c.setResumeSizeBytes((long) bytes.length);
        c.setResumeText(text);
        c.setResumeUploadedAt(LocalDateTime.now());
        return toResponse(candidates.save(c));
    }

    @Transactional(readOnly = true)
    public ResumeResponse mine() {
        return toResponse(current.candidate());
    }

    @Transactional
    public ResumeResponse updateProfile(ProfileRequest req) {
        Candidate c = current.candidate();
        c.setPhone(req.phone());
        c.setHeadline(req.headline());
        c.setLocation(req.location());
        c.setExperienceYears(req.experienceYears());
        c.setSkills(req.skills());
        return toResponse(candidates.save(c));
    }

    /** Candidates may download their own resume; recruiters only for candidates who applied to one of their jobs. */
    @Transactional(readOnly = true)
    public ResumeFile download(Long candidateId) {
        User u = current.user();
        Candidate c = candidates.findById(candidateId).orElseThrow(() -> ApiException.notFound("Candidate not found"));
        boolean owner = u.getRole() == User.Role.CANDIDATE && c.getUser().getId().equals(u.getId());
        boolean recruiter = u.getRole() == User.Role.RECRUITER
                && applications.existsByCandidateIdAndJobRecruiterId(c.getId(), u.getId());
        if (!owner && !recruiter) {
            throw ApiException.forbidden("You are not allowed to download this resume");
        }
        if (c.getResumePath() == null) {
            throw ApiException.notFound("No resume uploaded");
        }
        Path file = uploadRoot.resolve(c.getResumePath()).normalize();
        if (!file.startsWith(uploadRoot) || !Files.exists(file)) {
            throw ApiException.notFound("Resume file not found on server");
        }
        return new ResumeFile(new FileSystemResource(file), c.getResumeFileName());
    }

    public record ResumeFile(Resource resource, String fileName) {}

    public static String extractText(byte[] pdf) {
        try (PDDocument doc = Loader.loadPDF(pdf)) {
            String t = new PDFTextStripper().getText(doc);
            return t == null ? "" : t.replaceAll("[ \\t]+", " ").replaceAll("\\n{3,}", "\n\n").trim();
        } catch (IOException e) {
            throw ApiException.badRequest("The PDF could not be read. It may be corrupted or password protected.");
        }
    }

    private void deleteQuietly(String relative, boolean ignore) {
        if (relative == null) return;
        try {
            Path p = uploadRoot.resolve(relative).normalize();
            if (p.startsWith(uploadRoot)) Files.deleteIfExists(p);
        } catch (IOException ignored) {
            // best effort
        }
    }

    private ResumeResponse toResponse(Candidate c) {
        return new ResumeResponse(c.getId(), c.getUser().getFullName(), c.getUser().getEmail(), c.getPhone(),
                c.getHeadline(), c.getLocation(), c.getExperienceYears(), c.getSkills(),
                c.getResumePath() != null, c.getResumeFileName(), c.getResumeSizeBytes(),
                c.getResumeText() == null ? 0 : c.getResumeText().length(), c.getResumeUploadedAt());
    }
}
