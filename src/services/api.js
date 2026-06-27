const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function getToken() {
  return localStorage.getItem('quickbite_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const err = new Error(data.message || 'Something went wrong')
    err.status = res.status
    err.needsVerification = data.needsVerification
    err.email = data.email
    throw err
  }

  return data
}

export const api = {
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  register: (payload) =>
    request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),

  getMe: () => request('/api/auth/me'),

  updateProfile: (payload) =>
    request('/api/auth/profile', { method: 'PATCH', body: JSON.stringify(payload) }),

  getAddresses: () => request('/api/auth/addresses'),

  addAddress: (payload) =>
    request('/api/auth/addresses', { method: 'POST', body: JSON.stringify(payload) }),

  setDefaultAddress: (id) =>
    request(`/api/auth/addresses/${id}/default`, { method: 'PATCH' }),

  deleteAddress: (id) =>
    request(`/api/auth/addresses/${id}`, { method: 'DELETE' }),

  verifyEmail: (token) =>
    request(`/api/auth/verify-email?token=${encodeURIComponent(token)}`),

  resendVerification: (email) =>
    request('/api/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) }),

  forgotPassword: (email) =>
    request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (token, password) =>
    request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),

  getRestaurants: () => request('/api/restaurants'),

  getRestaurant: (id) => request(`/api/restaurants/${id}`),

  createOrder: (payload) =>
    request('/api/orders', { method: 'POST', body: JSON.stringify(payload) }),

  getOrders: () => request('/api/orders'),

  getOrder: (id) => request(`/api/orders/${id}`),

  updateOrderStatus: (id, status) =>
  request(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
}
