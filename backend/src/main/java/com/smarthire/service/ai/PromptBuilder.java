package com.smarthire.service.ai;

/** Builds prompts from real application data. Every prompt forbids use of protected personal characteristics. */
public final class PromptBuilder {
    private PromptBuilder() {}

    private static final String FAIRNESS = """
            Fairness rules: Evaluate only skills, experience, education relevant to the role and the quality of the resume.
            Never infer or use age, gender, ethnicity, nationality, religion, marital status, disability, photo or any other
            protected characteristic. This output is decision support for a human; never state that a person must be hired or rejected.
            Use only information present in the supplied text. If something is not present, say so instead of inventing it.
            Respond with a single valid JSON object only, no markdown fences.
            """;

    public static String resumeAnalysis(String resumeText) {
        return """
                You are an expert technical recruiter. Analyse the resume below.
                %s
                Return JSON with exactly these keys:
                {"summary": string, "technicalSkills": [string], "softSkills": [string],
                 "education": [string], "experience": [string],
                 "strengths": [string], "missingSkills": [string], "improvementSuggestions": [string],
                 "qualityScore": integer 0-100,
                 "scoreBreakdown": {"structureAndClarity": 0-25, "skillsEvidence": 0-25, "experienceImpact": 0-30, "educationAndCredentials": 0-10, "atsReadiness": 0-10}}
                qualityScore must equal the sum of scoreBreakdown values. Base each part only on what the resume shows.
                "missingSkills" means commonly expected skills for the candidate's apparent field that the resume does not mention.

                RESUME:
                %s
                """.formatted(FAIRNESS, resumeText);
    }

    public static String jobMatch(String resumeText, String title, String company, String description,
                                  String requiredSkills, int requiredExperience, int keywordCoveragePercent) {
        return """
                You are an expert technical recruiter. Compare the candidate resume with the job.
                %s
                Scoring rubric (score only against this job, total 100):
                - requiredSkills: 0-50  (share of the job's required skills with evidence in the resume)
                - experience: 0-30      (relevance and amount of experience compared with the %d years requested)
                - educationAndDomain: 0-10
                - responsibilitiesFit: 0-10 (overlap between past work and the job description)
                A deterministic keyword check found %d%% of the required skills mentioned verbatim in the resume; use it as a hint, not a final answer.
                Return JSON with exactly these keys:
                {"scoreBreakdown": {"requiredSkills": int, "experience": int, "educationAndDomain": int, "responsibilitiesFit": int},
                 "matchPercentage": integer (sum of scoreBreakdown),
                 "matchingSkills": [string], "missingSkills": [string], "relevantExperience": [string],
                 "suitabilityExplanation": string, "improvementSuggestions": [string]}

                JOB TITLE: %s
                COMPANY: %s
                REQUIRED SKILLS: %s
                JOB DESCRIPTION:
                %s

                RESUME:
                %s
                """.formatted(FAIRNESS, requiredExperience, keywordCoveragePercent, title, company, requiredSkills, description, resumeText);
    }

    public static String interviewQuestions(String title, String description, String candidateSkills, String resumeText) {
        return """
                You are an experienced interviewer preparing a candidate for an interview.
                %s
                Create interview preparation for the job below, tailored to the candidate's skills.
                Return JSON with exactly these keys:
                {"technical": [ {"question": string, "guidance": string} x5 ],
                 "hr": [ {"question": string, "guidance": string} x5 ],
                 "situational": [ {"question": string, "guidance": string} x5 ]}
                "guidance" is a suggested answer outline or evaluation guidance (2-4 sentences).

                JOB TITLE: %s
                JOB DESCRIPTION:
                %s
                CANDIDATE SKILLS: %s
                RESUME EXCERPT:
                %s
                """.formatted(FAIRNESS, title, description, candidateSkills, resumeText);
    }

    public static String resumeImprovement(String resumeText) {
        return """
                You are a professional resume writer who specialises in ATS-friendly resumes.
                %s
                Improve the resume below without inventing employers, dates, degrees, tools or achievements that are not in it.
                If a metric would help but is not provided, write a placeholder such as [add number] instead of making one up.
                Return JSON with exactly these keys:
                {"improvedSummary": string,
                 "improvedExperience": [ {"before": string, "after": string} ],
                 "skillsPresentation": {"recommendedLayout": string, "groupedSkills": [ {"category": string, "skills": [string]} ]},
                 "atsSuggestions": [string],
                 "beforeAfterExamples": [ {"before": string, "after": string, "why": string} ]}

                RESUME:
                %s
                """.formatted(FAIRNESS, resumeText);
    }
}
