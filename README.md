# SmartHire AI – AI-Powered Smart Recruitment & Talent Management

React + Vite frontend · Spring Boot 3 (Java 21) backend · MySQL 8 · Google Gemini (official Google Gen AI Java SDK).
All AI calls go through Spring Boot; the Gemini key never reaches the browser.

> **Honest status:** see [PROJECT_STATUS.md](PROJECT_STATUS.md) for exactly what was and was not tested. Short version: the code was written
> and statically checked, but it has **not** been compiled, run against MySQL, or run against the live Gemini API in the environment where it was generated.

## Features
- Candidate / recruiter registration, login, JWT, BCrypt, role-protected routes (no public admin signup)
- Job management (create, edit, close, search, skill and experience filters)
- PDF resume upload (type, size and `%PDF-` signature checks), PDFBox text extraction, authorized download
- Gemini features: resume analysis, job matching (rubric-based score), interview questions, resume improvement – results stored in MySQL
- Candidate and recruiter dashboards with Recharts analytics; Three.js landing background (reduced-motion + WebGL fallback)

## Prerequisites (Windows)
Java 21, Maven 3.9+, Node.js 20+, MySQL 8 (+ MySQL Workbench optional), a Gemini API key from https://aistudio.google.com/apikey

## Quick start (PowerShell)
```powershell
# 1. Database (either let Spring create tables, or run the scripts)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS smarthire_db"
# optional manual schema:  mysql -u root -p < database\schema.sql

# 2. Backend – set environment variables for THIS PowerShell window only
cd backend
$env:MYSQL_USERNAME = "root"
$env:MYSQL_PASSWORD = "your_mysql_password"
$env:JWT_SECRET     = "replace-with-a-long-random-string-at-least-32-chars"
$env:GEMINI_API_KEY = "your_gemini_key"
$env:GEMINI_MODEL   = "gemini-3.8-flash"
mvn spring-boot:run

# 3. Optional demo jobs/applications (after the backend has started once, which creates the demo users)
mysql -u root -p < ..\database\data.sql

# 4. Frontend (new PowerShell window)
cd frontend
npm install
npm run dev
```
Open http://localhost:5173. Backend: http://localhost:8080.

## Demo logins (synthetic accounts, created on first backend start)
| Role | Email | Password |
|---|---|---|
| Recruiter | recruiter1@smarthire.demo | Password@123 |
| Recruiter | recruiter2@smarthire.demo | Password@123 |
| Candidate | candidate1@smarthire.demo | Password@123 |
| Candidate | candidate2@smarthire.demo | Password@123 |

Disable seeding with `$env:SEED_DEMO_USERS = "false"`. Change these passwords for anything beyond a demo.

## Documentation
- [docs/SETUP.md](docs/SETUP.md) – database, backend, frontend and Gemini setup, troubleshooting
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) – architecture and folder structure
- [docs/API.md](docs/API.md) – REST API reference
- [database/erd.md](database/erd.md) – ER diagram
- [postman/SmartHire_AI.postman_collection.json](postman/SmartHire_AI.postman_collection.json) – import into Postman

## Security notes
- Secrets come only from environment variables; `.env` files are git-ignored, `.env.example` has placeholders.
- No `VITE_` variable holds a secret. The frontend only knows `VITE_API_URL`.
- AI output is decision support. The AI never changes application status; recruiters decide. Prompts forbid use of protected characteristics.
