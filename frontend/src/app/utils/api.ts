// /app/utils/api.ts
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// Set the base URL for the API.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  // This is crucial for sending and receiving cookies with requests.
  withCredentials: true,
});

// A flag to prevent multiple refresh requests at the same time.
let isRefreshing = false;
// Queue for failed requests waiting for the new access token.
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: any) => void;
}> = [];

// A function to process all queued requests after the token is refreshed.
const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Add the access token to every request header.
api.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 errors and refresh the token using the cookie.
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Check for a 401 error and if it's not the refresh token request itself.
    if (error.response?.status === 403 && originalRequest && !originalRequest._retry) {
      
      // If we're already refreshing, add the request to the queue.
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // The server will automatically receive the refresh token from the cookie.
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}api/auth/token/refresh/`,
          null, // No data needed in the body
          { withCredentials: true }
        );

        const newAccessToken = response.data.access;
        localStorage.setItem('accessToken', newAccessToken);

        // Process the queue and set the new token on the original request.
        processQueue(null, newAccessToken);
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return api(originalRequest);

      } catch (refreshError: any) {
        // If refresh fails, log out the user and redirect.
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
