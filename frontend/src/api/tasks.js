import api from './axios';

export const getTasks = (params) => api.get('/tasks', { params }).then((r) => r.data);
export const createTask = (taskData) => api.post('/tasks', taskData).then((r) => r.data);
export const updateTask = (taskId, taskData) => api.put(`/tasks/${taskId}`, taskData).then((r) => r.data);
export const deleteTask = (taskId) => api.delete(`/tasks/${taskId}`).then((r) => r.data);
