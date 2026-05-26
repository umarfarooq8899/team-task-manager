import api from './axios';

export const getTeams = () => api.get('/teams').then((r) => r.data);
export const createTeam = (name) => api.post('/teams', { name }).then((r) => r.data);
export const addTeamMember = (teamId, memberData) =>
  api.post(`/teams/${teamId}/members`, memberData).then((r) => r.data);
export const deleteTeam = (teamId) => api.delete(`/teams/${teamId}`).then((r) => r.data);
