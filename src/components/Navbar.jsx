import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { getCustomers, getDeals, getTasks } from '../api'

function Navbar({ toggleSidebar, isSidebarOpen }) {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  // Dropdown states
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifMenuOpen, setNotifMenuOpen] = useState(false)
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [searchData, setSearchData] = useState({ customers: [], deals: [], tasks: [] })
  const [dataLoaded, setDataLoaded] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const userRef = useRef(null)
  const notifRef = useRef(null)
  const searchRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifMenuOpen(false)
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchFocused(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load search data lazily
  const handleSearchFocus = async () => {
    setSearchFocused(true)
    if (!dataLoaded) {
      try {
        const [c, d, t] = await Promise.all([getCustomers(), getDeals(), getTasks()])
        setSearchData({
          customers: Array.isArray(c) ? c : [],
          deals: Array.isArray(d) ? d : [],
          tasks: Array.isArray(t) ? t : []
        })
        setDataLoaded(true)
      } catch (err) {}
    }
  }

  // Debounce search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setSelectedIndex(-1)
      return
    }

    const timer = setTimeout(() => {
      const q = searchQuery.toLowerCase()
      const res = []
      
      searchData.customers.forEach(c => {
        if (c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)) {
          res.push({ id: `cust_${c.id}`, label: c.name, sub: c.email, type: 'Customer', path: '/customers' })
        }
      })
      searchData.deals.forEach(d => {
        if (d.title.toLowerCase().includes(q)) {
          res.push({ id: `deal_${d.id}`, label: d.title, sub: d.stage, type: 'Deal', path: '/deals' })
        }
      })
      searchData.tasks.forEach(t => {
        if (t.title.toLowerCase().includes(q)) {
          res.push({ id: `task_${t.id}`, label: t.title, sub: t.status, type: 'Task', path: '/tasks' })
        }
      })

      setSearchResults(res.slice(0, 8)) // max 8 results
      setSelectedIndex(-1)
    }, 200)

    return () => clearTimeout(timer)
  }, [searchQuery, searchData])

  const handleSearchKeyDown = (e) => {
    if (!searchFocused || searchResults.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
        handleSelectResult(searchResults[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      setSearchFocused(false)
      inputRef.current?.blur()
    }
  }

  const handleSelectResult = (result) => {
    setSearchFocused(false)
    setSearchQuery('')
    navigate(result.path)
  }

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 h-16 flex items-center justify-between px-8 sticky top-0 z-10 flex-shrink-0 shadow-sm transition-colors duration-200">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={toggleSidebar}
          className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors p-1.5 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
        
        <div className="relative w-full max-w-md hidden md:block" ref={searchRef}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleSearchFocus}
            onKeyDown={handleSearchKeyDown}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white transition-all"
            placeholder="Search customers, deals, tasks..."
          />
          
          {/* Search Dropdown */}
          <AnimatePresence>
            {searchFocused && searchQuery.trim() && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 py-2 max-h-[60vh] overflow-y-auto origin-top"
              >
                {searchResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400 text-center">No results found for "{searchQuery}"</div>
                ) : (
                  searchResults.map((res, idx) => (
                    <div 
                      key={res.id}
                      onClick={() => handleSelectResult(res)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`px-4 py-2.5 cursor-pointer flex items-center justify-between transition-colors ${selectedIndex === idx ? 'bg-indigo-50 dark:bg-slate-700' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
                    >
                      <div>
                        <div className={`text-sm font-medium ${selectedIndex === idx ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>{res.label}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">{res.sub}</div>
                      </div>
                      <span className="text-xs font-semibold bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-2 py-1 rounded">{res.type}</span>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-full transition-colors"
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
          )}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setNotifMenuOpen(!notifMenuOpen)}
            className={`relative p-2 transition-colors rounded-full ${notifMenuOpen ? 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200' : 'text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
          >
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900">
               <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
            </span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          </button>
          
          <AnimatePresence>
            {notifMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 flex flex-col origin-top-right"
              >
                <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 font-bold text-gray-900 dark:text-white flex justify-between items-center">
                  Notifications
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer hover:underline">Mark all read</span>
                </div>
                <div className="p-8 text-center text-sm text-gray-500 dark:text-slate-400">
                  You're all caught up!
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 mx-2"></div>

        {/* User Profile */}
        <div className="relative" ref={userRef}>
          <button 
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors ${userMenuOpen ? 'bg-gray-100 dark:bg-slate-800' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}`}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs shadow-sm">
                {user?.name?.[0] ?? 'U'}
              </div>
            )}
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300 hidden sm:block">{user?.name ?? 'User'}</span>
            <svg className="w-4 h-4 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          
          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 py-1 origin-top-right"
              >
                <button
                  onClick={() => { setUserMenuOpen(false); navigate('/settings'); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-gray-400 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  Profile Settings
                </button>
                <div className="h-px bg-gray-100 dark:bg-slate-700 my-1"></div>
                <button
                  onClick={() => { logout(); navigate('/login'); }}
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
    </header>
  )
}

export default Navbar
