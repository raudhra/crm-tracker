import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
    <BrowserRoutes>
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/customers" element={<Customers />} />
    </Routes>
    </BrowserRoutes>
    </AuthProvider>
  )
}