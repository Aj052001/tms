import axios from "axios";

// Prefer environment variables and fall back to localhost for dev
const API_URL = (import.meta as any)?.env?.VITE_API_URL || "https://lokendraserver.vercel.app/api"; // include /api
export const ASSET_BASE_URL = (import.meta as any)?.env?.VITE_ASSET_BASE_URL || "https://lokendraserver.vercel.app"; // for static assets like /uploads

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Add token automatically
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
