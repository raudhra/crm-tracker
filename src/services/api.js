// const BASE_URL = 'http://localhost:8080'

// const getHeaders =() => ({
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${localStorage.getItem('token')}`
// })

// export const loginUser = async (email,password) => {
//     const response = await fetch(`${BASE_URL}/auth/login`, {
//         method:'POST',
//         headers: {'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password})
//     })
//     return response.json()
// }

// export const getCustomers = async () => {
//     const response = await fetch(`${BASE_URL}/customers`, {
//         headers: getHeaders()
//     })
//     return response.json()
// }

// export const getDashboardStats = async () => {
//     const response = await fetch(`${BASE_URL}/dashboard/stats`, {
//         headers: getHeaders()
//     })
//     return response.json()
// }

const BASE_URL = 'http://localhost:8080'

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
})

export const loginUser = async (email, password) => {
  return {
    token: 'fake-jwt-token',
    user: { name: 'Rudra', email: email }
  }
}

export const getCustomers = async () => {
  return [
    { id: 1, name: 'Acme Corporation', email: 'info@acme.com', status: 'Active', createdAt: '2024-05-18' },
    { id: 2, name: 'Globex Solutions', email: 'hello@globex.com', status: 'Active', createdAt: '2024-05-17' },
    { id: 3, name: 'Initech LLC', email: 'contact@initech.com', status: 'Pending', createdAt: '2024-05-16' },
    { id: 4, name: 'Umbrella Corp', email: 'support@umbrella.com', status: 'Active', createdAt: '2024-05-15' },
    { id: 5, name: 'Stark Industries', email: 'sales@stark.com', status: 'Active', createdAt: '2024-05-14' },
  ]
}

export const getDashboardStats = async () => {
  return {
    totalCustomers: 1248,
    revenue: 58432,
    openDeals: 346,
    tasksCompleted: 86
  }
}