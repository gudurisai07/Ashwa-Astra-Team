import api from './axios';

export const apply = (jobId, coverNote) => api.post('/applications', { jobId, coverNote }).then((r) => r.data);
export const myApplications = () => api.get('/applications/my').then((r) => r.data);
export const recruiterApplications = () => api.get('/applications/recruiter').then((r) => r.data);
export const updateStatus = (id, status) => api.put(`/applications/${id}/status`, { status }).then((r) => r.data);

export const myResume = () => api.get('/resumes/my').then((r) => r.data);
export const updateProfile = (payload) => api.put('/resumes/profile', payload).then((r) => r.data);
export const uploadResume = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/resumes/upload', form).then((r) => r.data);
};
export const downloadResume = async (candidateId, fileName = 'resume.pdf') => {
  const res = await api.get(`/resumes/download/${candidateId}`, { responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const candidateAnalytics = () => api.get('/analytics/candidate').then((r) => r.data);
export const recruiterAnalytics = () => api.get('/analytics/recruiter').then((r) => r.data);
