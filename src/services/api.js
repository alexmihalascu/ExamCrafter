import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const getQuestions = () => api.get('/intrebari');
export const saveAnswer = (data) => api.post('/saveAnswer', data);
export const getHistory = (userId) => api.get(`/history?userId=${userId}`);

export default api;
