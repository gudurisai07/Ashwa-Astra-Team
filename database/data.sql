-- SmartHire AI - synthetic demo data (no real people). Run AFTER schema.sql.
--
-- IMPORTANT: demo USERS are created by the backend on first start (DemoDataSeeder) so that their
-- passwords are hashed with the real BCrypt encoder. Start the backend once, then run this script.
-- It looks users up by email, so it is safe to run more than once for jobs (guarded by NOT EXISTS).
USE smarthire_db;

INSERT INTO jobs (title, company_name, description, required_skills, experience, salary_range, location, employment_type, recruiter_id, status)
SELECT 'Java Full Stack Developer', 'Northwind Technologies',
       'Build and maintain REST APIs with Spring Boot and React front ends. Work with MySQL, write unit tests, and collaborate in an agile team.',
       'Java, Spring Boot, React, MySQL, REST', 2, 'INR 8-14 LPA', 'Hyderabad', 'Full-time', u.id, 'ACTIVE'
FROM users u WHERE u.email = 'recruiter1@smarthire.demo'
  AND NOT EXISTS (SELECT 1 FROM jobs j WHERE j.title = 'Java Full Stack Developer' AND j.recruiter_id = u.id);

INSERT INTO jobs (title, company_name, description, required_skills, experience, salary_range, location, employment_type, recruiter_id, status)
SELECT 'Frontend Engineer (React)', 'Northwind Technologies',
       'Create responsive dashboards with React, Vite and charting libraries. Focus on accessibility, performance and clean component design.',
       'React, JavaScript, CSS, REST, Git', 1, 'INR 6-10 LPA', 'Remote', 'Full-time', u.id, 'ACTIVE'
FROM users u WHERE u.email = 'recruiter1@smarthire.demo'
  AND NOT EXISTS (SELECT 1 FROM jobs j WHERE j.title = 'Frontend Engineer (React)' AND j.recruiter_id = u.id);

INSERT INTO jobs (title, company_name, description, required_skills, experience, salary_range, location, employment_type, recruiter_id, status)
SELECT 'Data Analyst', 'Bluepeak Systems',
       'Analyse business data, build dashboards and present insights to stakeholders using SQL, Python and BI tools.',
       'SQL, Python, Excel, Power BI, Statistics', 1, 'INR 5-9 LPA', 'Bengaluru', 'Full-time', u.id, 'ACTIVE'
FROM users u WHERE u.email = 'recruiter2@smarthire.demo'
  AND NOT EXISTS (SELECT 1 FROM jobs j WHERE j.title = 'Data Analyst' AND j.recruiter_id = u.id);

INSERT INTO jobs (title, company_name, description, required_skills, experience, salary_range, location, employment_type, recruiter_id, status)
SELECT 'QA Automation Intern', 'Bluepeak Systems',
       'Learn test automation with Selenium and Java while supporting the release team.',
       'Java, Selenium, SQL, Testing', 0, 'INR 20-30k / month', 'Pune', 'Internship', u.id, 'ACTIVE'
FROM users u WHERE u.email = 'recruiter2@smarthire.demo'
  AND NOT EXISTS (SELECT 1 FROM jobs j WHERE j.title = 'QA Automation Intern' AND j.recruiter_id = u.id);

-- Demo applications. Note: applications need a resume on file to be created through the app; these rows are

INSERT INTO jobs (title, company_name, description, required_skills, experience, salary_range, location, employment_type, recruiter_id, status)
SELECT 'Machine Learning Engineer', 'Northwind Technologies',
       'Design and deploy ML models using Python, TensorFlow, and cloud services. Work with data pipelines and model monitoring.',
       'Python, TensorFlow, PyTorch, SQL, Docker', 2, 'INR 12-20 LPA', 'Hyderabad', 'Full-time', u.id, 'ACTIVE'
FROM users u WHERE u.email = 'recruiter1@smarthire.demo'
  AND NOT EXISTS (SELECT 1 FROM jobs j WHERE j.title = 'Machine Learning Engineer' AND j.recruiter_id = u.id);

INSERT INTO jobs (title, company_name, description, required_skills, experience, salary_range, location, employment_type, recruiter_id, status)
SELECT 'DevOps Engineer', 'Bluepeak Systems',
       'Maintain CI/CD pipelines, infrastructure as code, and cloud services. Ensure reliability and scalability.',
       'AWS, Docker, Kubernetes, Jenkins, Terraform', 3, 'INR 10-18 LPA', 'Bengaluru', 'Full-time', u.id, 'ACTIVE'
FROM users u WHERE u.email = 'recruiter2@smarthire.demo'
  AND NOT EXISTS (SELECT 1 FROM jobs j WHERE j.title = 'DevOps Engineer' AND j.recruiter_id = u.id);

INSERT INTO jobs (title, company_name, description, required_skills, experience, salary_range, location, employment_type, recruiter_id, status)
SELECT 'Android Developer', 'Northwind Technologies',
       'Build native Android applications using Kotlin, MVVM, and modern Android libraries.',
       'Kotlin, Android SDK, Jetpack, REST, Git', 1, 'INR 7-12 LPA', 'Remote', 'Full-time', u.id, 'ACTIVE'
FROM users u WHERE u.email = 'recruiter1@smarthire.demo'
  AND NOT EXISTS (SELECT 1 FROM jobs j WHERE j.title = 'Android Developer' AND j.recruiter_id = u.id);
-- Demo applications. Note: applications need a resume on file to be created through the app; these rows are
-- inserted directly so the recruiter dashboard has data. They carry no resume file (download is hidden).
INSERT INTO applications (candidate_id, job_id, status, cover_note)
SELECT c.id, j.id, 'PENDING', 'Excited to contribute to your platform team.'
FROM candidates c JOIN users cu ON cu.id = c.user_id AND cu.email = 'candidate1@smarthire.demo'
JOIN jobs j ON j.title = 'Java Full Stack Developer'
WHERE NOT EXISTS (SELECT 1 FROM applications a WHERE a.candidate_id = c.id AND a.job_id = j.id);

INSERT INTO applications (candidate_id, job_id, status, cover_note)
SELECT c.id, j.id, 'SHORTLISTED', 'My analytics projects match this role well.'
FROM candidates c JOIN users cu ON cu.id = c.user_id AND cu.email = 'candidate2@smarthire.demo'
JOIN jobs j ON j.title = 'Data Analyst'
WHERE NOT EXISTS (SELECT 1 FROM applications a WHERE a.candidate_id = c.id AND a.job_id = j.id);

INSERT INTO applications (candidate_id, job_id, status, cover_note)
SELECT c.id, j.id, 'REJECTED', 'Interested in moving towards front-end work.'
FROM candidates c JOIN users cu ON cu.id = c.user_id AND cu.email = 'candidate2@smarthire.demo'
JOIN jobs j ON j.title = 'Frontend Engineer (React)'
WHERE NOT EXISTS (SELECT 1 FROM applications a WHERE a.candidate_id = c.id AND a.job_id = j.id);
