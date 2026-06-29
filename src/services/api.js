const BASE_URL = 'http://localhost:8080'

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
})

// Auth
export const loginUser = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
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
  const response = await fetch(`${BASE_URL}/auth/register`, {
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
  const response = await fetch(`${BASE_URL}/auth/me`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Failed to fetch profile')
  return response.json()
}

export const updateProfile = async (data) => {
  const response = await fetch(`${BASE_URL}/auth/profile`, {
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
  
  const response = await fetch(`${BASE_URL}/customers?${query.toString()}`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Failed to fetch customers')
  return response.json()
}

export const createCustomer = async (data) => {
  const response = await fetch(`${BASE_URL}/customers`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed to create customer')
  return response.json()
}

export const updateCustomer = async (id, data) => {
  const response = await fetch(`${BASE_URL}/customers/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed to update customer')
  return response.json()
}

export const deleteCustomer = async (id) => {
  const response = await fetch(`${BASE_URL}/customers/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Failed to delete customer')
  return response.json()
}

// Dashboard
export const getDashboardStats = async () => {
  const response = await fetch(`${BASE_URL}/dashboard/stats`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Failed to fetch stats')
  return response.json()
}

// Mock Data for Charts (Until backend supports these)
export const getRevenueData = async () => {
  return [
    { date: 'May 1', revenue: 12000 },
    { date: 'May 6', revenue: 18000 },
    { date: 'May 11', revenue: 22000 },
    { date: 'May 16', revenue: 19000 },
    { date: 'May 21', revenue: 28000 },
    { date: 'May 26', revenue: 24000 },
    { date: 'May 31', revenue: 42000 },
  ]
}

export const getTasksOverview = async () => {
  return [
    { name: 'Completed', value: 14, color: '#22c55e' },
    { name: 'In Progress', value: 6, color: '#3b82f6' },
    { name: 'Pending', value: 4, color: '#eab308' },
  ]
}

export const getDealsByStage = async () => {
  return [
    { stage: 'Leads', count: 120, color: '#6366f1' },
    { stage: 'Qualified', count: 84, color: '#3b82f6' },
    { stage: 'Proposal', count: 56, color: '#22c55e' },
    { stage: 'Negotiation', count: 34, color: '#eab308' },
    { stage: 'Closed', count: 18, color: '#ef4444' },
  ]
}

export const getUpcomingTasks = async () => {
  return [
    { id: 1, title: 'Follow up with Acme Corporation', date: 'May 19, 2024', done: false },
    { id: 2, title: 'Prepare proposal for Globex', date: 'May 20, 2024', done: false },
    { id: 3, title: 'Monthly report for stakeholders', date: 'May 22, 2024', done: true },
    { id: 4, title: 'Review contract – Initech LLC', date: 'May 23, 2024', done: true },
  ]
}