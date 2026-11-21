# SmartHire AI - Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o| CANDIDATES : "has profile (role=CANDIDATE)"
    USERS ||--o{ JOBS : "posts (role=RECRUITER)"
    CANDIDATES ||--o{ APPLICATIONS : submits
    JOBS ||--o{ APPLICATIONS : receives
    CANDIDATES ||--o{ RESUME_ANALYSIS : "analysis / improvement"
    CANDIDATES ||--o{ JOB_MATCHES : has
    JOBS ||--o{ JOB_MATCHES : "scored against"
    CANDIDATES ||--o{ INTERVIEW_QUESTIONS : has
    JOBS ||--o{ INTERVIEW_QUESTIONS : "generated for"

    USERS { bigint id PK
            varchar email UK
            varchar password "BCrypt"
            varchar role
            varchar full_name
            varchar company_name }
    CANDIDATES { bigint id PK
            bigint user_id FK,UK
            varchar skills
            int experience_years
            varchar resume_path
            longtext resume_text }
    JOBS { bigint id PK
            bigint recruiter_id FK
            varchar title
            text description
            varchar required_skills
            int experience
            varchar status }
    APPLICATIONS { bigint id PK
            bigint candidate_id FK
            bigint job_id FK
            varchar status
            varchar resume_path }
    RESUME_ANALYSIS { bigint id PK
            bigint candidate_id FK
            varchar analysis_type
            int quality_score
            longtext result_json }
    JOB_MATCHES { bigint id PK
            bigint candidate_id FK
            bigint job_id FK
            int match_percentage
            longtext result_json }
    INTERVIEW_QUESTIONS { bigint id PK
            bigint candidate_id FK
            bigint job_id FK
            longtext result_json }
```

## Notes
- `users.email` is unique. Public registration only creates `CANDIDATE` or `RECRUITER`; `ADMIN` exists in the enum but cannot be self-registered.
- `applications` has a unique pair (`candidate_id`, `job_id`) so a candidate can apply to a job only once.
- Jobs are never hard-deleted by the API: `DELETE /api/jobs/{id}` sets `status = CLOSED` so application history is preserved.
- `resume_analysis.analysis_type` is `ANALYSIS` (quality score + findings) or `IMPROVEMENT` (rewrite suggestions).
- Every table has `created_at`; mutable tables also have `updated_at`.
