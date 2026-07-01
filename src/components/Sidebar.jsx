import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
  ) },
  { path: '/customers', label: 'Customers', icon: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
  ) },
  { path: '/tasks', label: 'Tasks', icon: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
  ) },
  { path: '/deals', label: 'Deals', icon: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
  ) },
  { path: '/invoices', label: 'Invoices', icon: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
  ) },
  { path: '/analytics', label: 'Analytics', icon: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
  ) },
  { path: '/calendar', label: 'Calendar', icon: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
  ) },
  { path: '/messages', label: 'Messages', icon: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
  ) },
  { path: '/settings', label: 'Settings', icon: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
  ) },
]

function TooltipWrapper({ children, text, isSidebarOpen }) {
  const [isHovered, setIsHovered] = useState(false)

  if (isSidebarOpen) return children

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 5, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-full ml-4 px-2.5 py-1.5 bg-gray-900 dark:bg-slate-700 text-white text-xs font-medium rounded-lg whitespace-nowrap z-50 pointer-events-none shadow-lg"
          >
            {text}
            <div className="absolute top-1/2 -left-1 -mt-1 border-4 border-transparent border-r-gray-900 dark:border-r-slate-700" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <motion.div 
      animate={isMobile ? { x: isSidebarOpen ? 0 : -256, width: 256 } : { width: isSidebarOpen ? 256 : 80, x: 0 }}
      initial={false}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`min-h-screen bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex flex-col z-40 transition-colors duration-200 ${isMobile ? 'fixed inset-y-0 left-0 shadow-2xl' : 'relative'}`}
    >
      <div className={`p-6 flex items-center ${isSidebarOpen ? 'gap-3' : 'justify-center'} overflow-hidden whitespace-nowrap`}>
        <div className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm shadow-indigo-200 dark:shadow-none flex-shrink-0">C</div>
        {(isSidebarOpen || isMobile) && <span className="font-bold text-xl text-gray-800 dark:text-white tracking-tight">ClientFlow</span>}
      </div>

      <nav className="flex-1 px-4 py-2 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          
          return (
            <TooltipWrapper key={item.path} text={item.label} isSidebarOpen={isSidebarOpen}>
              <NavLink
                to={item.path}
                className={`relative flex items-center ${(isSidebarOpen || isMobile) ? 'px-3 gap-3' : 'justify-center'} py-2.5 rounded-xl text-sm font-medium transition-colors duration-200
                  ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-200'}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute left-0 w-1 h-5 bg-indigo-600 rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3 w-full">
                  {item.icon}
                  {(isSidebarOpen || isMobile) && <span className="whitespace-nowrap">{item.label}</span>}
                </div>
              </NavLink>
            </TooltipWrapper>
          )
        })}
      </nav>

      <div className="p-4 mt-auto mb-4" ref={profileRef}>
        <div className="relative">
          <button 
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className={`w-full flex items-center ${(isSidebarOpen || isMobile) ? 'gap-3 px-3 py-2 justify-between' : 'justify-center p-2'} bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm shadow-sm flex-shrink-0">
                  {user?.name?.[0] ?? 'U'}
                </div>
              )}
              {(isSidebarOpen || isMobile) && (
                <div className="overflow-hidden text-left min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">{user?.name ?? 'User'}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{user?.email ?? ''}</p>
                </div>
              )}
            </div>
            {(isSidebarOpen || isMobile) && (
              <svg className="w-4 h-4 text-gray-400 dark:text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
            )}
          </button>

          {/* Profile Dropdown */}
          <AnimatePresence>
            {profileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className={`absolute bottom-full mb-2 ${isSidebarOpen ? 'left-0 right-0' : 'left-0 w-48'} bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden py-1 z-50`}
              >
                <button
                  onClick={() => { setProfileMenuOpen(false); navigate('/settings'); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-gray-400 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  Profile Settings
                </button>
                <div className="h-px bg-gray-100 dark:bg-slate-700 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-red-400 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
export default Sidebar