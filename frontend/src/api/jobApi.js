import api from './axios';

export const listJobs = (params = {}) => api.get('/jobs', { params }).then((r) => r.data);
export const myJobs = () => api.get('/jobs/mine').then((r) => r.data);
export const getJob = (id) => api.get(`/jobs/${id}`).then((r) => r.data);
export const createJob = (payload) => api.post('/jobs', payload).then((r) => r.data);
export const updateJob = (id, payload) => api.put(`/jobs/${id}`, payload).then((r) => r.data);
export const closeJob = (id) => api.delete(`/jobs/${id}`);
