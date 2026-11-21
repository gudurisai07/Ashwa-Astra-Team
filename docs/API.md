# REST API (base URL `http://localhost:8080/api`)
Auth header for protected endpoints: `Authorization: Bearer <token>`. Errors: `{ timestamp, status, error, message, details? }`.

| Method | Path | Role | Notes |
|---|---|---|---|
| POST | /auth/register | public | `{fullName,email,password(8+),role: CANDIDATE\|RECRUITER,companyName?}` → 201 + token. ADMIN rejected (400). Duplicate email 409 |
| POST | /auth/login | public | `{email,password}` → token, 401 on bad credentials |
| GET | /jobs | public | Query: `q`, `skill`, `maxExperience`. Only ACTIVE jobs |
| GET | /jobs/mine | recruiter | Own jobs incl. applicationCount |
| GET | /jobs/{id} | public | 404 if missing |
| POST | /jobs | recruiter | Validated body → 201 |
| PUT | /jobs/{id} | recruiter (owner) | 403 if not owner |
| DELETE | /jobs/{id} | recruiter (owner) | Soft delete (status CLOSED) → 204 |
| POST | /applications | candidate | `{jobId,coverNote?}`; needs resume; 409 if already applied → 201 |
| GET | /applications/my | candidate | |
| GET | /applications/recruiter | recruiter | Only applications for own jobs |
| PUT | /applications/{id}/status | recruiter (owner) | `{status: PENDING\|SHORTLISTED\|REJECTED}` |
| POST | /resumes/upload | candidate | multipart `file` (PDF, ≤5 MB) → 201 |
| GET | /resumes/my | candidate | Profile + resume metadata |
| PUT | /resumes/profile | candidate | `{phone,headline,location,experienceYears,skills}` |
| GET | /resumes/download/{candidateId} | owner or applied-to recruiter | PDF stream |
| POST | /ai/resume-analysis | candidate | Gemini; stored |
| POST | /ai/job-match/{jobId} | candidate | Gemini; stored |
| POST | /ai/interview-questions/{jobId} | candidate | Gemini; stored |
| POST | /ai/resume-improvement | candidate | Gemini; stored |
| GET | /ai/{resume-analysis\|resume-improvement}/latest, /ai/{job-match\|interview-questions}/{jobId}/latest | candidate | Stored result or 204 |
| GET | /analytics/candidate | candidate | |
| GET | /analytics/recruiter | recruiter | |

AI error codes: 503 key not configured · 429 quota/rate limit · 502 Gemini error/bad format/model unavailable · 504 timeout · 400 no resume uploaded.
