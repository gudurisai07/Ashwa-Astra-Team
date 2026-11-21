# SmartHire AI – Project Status

Generated: 2026-11-21. This file lists what exists and what was **actually executed**. Nothing here is claimed as passing unless it was run.

## Bottom line
The full source code, SQL scripts, docs and Postman collection are complete. **The application has not been compiled, started, or run end-to-end.**
The generation environment had no network access (Maven Central, npm registry and MySQL were unavailable), so dependency download, `mvn test`,
`npm run build`, database setup and live Gemini calls were impossible. Expect to fix a few small compile/runtime issues on your first run
(most likely in `GeminiClient.java`, see below). The first run on your machine is the real integration test.

## Completed (code written)
| Area | Status |
|---|---|
| Auth: candidate/recruiter registration, login, JWT, BCrypt, role rules, no public admin signup | Written |
| Role-protected routes (backend matchers + service-level ownership checks; frontend `ProtectedRoute`) | Written |
| Job management: create, update, soft-close, public search, skill + experience filters, recruiter "my jobs" | Written |
| Applications: apply (needs resume, duplicate-protected), candidate list, recruiter list (own jobs only), status update (owner only) | Written |
| Resume: PDF-only upload, 5 MB limit, `%PDF-` signature check, PDFBox text extraction, metadata in MySQL, authorized download | Written |
| Gemini features: resume analysis, job match (rubric, score recomputed server-side), interview questions (5/5/5), resume improvement; results stored in MySQL; stored results re-viewable | Written |
| Missing `GEMINI_API_KEY` → HTTP 503 with a clear message (no mock output anywhere) | Written |
| Gemini error mapping: quota (429), bad key / unavailable model / timeout / malformed output (502/504) | Written |
| Analytics endpoints + Recruiter dashboard (Recharts) + Candidate dashboard | Written |
| Premium dark-navy UI, responsive sidebar, loading/empty/error states, Three.js landing background (reduced-motion + WebGL fallback, `pointer-events: none`) | Written |
| MySQL: 7 tables (users, candidates, jobs, applications, resume_analysis, job_matches, interview_questions), FKs, unique email, indexes, timestamps | Written |
| `database/schema.sql`, `database/data.sql`, `database/erd.md` | Written |
| README, SETUP, ARCHITECTURE, API docs, Postman collection, demo logins, troubleshooting, PowerShell commands | Written |
| Unit tests (JWT, keyword coverage / prompt content, PDF text extraction) | Written, **not run** |

## Checks actually executed (and results)
| Check | Result |
|---|---|
| `mvn -o clean test` | **Could not run** – cannot download Spring Boot parent POM (no network). Not a code failure, not a pass. |
| `npm install` / `npm run build` | **Could not run** – npm registry unreachable. |
| `javac` syntax-only pass over all 43 Java files (dependency errors filtered) | **Passed** – no syntax errors reported. This does NOT prove the code compiles. |
| Java static consistency script (type name = file name, package = folder, braces balanced, every `com.smarthire.*` import resolves) | **Passed** – 43 types, 0 unresolved internal imports. |
| esbuild bundle of `src/main.jsx` with all internal imports resolved (npm packages marked external) | **Passed** – all JSX parses, all relative imports resolve. This is not a Vite build. |
| Frontend ↔ backend URL cross-check | **Passed** – 26/26 frontend API calls match a backend mapping; all 19 endpoints required in the brief exist. |
| Postman collection JSON validity | **Passed** |
| Secret scan (API-key patterns; `VITE_` usage) | **Passed** – no keys; the only `VITE_` variable is `VITE_API_URL`. |

## NOT tested (do these first)
1. `mvn clean test` and `mvn spring-boot:run` – never compiled against real dependencies.
2. `npm install && npm run build` – never built with Vite.
3. MySQL: `schema.sql` / `data.sql` never executed; JPA mappings never validated against a database.
4. Live Gemini calls – the whole AI path is unexercised. Prompt/response parsing is untested against real model output.
5. The 15-step end-to-end flow from the brief (register → apply → AI → recruiter status) was **not** run.
6. Postman requests, CORS in a browser, file upload/download through the UI, and the Three.js scene were not run.

## Known limitations / deviations
- **Gemini Interactions API not used.** The brief asked for it. I could not verify its Java SDK surface offline, so `GeminiClient` uses the stable `client.models.generateContent` with JSON output via the official `com.google.genai:google-genai` SDK. Swapping to Interactions would be confined to `GeminiClient.java`.
- **SDK version and API shape unverified.** `google-genai.version` in `pom.xml` (`1.0.0`) is a placeholder; check Maven Central for the current release. Builder calls in `GeminiClient` (`Client.builder().apiKey(..).httpOptions(HttpOptions.builder().timeout(..))`, `GenerateContentConfig.builder().responseMimeType(..).temperature(..)`) may need small adjustments for your SDK version.
- **Model name unverified.** `gemini-3.8-flash` comes from the brief; I could not confirm it exists for your key. Override with `GEMINI_MODEL`.
- **Demo users are created by Java at startup, not by `data.sql`.** No bcrypt tool was available to produce hashes safely; `DemoDataSeeder` hashes with the real encoder. Run `data.sql` after the first backend start. Demo applications inserted by `data.sql` have no resume file.
- PDF only (no DOCX, no OCR – scanned PDFs are rejected with a clear message).
- Resume text is truncated to 12,000 characters before being sent to Gemini.
- No refresh tokens; JWT lives 24 h (configurable). Token is stored in `localStorage` (standard SPA trade-off; XSS would expose it).
- Uploaded files are stored on local disk (`backend/uploads`), not object storage.
- No rate limiting on AI endpoints beyond Gemini's own quota; no admin UI.
- No automated frontend tests; backend tests cover only JWT, keyword coverage/prompt content and PDF extraction (no controller/DB tests).
- `JWT_SECRET` has a development-only default; **set your own** for anything non-local.

## Fairness / safety design
AI never changes application status or rejects anyone; recruiters decide. Prompts instruct the model not to use protected characteristics
(age, gender, ethnicity, nationality, religion, marital status, disability, photo) and to use only supplied text. The UI shows a decision-support disclaimer on every AI result.
