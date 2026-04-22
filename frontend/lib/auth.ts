import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export const register = async (username: string, password: string, firstName?: string, lastName?: string) => {
  const response = await axios.post(`${API_URL}/auth/register/`, {
    username,
    password,
    first_name: firstName || "",
    last_name: lastName || "",
  });
  
  if (response.data.token) {
    setToken(response.data.token);
  }
  
  return response.data;
};

export const login = async (username: string, password: string) => {
  const response = await axios.post(`${API_URL}/auth/login/`, {
    username,
    password,
  });
  
  if (response.data.token) {
    setToken(response.data.token);
  }
  
  return response.data;
};

export const logout = async () => {
  try {
    const token = getToken();
    if (token) {
      await axios.post(
        `${API_URL}/auth/logout/`,
        {},
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
    }
  } finally {
    clearToken();
  }
};

export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

export const clearToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

axios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
