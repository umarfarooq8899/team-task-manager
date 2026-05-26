import axios from 'axios';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'https://team-task-manager-llbb.onrender.com/api',

  withCredentials: true,

  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;