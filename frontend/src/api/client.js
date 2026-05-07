import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

export const getTasks = (params) => api.get('/tasks', { params });
export const getTask = (id) => api.get(`/tasks/${id}`);
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const placeBid = (taskId, data) => api.post(`/tasks/${taskId}/bids`, data);
export const acceptBid = (taskId, bidId) => api.put(`/tasks/${taskId}/bids/${bidId}/accept`);

export const getUsers = (params) => api.get('/users', { params });
export const getUser = (id) => api.get(`/users/${id}`);

export const getAnalyticsAvgBid = () => api.get('/analytics/avg-bid-by-category');
export const getAnalyticsTopBidders = () => api.get('/analytics/top-bidders');
export const getAnalyticsWeekly = () => api.get('/analytics/weekly-activity');
export const getAnalyticsSkillDemand = () => api.get('/analytics/skill-demand');

export default api;
