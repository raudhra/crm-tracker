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