import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Required to send/receive session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
