import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const login  = (data) => api.post('/auth/login', data);
export const signup = (data) => api.post('/auth/signup', data);

// User
export const getMe          = ()     => api.get('/users/me');
export const updateProfile  = (data) => api.put('/users/profile', data);

// AI Analysis
export const analyzeProfile = (payload = {}) => api.post('/analyze', payload);

// Resume PDF upload
export const uploadResumePDF = (file) => {
  const form = new FormData();
  form.append('resume', file);
  return api.post('/resume/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// Jobs
export const getJobs   = ()      => api.get('/jobs');
export const getJob    = (id)    => api.get(`/jobs/${id}`);
export const createJob = (data)  => api.post('/jobs', data);
export const deleteJob = (id)    => api.delete(`/jobs/${id}`);

// Applications
export const applyToJob             = (jobId)       => api.post('/applications', { jobId });
export const getMyApplications      = ()            => api.get('/applications/my');
export const getJobApplications     = (jobId)       => api.get(`/applications/job/${jobId}`);
export const getJobMatches          = (jobId)       => api.get(`/jobs/${jobId}/matches`);
export const assignCandidate        = (jobId, studentId) => api.post('/applications/assign', { jobId, studentId });
export const updateApplicationStatus= (id, status) => api.put(`/applications/${id}/status`, { status });

// Recruiter candidate search with filters
export const getCandidates = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.minScore   !== undefined) params.append('minScore',   filters.minScore);
  if (filters.maxScore   !== undefined) params.append('maxScore',   filters.maxScore);
  if (filters.experience)               params.append('experience', filters.experience);
  if (filters.skills)                   params.append('skills',     filters.skills);
  return api.get(`/recruiter/candidates?${params.toString()}`);
};

// Notifications
export const getNotifications      = ()  => api.get('/notifications');
export const markNotificationsRead = ()  => api.put('/notifications/read');

// Recruiter Stats
export const getRecruiterStats = () => api.get('/recruiter/stats');

export default api;
