// import axios from 'axios';

// const api = axios.create({
//   baseURL: 'http://127.0.0.1:8000',
// });

// export const fetchCompany = (ticker) => api.get(`/company/${ticker}`).then(res => res.data);
// export const fetchMetrics = (ticker) => api.get(`/metrics/${ticker}`).then(res => res.data);
// export const fetchTrend = (ticker) => api.get(`/trend-analysis/${ticker}`).then(res => res.data);
// export const fetchPeer = (ticker) => api.get(`/peer-analysis/${ticker}`).then(res => res.data);
// export const fetchAcqScore = (ticker) => api.get(`/acquisition-score/${ticker}`).then(res => res.data);
// export const fetchTargets = (sector) => api.get(`/acquisition-targets/${sector}`).then(res => res.data);
// export const fetchFilingHistory = (ticker) => api.get(`/filing/history/${ticker}`).then(res => res.data);
// export const fetchAvailableFilings = (ticker) => api.get(`/api/company/${ticker}/filings`).then(res => res.data);
// export const fetchFilingContent = (ticker, type) => api.get(`/api/company/${ticker}/filing/${type}`).then(res => res.data);

// export default api;

import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE,
});

export const fetchCompany = (ticker) =>
  api.get(`/company/${ticker}`).then((res) => res.data);

export const fetchMetrics = (ticker) =>
  api.get(`/metrics/${ticker}`).then((res) => res.data);

export const fetchTrend = (ticker) =>
  api.get(`/trend-analysis/${ticker}`).then((res) => res.data);

export const fetchPeer = (ticker) =>
  api.get(`/peer-analysis/${ticker}`).then((res) => res.data);

export const fetchAcqScore = (ticker) =>
  api.get(`/acquisition-score/${ticker}`).then((res) => res.data);

export const fetchTargets = (sector) =>
  api.get(`/acquisition-targets/${sector}`).then((res) => res.data);

export const fetchFilingHistory = (ticker) =>
  api.get(`/filing/history/${ticker}`).then((res) => res.data);

export const fetchAvailableFilings = (ticker) =>
  api.get(`/api/company/${ticker}/filings`).then((res) => res.data);

export const fetchFilingContent = (ticker, type) =>
  api.get(`/api/company/${ticker}/filing/${type}`).then((res) => res.data);

export default api;
