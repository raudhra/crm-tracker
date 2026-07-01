export const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
})

// Auth
export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Login failed')
  }
  return response.json()
}

export const signupUser = async (name, email, password) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Signup failed')
  }
  return response.json()
}

export const getProfile = async () => {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Failed to fetch profile')
  return response.json()
}

export const updateProfile = async (data) => {
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed to update profile')
  return response.json()
}

// Customers
export const getCustomers = async (search = '', status = '') => {
  const query = new URLSearchParams()
  if (search) query.append('search', search)
  if (status && status !== 'All') query.append('status', status)
  
  const response = await fetch(`${API_URL}/customers?${query.toString()}`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Failed to fetch customers')
  return response.json()
}

export const getCustomerById = async (id) => {
  const response = await fetch(`${API_URL}/customers/${id}`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Failed to fetch customer details')
  return response.json()
}

export const createCustomer = async (data) => {
  const response = await fetch(`${API_URL}/customers`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed to create customer')
  return response.json()
}

export const updateCustomer = async (id, data) => {
  const response = await fetch(`${API_URL}/customers/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed to update customer')
  return response.json()
}

export const deleteCustomer = async (id) => {
  const response = await fetch(`${API_URL}/customers/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Failed to delete customer')
  return response.json()
}

// Dashboard — single consolidated call
export const getDashboardSummary = async () => {
  const response = await fetch(`${API_URL}/dashboard/summary`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Failed to fetch dashboard data')
  return response.json()
}