/**
 * @file config.js
 * @description Centralized configuration for API base URLs and environment variables.
 */

const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return "https://quan-ly-phong-tro-backend-iqv1.onrender.com";
  }
  return "http://localhost:8082";
};

export const API_BASE_URL = getApiBaseUrl();
export const API_URL = `${API_BASE_URL}/api`;
export const WS_URL = `${API_BASE_URL}/ws`;
export const UPLOADS_URL = `${API_BASE_URL}/uploads/`;

export const getImageUrl = (img, defaultPlaceholder = "") => {
  if (!img) return defaultPlaceholder;
  if (typeof img === "string" && (img.startsWith("http://") || img.startsWith("https://"))) {
    return img.replace("http://", "https://");
  }
  return `${UPLOADS_URL}${img}`;
};

const config = {
  API_BASE_URL,
  API_URL,
  WS_URL,
  UPLOADS_URL,
  getImageUrl,
};

export default config;
