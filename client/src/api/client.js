import axios from "axios";

const TOKEN_KEY = "zivora_access_token";

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const setStoredToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearStoredToken = () => localStorage.removeItem(TOKEN_KEY);

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "'http://localhost:5000/api'",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await api.post("/auth/refresh");
        const nextToken = refreshResponse.data?.data?.accessToken;

        if (nextToken) {
          setStoredToken(nextToken);
          originalRequest.headers.Authorization = `Bearer ${nextToken}`;
          return api(originalRequest);
        }
      } catch {
        clearStoredToken();
      }
    }

    return Promise.reject(error);
  },
);
