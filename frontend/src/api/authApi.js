import api from './axios';

export const register = (payload) => api.post('/auth/register', payload).then((r) => r.data);
export const login = (payload) => api.post('/auth/login', payload).then((r) => r.data);
export const getMe = () => api.get('/auth/me').then((r) => r.data);
export const updateProfile = (data) => api.put('/auth/profile', data).then((r) => r.data);

export const uploadProfileImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/auth/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then((r) => r.data);
};
