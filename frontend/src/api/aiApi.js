import api from './axios';

// Every call goes to Spring Boot, which talks to Gemini. No AI key exists in the browser.
export const analyzeResume = () => api.post('/ai/resume-analysis').then((r) => r.data);
export const matchJob = (jobId) => api.post(`/ai/job-match/${jobId}`).then((r) => r.data);
export const interviewQuestions = (jobId) => api.post(`/ai/interview-questions/${jobId}`).then((r) => r.data);
export const improveResume = () => api.post('/ai/resume-improvement').then((r) => r.data);

// Stored results (204 when nothing saved yet)
const latest = (url) => api.get(url).then((r) => (r.status === 204 ? null : r.data));
export const latestAnalysis = () => latest('/ai/resume-analysis/latest');
export const latestImprovement = () => latest('/ai/resume-improvement/latest');
export const latestMatch = (jobId) => latest(`/ai/job-match/${jobId}/latest`);
export const latestInterview = (jobId) => latest(`/ai/interview-questions/${jobId}/latest`);
