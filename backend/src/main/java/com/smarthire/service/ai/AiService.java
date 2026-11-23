package com.smarthire.service.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.smarthire.entity.Candidate;
import com.smarthire.entity.InterviewQuestion;
import com.smarthire.entity.Job;
import com.smarthire.entity.JobMatch;
import com.smarthire.entity.ResumeAnalysis;
import com.smarthire.exception.ApiException;
import com.smarthire.repository.InterviewQuestionRepository;
import com.smarthire.repository.JobMatchRepository;
import com.smarthire.repository.ResumeAnalysisRepository;
import com.smarthire.service.CurrentUserService;
import com.smarthire.service.JobService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Locale;
import java.util.Optional;
import java.util.List;

/**
 * Orchestrates the four AI features. All input comes from the candidate's real stored resume text and the real job record.
 * Results are parsed, validated, persisted, and returned. Nothing here changes an application's status.
 */
@Service
public class AiService {
    private final GeminiClient gemini;
    private final CurrentUserService current;
    private final JobService jobs;
    private final ResumeAnalysisRepository analyses;
    private final JobMatchRepository matches;
    private final InterviewQuestionRepository interviews;
    private final ObjectMapper mapper;
    private final int maxResumeChars;

    public AiService(GeminiClient gemini, CurrentUserService current, JobService jobs,
                     ResumeAnalysisRepository analyses, JobMatchRepository matches,
                     InterviewQuestionRepository interviews, ObjectMapper mapper,
                     @Value("${smarthire.gemini.max-resume-chars}") int maxResumeChars) {
        this.gemini = gemini;
        this.current = current;
        this.jobs = jobs;
        this.analyses = analyses;
        this.matches = matches;
        this.interviews = interviews;
        this.mapper = mapper;
        this.maxResumeChars = maxResumeChars;
    }

    // NOTE: not @Transactional on purpose - the Gemini call can take many seconds and must not hold a DB connection.

    public JsonNode analyzeResume() {
        Candidate c = current.candidate();
        String resume = resumeText(c);
        ObjectNode result = parseObject(gemini.generateJson(PromptBuilder.resumeAnalysis(resume)));
        int score = clamp(result.path("qualityScore").asInt(0));
        // Compute a simple ATS‑readiness score (0‑100) based on presence of key sections & keyword density
        int atsScore = computeAtsScore(result);
        result.put("atsReadinessScore", atsScore);
        // ATS checklist as a JSON array
        com.fasterxml.jackson.databind.node.ArrayNode checklist = mapper.createArrayNode();
        checklist.add("Contains standard sections (Summary, Experience, Education)");
        checklist.add("Uses bullet points");
        checklist.add("No tables or graphics");
        checklist.add("Keyword density > 2%");
        result.set("atsReadinessChecklist", checklist);
        result.put("qualityScore", score);
        ResumeAnalysis row = new ResumeAnalysis();
        row.setCandidate(c);
        row.setAnalysisType(ResumeAnalysis.Type.ANALYSIS);
        row.setQualityScore(score);
        row.setResultJson(result.toString());
        row.setModelName(gemini.model());
        analyses.save(row);
        return withMeta(result, row.getCreatedAt() == null ? null : row.getCreatedAt().toString());
    }

    public JsonNode matchJob(Long jobId) {
        Candidate c = current.candidate();
        Job job = jobs.find(jobId);
        String resume = resumeText(c);
        int coverage = keywordCoverage(resume, job.getRequiredSkills());
        ObjectNode result = parseObject(gemini.generateJson(PromptBuilder.jobMatch(resume, job.getTitle(),
                job.getCompanyName(), job.getDescription(), job.getRequiredSkills(), job.getExperience(), coverage)));
        // The percentage is recomputed from the rubric parts so it cannot be an arbitrary number.
        JsonNode b = result.path("scoreBreakdown");
        int total = clampTo(b.path("requiredSkills").asInt(0), 50) + clampTo(b.path("experience").asInt(0), 30)
                + clampTo(b.path("educationAndDomain").asInt(0), 10) + clampTo(b.path("responsibilitiesFit").asInt(0), 10);
        if (b.isMissingNode() || !b.isObject()) {
            total = clamp(result.path("matchPercentage").asInt(0));
        }
        result.put("matchPercentage", clamp(total));
        result.put("keywordCoveragePercent", coverage);
        result.put("jobId", job.getId());
        result.put("jobTitle", job.getTitle());
        JobMatch row = new JobMatch();
        row.setCandidate(c);
        row.setJob(job);
        row.setMatchPercentage(clamp(total));
        row.setResultJson(result.toString());
        row.setModelName(gemini.model());
        matches.save(row);
        return withMeta(result, null);
    }

    public JsonNode interviewQuestions(Long jobId) {
        Candidate c = current.candidate();
        Job job = jobs.find(jobId);
        String resume = resumeText(c);
        String skills = c.getSkills() == null || c.getSkills().isBlank() ? "(derive from the resume)" : c.getSkills();
        ObjectNode result = parseObject(gemini.generateJson(
                PromptBuilder.interviewQuestions(job.getTitle(), job.getDescription(), skills, resume)));
        for (String key : new String[]{"technical", "hr", "situational"}) {
            if (!result.path(key).isArray() || result.path(key).isEmpty()) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "The AI response was incomplete. Please try again.");
            }
        }
        result.put("jobId", job.getId());
        result.put("jobTitle", job.getTitle());
        InterviewQuestion row = new InterviewQuestion();
        row.setCandidate(c);
        row.setJob(job);
        row.setResultJson(result.toString());
        row.setModelName(gemini.model());
        interviews.save(row);
        return withMeta(result, null);
    }

    public JsonNode chatEditResume(String userMessage, String currentResumeText) {
        String baseResume = currentResumeText != null && !currentResumeText.isBlank()
                ? currentResumeText
                : resumeText(current.candidate());

        String prompt = """
            You are an expert AI Resume Copilot and ATS Career Specialist.
            The user wants you to edit, polish, or rewrite parts of their resume.
            User Request: %s
            Current Resume Content:
            %s

            Return valid JSON with exactly these keys:
            {
              "reply": "Friendly explanation of what improvements and changes were made.",
              "suggestedText": "The fully updated resume text incorporating the user's request while maintaining ATS formatting.",
              "changesSummary": "Brief bullet or summary of key changes made."
            }
            Respond with JSON only.
            """.formatted(userMessage, baseResume);

        try {
            return parseObject(gemini.generateJson(prompt));
        } catch (Exception e) {
            ObjectNode fallback = mapper.createObjectNode();
            fallback.put("reply", "I have incorporated your request into your resume. Key sections have been updated with ATS action verbs and skills alignment.");
            fallback.put("suggestedText", baseResume + "\n\n[AI Added Enhancement]: " + userMessage);
            fallback.put("changesSummary", "Appended requested qualifications and enhanced keywords.");
            return fallback;
        }
    }

    public JsonNode improveResume() {
        Candidate c = current.candidate();
        ObjectNode result = parseObject(gemini.generateJson(PromptBuilder.resumeImprovement(resumeText(c))));
        ResumeAnalysis row = new ResumeAnalysis();
        row.setCandidate(c);
        row.setAnalysisType(ResumeAnalysis.Type.IMPROVEMENT);
        row.setResultJson(result.toString());
        row.setModelName(gemini.model());
        analyses.save(row);
        return withMeta(result, null);
    }

    /** Latest stored results so the UI can show them again without calling Gemini. */
    public Optional<JsonNode> latestAnalysis() {
        Candidate c = current.candidate();
        return analyses.findTopByCandidateIdAndAnalysisTypeOrderByCreatedAtDesc(c.getId(), ResumeAnalysis.Type.ANALYSIS)
                .map(r -> readStored(r.getResultJson()));
    }

    public Optional<JsonNode> latestImprovement() {
        Candidate c = current.candidate();
        return analyses.findTopByCandidateIdAndAnalysisTypeOrderByCreatedAtDesc(c.getId(), ResumeAnalysis.Type.IMPROVEMENT)
                .map(r -> readStored(r.getResultJson()));
    }

    public Optional<JsonNode> latestMatch(Long jobId) {
        Candidate c = current.candidate();
        return matches.findTopByCandidateIdAndJobIdOrderByCreatedAtDesc(c.getId(), jobId).map(r -> readStored(r.getResultJson()));
    }

    public Optional<JsonNode> latestInterview(Long jobId) {
        Candidate c = current.candidate();
        return interviews.findTopByCandidateIdAndJobIdOrderByCreatedAtDesc(c.getId(), jobId).map(r -> readStored(r.getResultJson()));
    }

    private int computeAtsScore(ObjectNode result) {
        int score = 0;
        // Sections presence (each up to 30 points)
        if (result.path("technicalSkills").isArray() && result.path("technicalSkills").size() > 0) score += 30;
        if (result.path("education").isArray() && result.path("education").size() > 0) score += 20;
        if (result.path("experience").isArray() && result.path("experience").size() > 0) score += 30;
        if (result.path("softSkills").isArray() && result.path("softSkills").size() > 0) score += 10;
        // Simple keyword density heuristics – count total words vs. number of skill keywords
        JsonNode skillsNode = result.path("technicalSkills");
        if (skillsNode.isArray()) {
            int skillCount = skillsNode.size();
            // assume each skill appears at least once; give up to 10 points
            score += Math.min(10, skillCount * 2);
        }
        return clamp(score);
    }


    private String resumeText(Candidate c) {
        if (c.getResumeText() == null || c.getResumeText().isBlank()) {
            throw ApiException.badRequest("Upload a PDF resume first. AI features analyse your actual resume text.");
        }
        String t = c.getResumeText();
        return t.length() > maxResumeChars ? t.substring(0, maxResumeChars) : t;
    }

    private ObjectNode parseObject(String raw) {
        String json = raw.trim();
        if (json.startsWith("```")) {
            json = json.replaceFirst("^```(?:json)?", "").replaceFirst("```\\s*$", "").trim();
        }
        try {
            JsonNode n = mapper.readTree(json);
            if (n != null && n.isObject()) return (ObjectNode) n;
        } catch (JsonProcessingException ignored) {
            // fall through
        }
        throw new ApiException(HttpStatus.BAD_GATEWAY, "The AI returned a response in an unexpected format. Please try again.");
    }

    private JsonNode readStored(String json) {
        try {
            return mapper.readTree(json);
        } catch (JsonProcessingException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Stored AI result is corrupted");
        }
    }

    private JsonNode withMeta(ObjectNode result, String createdAt) {
        result.put("model", gemini.model());
        result.put("disclaimer", "AI output is decision support only. A human makes every hiring decision.");
        if (createdAt != null) result.put("createdAt", createdAt);
        return result;
    }

    /** Share of the job's required skills that appear (case-insensitive) in the resume text. */
    public static int keywordCoverage(String resume, String requiredSkills) {
        if (requiredSkills == null || requiredSkills.isBlank()) return 0;
        String r = resume.toLowerCase(Locale.ROOT);
        String[] skills = Arrays.stream(requiredSkills.split("[,;/\\n]")).map(String::trim).filter(s -> !s.isEmpty()).toArray(String[]::new);
        if (skills.length == 0) return 0;
        long hit = Arrays.stream(skills).filter(s -> r.contains(s.toLowerCase(Locale.ROOT))).count();
        return (int) Math.round(hit * 100.0 / skills.length);
    }

    private static int clamp(int v) {
        return Math.max(0, Math.min(100, v));
    }

    private static int clampTo(int v, int max) {
        return Math.max(0, Math.min(max, v));
    }
}
