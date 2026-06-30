const BASE_URL = 'http://localhost:8080'

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
})

export const loginUser = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  return response.json()
}

export const getCustomers = async () => {
  const response = await fetch(`${BASE_URL}/customers`, {
    headers: getHeaders()
  })
  return response.json()
}

export const getDashboardStats = async () => {
  const response = await fetch(`${BASE_URL}/dashboard/stats`, {
    headers: getHeaders()
  })
  return response.json()
}

export const getTasks = async (status, customerId) => {
  let url = `${BASE_URL}/tasks`
  const params = new URLSearchParams()
  if (status) params.append('status', status)
  if (customerId) params.append('customer_id', customerId)
  if (params.toString()) url += `?${params.toString()}`
  
  const response = await fetch(url, { headers: getHeaders() })
  return response.json()
}

export const createTask = async (taskData) => {
  const response = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(taskData)
  })
  return response.json()
}

export const updateTask = async (taskId, taskData) => {
  const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(taskData)
  })
  return response.json()
}

export const deleteTask = async (taskId) => {
  const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: getHeaders()
  })
  return response.json()
}