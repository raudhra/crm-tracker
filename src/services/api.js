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