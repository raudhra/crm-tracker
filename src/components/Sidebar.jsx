import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { path: '/customers', label: 'Customers', icon: '👤' },
  { path: '/tasks', label: 'Tasks', icon: '☑' },
  { path: '/deals', label: 'Deals', icon: '$' },
  { path: '/settings', label: 'Settings', icon: '⚙' },
]

function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="w-56 min-h-screen bg-white border-r border-gray-100 flex flex-col">

      <div className="p-5 flex items-center gap-2 border-b border-gray-100">
        <div className="bg-indigo-600 text-white w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm">C</div>
        <span className="font-semibold text-gray-800">ClientFlow</span>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition
              ${isActive
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'}`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-sm">
            {user?.name?.[0] ?? 'U'}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{user?.name ?? 'User'}</p>
            <p className="text-xs text-gray-400">{user?.email ?? ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left text-sm text-gray-500 hover:text-red-500 transition"
        >
          Logout
        </button>
      </div>

    </div>
  )
}
export default Sidebar