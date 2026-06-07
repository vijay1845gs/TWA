import axios from 'axios';

// Create a configured Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach access token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Don't intercept auth errors or retry if we already tried
      if (!originalRequest.url?.includes('/auth/') && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise(function(resolve, reject) {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (!refreshToken) throw new Error('No refresh token');

          // Call refresh endpoint directly using axios (avoid interceptors)
          const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
            refreshToken
          });

          const newAccessToken = res.data.data.accessToken;
          const newRefreshToken = res.data.data.refreshToken;
          
          sessionStorage.setItem('access_token', newAccessToken);
          localStorage.setItem('refresh_token', newRefreshToken);
          
          api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
          originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
          
          processQueue(null, newAccessToken);
          isRefreshing = false;
          
          return api(originalRequest);
        } catch (err) {
          processQueue(err, null);
          isRefreshing = false;
          sessionStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('sbt_auth_pin');
          return Promise.reject(error);
        }
      } else if (originalRequest.url?.includes('/auth/')) {
        // If it was an auth endpoint that failed with 401, clear tokens
        sessionStorage.removeItem('access_token');
        localStorage.removeItem('sbt_auth_pin');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
