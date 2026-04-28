import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true, // Required for HttpOnly cookies (refreshToken)
});

// Request Interceptor: Attach the Access Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Never retry auth-related endpoints — avoids circular refresh loops
        const isAuthEndpoint = originalRequest?.url?.includes('/api/auth/');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            originalRequest._retry = true;

            // Only attempt refresh if there was an access token (i.e., session expired)
            const hadToken = !!localStorage.getItem('accessToken');
            if (!hadToken) {
                return Promise.reject(error);
            }

            try {
                // Attempt to refresh the token using the HttpOnly refresh cookie
                const response = await axios.post(
                    'http://localhost:8080/api/auth/refresh',
                    {},
                    { withCredentials: true }
                );
                const { accessToken } = response.data;

                localStorage.setItem('accessToken', accessToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed — clear token and redirect to auth page
                localStorage.removeItem('accessToken');
                if (window.location.pathname !== '/auth') {
                    window.location.href = '/auth';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
