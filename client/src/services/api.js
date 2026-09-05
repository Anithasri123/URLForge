const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // If 401 Unauthorized, token is missing/expired
    if (response.status === 401) {
      localStorage.removeItem('token');
      // Dispatch custom event to inform AuthContext if active
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to URLForge server. Please check your internet connection or verify the backend is running.');
    }
    throw error;
  }
}

export const api = {
  // Authentication API calls
  register: (name, email, password) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    }),

  login: (email, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  getMe: () =>
    request('/api/auth/me', {
      method: 'GET'
    }),

  // URL Shortener API calls
  createUrl: (originalUrl, expiresAt = null) =>
    request('/api/urls', {
      method: 'POST',
      body: JSON.stringify({ originalUrl, ...(expiresAt && { expiresAt }) })
    }),

  getUrls: () =>
    request('/api/urls', {
      method: 'GET'
    }),

  getUrlById: (id) =>
    request(`/api/urls/${id}`, {
      method: 'GET'
    }),

  getUrlStats: (id) =>
    request(`/api/urls/${id}/stats`, {
      method: 'GET'
    }),

  deleteUrl: (id) =>
    request(`/api/urls/${id}`, {
      method: 'DELETE'
    })
};
