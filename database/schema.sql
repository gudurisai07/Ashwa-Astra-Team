-- SmartHire AI - MySQL 8 schema (MySQL Workbench compatible)
-- Optional: Spring Boot can also create tables automatically (DDL_AUTO=update). Use this script for a manual setup.
CREATE DATABASE IF NOT EXISTS smarthire_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smarthire_db;

CREATE TABLE IF NOT EXISTS users (
  id            BIGINT NOT NULL AUTO_INCREMENT,
  full_name     VARCHAR(150) NOT NULL,
  email         VARCHAR(190) NOT NULL,
  password      VARCHAR(100) NOT NULL,
  role          VARCHAR(20)  NOT NULL,
  company_name  VARCHAR(150) NULL,
  created_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email),
  CONSTRAINT chk_users_role CHECK (role IN ('CANDIDATE','RECRUITER','ADMIN'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS candidates (
  id                   BIGINT NOT NULL AUTO_INCREMENT,
  user_id              BIGINT NOT NULL,
  phone                VARCHAR(30)  NULL,
  headline             VARCHAR(200) NULL,
  location             VARCHAR(150) NULL,
  experience_years     INT NULL,
  skills               VARCHAR(1000) NULL,
  resume_file_name     VARCHAR(255) NULL,
  resume_path          VARCHAR(400) NULL,
  resume_content_type  VARCHAR(100) NULL,
  resume_size_bytes    BIGINT NULL,
  resume_text          LONGTEXT NULL,
  resume_uploaded_at   DATETIME(6) NULL,
  created_at           DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at           DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uk_candidates_user (user_id),
  KEY idx_candidates_user (user_id),
  CONSTRAINT fk_candidates_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS jobs (
  id               BIGINT NOT NULL AUTO_INCREMENT,
  title            VARCHAR(200) NOT NULL,
  company_name     VARCHAR(200) NOT NULL,
  description      TEXT NOT NULL,
  required_skills  VARCHAR(1000) NOT NULL,
  experience       INT NOT NULL,
  salary_range     VARCHAR(100) NULL,
  location         VARCHAR(150) NOT NULL,
  employment_type  VARCHAR(30)  NOT NULL,
  recruiter_id     BIGINT NOT NULL,
  status           VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  created_at       DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at       DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_jobs_status (status),
  KEY idx_jobs_title (title),
  KEY idx_jobs_recruiter (recruiter_id),
  CONSTRAINT fk_jobs_recruiter FOREIGN KEY (recruiter_id) REFERENCES users (id),
  CONSTRAINT chk_jobs_status CHECK (status IN ('ACTIVE','CLOSED'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS applications (
  id               BIGINT NOT NULL AUTO_INCREMENT,
  candidate_id     BIGINT NOT NULL,
  job_id           BIGINT NOT NULL,
  status           VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  cover_note       VARCHAR(1000) NULL,
  resume_file_name VARCHAR(255) NULL,
  resume_path      VARCHAR(400) NULL,
  created_at       DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at       DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uk_application_candidate_job (candidate_id, job_id),
  KEY idx_applications_status (status),
  KEY idx_applications_job (job_id),
  CONSTRAINT fk_applications_candidate FOREIGN KEY (candidate_id) REFERENCES candidates (id) ON DELETE CASCADE,
  CONSTRAINT fk_applications_job FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE,
  CONSTRAINT chk_applications_status CHECK (status IN ('PENDING','SHORTLISTED','REJECTED'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS resume_analysis (
  id             BIGINT NOT NULL AUTO_INCREMENT,
  candidate_id   BIGINT NOT NULL,
  analysis_type  VARCHAR(20) NOT NULL,
  quality_score  INT NULL,
  result_json    LONGTEXT NOT NULL,
  model_name     VARCHAR(100) NULL,
  created_at     DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_resume_analysis_candidate (candidate_id),
  CONSTRAINT fk_resume_analysis_candidate FOREIGN KEY (candidate_id) REFERENCES candidates (id) ON DELETE CASCADE,
  CONSTRAINT chk_resume_analysis_type CHECK (analysis_type IN ('ANALYSIS','IMPROVEMENT'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS job_matches (
  id                BIGINT NOT NULL AUTO_INCREMENT,
  candidate_id      BIGINT NOT NULL,
  job_id            BIGINT NOT NULL,
  match_percentage  INT NOT NULL,
  result_json       LONGTEXT NOT NULL,
  model_name        VARCHAR(100) NULL,
  created_at        DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_job_matches_candidate (candidate_id),
  KEY idx_job_matches_job (job_id),
  CONSTRAINT fk_job_matches_candidate FOREIGN KEY (candidate_id) REFERENCES candidates (id) ON DELETE CASCADE,
  CONSTRAINT fk_job_matches_job FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS interview_questions (
  id            BIGINT NOT NULL AUTO_INCREMENT,
  candidate_id  BIGINT NOT NULL,
  job_id        BIGINT NOT NULL,
  result_json   LONGTEXT NOT NULL,
  model_name    VARCHAR(100) NULL,
  created_at    DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_interview_candidate (candidate_id),
  KEY idx_interview_job (job_id),
  CONSTRAINT fk_interview_candidate FOREIGN KEY (candidate_id) REFERENCES candidates (id) ON DELETE CASCADE,
  CONSTRAINT fk_interview_job FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE
) ENGINE=InnoDB;
