# Setup Guide

## 1. Database (MySQL 8)
Option A – automatic: the backend runs with `DDL_AUTO=update` (default) and creates/updates tables in `smarthire_db`
(the default JDBC URL has `createDatabaseIfNotExist=true`).

Option B – manual (MySQL Workbench or CLI):
```powershell
mysql -u root -p < database\schema.sql
```
Demo users are created by the backend on first start (so passwords are properly BCrypt-hashed). After that:
```powershell
mysql -u root -p < database\data.sql
```
`data.sql` inserts demo jobs and applications by looking up the demo users by email. If you run it before the first backend start, the INSERT … SELECT statements simply insert nothing.

## 2. Backend
```powershell
cd backend
$env:MYSQL_URL      = "jdbc:mysql://localhost:3306/smarthire_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:MYSQL_USERNAME = "root"
$env:MYSQL_PASSWORD = "your_password"
$env:JWT_SECRET     = "at-least-32-random-characters-long-string"
$env:GEMINI_API_KEY = "your_key"
$env:GEMINI_MODEL   = "gemini-3.8-flash"
mvn clean test
mvn spring-boot:run
```
To persist variables across sessions use `setx NAME "value"` and open a new terminal. Never commit real values.

## 3. Frontend
```powershell
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
```
If the backend is not on `http://localhost:8080`, copy `.env.example` to `.env` and set `VITE_API_URL`; also set `CORS_ORIGINS` on the backend.

## 4. Gemini configuration
1. Create a key at https://aistudio.google.com/apikey.
2. Set `GEMINI_API_KEY` (backend environment only) and optionally `GEMINI_MODEL`.
3. If the key is missing, AI endpoints return **503** with the message *"Gemini is not configured…"* – the UI shows it. No fake results are ever generated.
4. The default model name `gemini-3.8-flash` was taken from the project brief and could not be verified against the live API. If you get a "model not available" error, set `GEMINI_MODEL` to a model your key can use (check https://ai.google.dev/gemini-api/docs/models).
5. The backend uses the official `com.google.genai:google-genai` SDK (`client.models.generateContent` with JSON output). It does **not** use the newer Interactions API – see PROJECT_STATUS.md. Check the latest SDK version on Maven Central and update `google-genai.version` in `backend/pom.xml` if needed.

## 5. Troubleshooting
| Symptom | Fix |
|---|---|
| `Access denied for user` | Check `MYSQL_USERNAME` / `MYSQL_PASSWORD`. |
| `JWT_SECRET must be at least 32 characters` | Set a longer `JWT_SECRET` (or unset it to use the dev-only default). |
| Port 8080 in use | `$env:SERVER_PORT = "8081"` and set `VITE_API_URL` accordingly. |
| CORS error in browser | Set `CORS_ORIGINS` to your frontend origin. |
| 503 "Gemini is not configured" | Set `GEMINI_API_KEY`, restart the backend. |
| 429 from AI endpoints | Gemini quota/rate limit; wait or use another model/key. |
| 502 "model not available" | Change `GEMINI_MODEL`. |
| "No readable text found in this PDF" | Scanned/image PDFs are unsupported (no OCR). Upload a text-based PDF. |
| Cannot compile `com.google.genai` classes | SDK API changed; adjust `service/ai/GeminiClient.java` to the SDK version in your `pom.xml`. |
| Maven/npm cannot download | Check proxy/network; both need internet on first run. |
