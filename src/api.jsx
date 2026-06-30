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

export const getDeals = async (stage, customerId) => {
  let url = `${BASE_URL}/deals`
  const params = new URLSearchParams()
  if (stage) params.append('stage', stage)
  if (customerId) params.append('customer_id', customerId)
  if (params.toString()) url += `?${params.toString()}`
  
  const response = await fetch(url, { headers: getHeaders() })
  return response.json()
}

export const createDeal = async (dealData) => {
  const response = await fetch(`${BASE_URL}/deals`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(dealData)
  })
  return response.json()
}

export const updateDeal = async (dealId, dealData) => {
  const response = await fetch(`${BASE_URL}/deals/${dealId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(dealData)
  })
  return response.json()
}

export const updateDealStage = async (dealId, stage) => {
  const response = await fetch(`${BASE_URL}/deals/${dealId}/stage`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ stage })
  })
  return response.json()
}

export const deleteDeal = async (dealId) => {
  const response = await fetch(`${BASE_URL}/deals/${dealId}`, {
    method: 'DELETE',
    headers: getHeaders()
  })
  return response.json()
}

export const getInvoices = async (status, customerId) => {
  let url = `${BASE_URL}/invoices`
  const params = new URLSearchParams()
  if (status) params.append('status', status)
  if (customerId) params.append('customer_id', customerId)
  if (params.toString()) url += `?${params.toString()}`
  
  const response = await fetch(url, { headers: getHeaders() })
  return response.json()
}

export const createInvoice = async (invoiceData) => {
  const response = await fetch(`${BASE_URL}/invoices`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(invoiceData)
  })
  return response.json()
}

export const updateInvoice = async (invoiceId, invoiceData) => {
  const response = await fetch(`${BASE_URL}/invoices/${invoiceId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(invoiceData)
  })
  return response.json()
}

export const deleteInvoice = async (invoiceId) => {
  const response = await fetch(`${BASE_URL}/invoices/${invoiceId}`, {
    method: 'DELETE',
    headers: getHeaders()
  })
  return response.json()
}

export const downloadInvoicePdf = async (invoiceId) => {
  const response = await fetch(`${BASE_URL}/invoices/${invoiceId}/pdf`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Failed to generate PDF')
  
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `invoice_${invoiceId}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

export const getAnalyticsRevenue = async () => {
  const response = await fetch(`${BASE_URL}/analytics/revenue`, { headers: getHeaders() })
  return response.json()
}

export const getAnalyticsPipeline = async () => {
  const response = await fetch(`${BASE_URL}/analytics/pipeline`, { headers: getHeaders() })
  return response.json()
}

export const getAnalyticsCustomers = async () => {
  const response = await fetch(`${BASE_URL}/analytics/customers`, { headers: getHeaders() })
  return response.json()
}

export const getAnalyticsTasks = async () => {
  const response = await fetch(`${BASE_URL}/analytics/tasks`, { headers: getHeaders() })
  return response.json()
}

export const getAnalyticsMetrics = async () => {
  const response = await fetch(`${BASE_URL}/analytics/metrics`, { headers: getHeaders() })
  return response.json()
}

export const getCalendarEvents = async () => {
  const response = await fetch(`${BASE_URL}/calendar/events`, { headers: getHeaders() })
  return response.json()
}

export const createCalendarEvent = async (eventData) => {
  const response = await fetch(`${BASE_URL}/calendar/events`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(eventData)
  })
  return response.json()
}

export const getMessages = async (customerId, afterId = null) => {
  let url = `${BASE_URL}/messages?customer_id=${customerId}`
  if (afterId) url += `&after=${afterId}`
  const response = await fetch(url, { headers: getHeaders() })
  return response.json()
}

export const createMessage = async (messageData) => {
  const response = await fetch(`${BASE_URL}/messages`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(messageData)
  })
  return response.json()
}