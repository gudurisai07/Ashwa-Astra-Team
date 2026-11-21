# Architecture

```
React (Vite, :5173) ──axios + JWT──▶ Spring Boot (:8080) ──JPA──▶ MySQL 8
                                         │
                                         └── Google Gen AI Java SDK ──▶ Gemini API
```
Layers (backend `com.smarthire`): `controller` (REST) → `service` (business rules, ownership checks) → `repository` (Spring Data JPA) → `entity`.
`service/ai` holds `GeminiClient` (SDK wrapper, error translation), `PromptBuilder` and `AiService` (orchestration, validation, persistence).
`security` + `config/SecurityConfig` provide stateless JWT auth and CORS. `exception` gives uniform JSON errors.

## AI flow
Resume PDF → PDFBox text (stored in `candidates.resume_text`) → prompt built from real resume/job text → Gemini (JSON mode) →
parsed + validated → saved (`resume_analysis`, `job_matches`, `interview_questions`) → returned to React.
The match percentage is recomputed server-side from the rubric parts (skills 50, experience 30, education 10, responsibilities 10).

## Authorization
- Public: `POST /api/auth/*`, `GET /api/jobs`, `GET /api/jobs/{id}`.
- Recruiter only: job create/update/delete, `/api/applications/recruiter`, status updates, `/api/analytics/recruiter`. Services verify ownership (recruiter owns the job).
- Candidate only: apply, upload resume, `/api/ai/**`, `/api/analytics/candidate`.
- Resume download: the candidate, or a recruiter who received an application from that candidate.

## Folder structure
```
SmartHire_AI_FullStack_Project/
├── backend/   pom.xml, src/main/java/com/smarthire/{config,controller,dto,entity,repository,service,service/ai,security,exception,util}, src/test, uploads/
├── frontend/  package.json, vite.config.js, src/{api,components,context,hooks,layouts,pages,routes,styles}
├── database/  schema.sql, data.sql, erd.md
├── docs/      SETUP.md, API.md, ARCHITECTURE.md
├── postman/   SmartHire_AI.postman_collection.json
├── README.md, PROJECT_STATUS.md, .gitignore
```
