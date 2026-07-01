import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import { getDashboardSummary } from '../services/api'
import { updateTask, deleteTask } from '../api'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import TaskModal from '../components/TaskModal'

function Dashboard() {
  const { isDark } = useTheme()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingTask, setEditingTask] = useState(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)

  const fetchData = async () => {
    try {
      const summary = await getDashboardSummary()
      setData(summary)
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleUpdateTask = async (taskData) => {
    if (!editingTask) return
    try {
      await updateTask(editingTask.id, taskData)
      toast.success('Task updated successfully')
      setIsTaskModalOpen(false)
      setEditingTask(null)
      fetchData()
    } catch (error) {
      toast.error('Failed to update task')
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    try {
      await deleteTask(taskId)
      toast.success('Task deleted')
      setIsTaskModalOpen(false)
      setEditingTask(null)
      fetchData()
    } catch (error) {
      toast.error('Failed to delete task')
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  const stats = data?.stats || {}
  const revenueData = data?.revenue_chart || []
  const recentCustomers = data?.recent_customers || []
  const tasksOverview = data?.tasks_overview || []
  const dealsByStage = data?.deals_by_stage || []
  const upcomingTasks = data?.upcoming_tasks || []

  const totalTasks = tasksOverview.reduce((sum, t) => sum + t.value, 0)
  const maxDeals = Math.max(...dealsByStage.map(d => d.count), 1)

  const formatCurrency = (v) => `$${(v || 0).toLocaleString()}`

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }
  }

  return (
    <div className="pb-8">
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }}
        onSubmit={handleUpdateTask}
        onDelete={handleDeleteTask}
        initialData={editingTask}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Dashboard</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">Here's what's happening with your business today.</p>
        </div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <motion.div variants={itemVariants}>
            <StatCard
              title="Customers"
              value={(stats.total_customers || 0).toLocaleString()}
              icon={<svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>}
              iconBg="bg-indigo-100"
              sparklineColor="#6366f1"
              isEmpty={stats.total_customers === 0}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Revenue"
              value={formatCurrency(stats.revenue)}
              icon={<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
              iconBg="bg-green-100"
              sparklineColor="#22c55e"
              isEmpty={!stats.revenue}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Open Deals"
              value={(stats.open_deals || 0).toLocaleString()}
              icon={<svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>}
              iconBg="bg-orange-100"
              sparklineColor="#f97316"
              isEmpty={stats.open_deals === 0}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Tasks Done"
              value={`${stats.completion_rate || 0}%`}
              subtitle={stats.tasks_total > 0 ? `${stats.tasks_completed} of ${stats.tasks_total}` : null}
              icon={<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
              iconBg="bg-blue-100"
              sparklineColor="#3b82f6"
              isEmpty={stats.tasks_total === 0}
            />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Overview Chart */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Overview</h2>
            </div>
            {revenueData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" y2="1">
                          <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#f1f5f9'} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: isDark ? '#94a3b8' : '#9ca3af', fontSize: 12}} dy={10} minTickGap={20} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: isDark ? '#94a3b8' : '#9ca3af', fontSize: 12}} tickFormatter={(val) => `$${val/1000}K`} width={50} tickCount={5} />
                    <Tooltip content={<CustomTooltip formatter={(v) => `$${v.toLocaleString()}`} />} />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fill="url(#colorRevenue)" activeDot={{ r: 6, strokeWidth: 0, fill: '#6366f1' }} isAnimationActive={true} animationDuration={800} animationEasing="ease-out" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                icon={<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>}
                title="No revenue data yet"
                message="Revenue will appear here once you have paid invoices."
                linkTo="/invoices"
                linkText="Create an invoice"
              />
            )}
          </motion.div>

          {/* Recent Customers */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Customers</h2>
              {recentCustomers.length > 0 && (
                <Link to="/customers" className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">View all</Link>
              )}
            </div>

            {recentCustomers.length > 0 ? (
              <div className="flex-1 flex flex-col gap-5 overflow-y-auto pr-2">
                {recentCustomers.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm
                        ${customer.status === 'Active' ? 'bg-indigo-100 text-indigo-700' : 
                          customer.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 
                          'bg-gray-100 text-gray-700'}`}>
                        {customer.name?.[0] || 'C'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-slate-200 truncate">{customer.name}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{customer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                       <span className={`hidden sm:inline-flex text-xs px-2.5 py-1 rounded-md font-medium border
                        ${customer.status === 'Active' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800' : 
                          customer.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800' : 
                          'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'}`}>
                        {customer.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>}
                title="No customers yet"
                message="Add your first customer to get started."
                linkTo="/customers"
                linkText="Add customer"
              />
            )}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tasks Overview (Donut) */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Tasks Overview</h2>
            {tasksOverview.length > 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tasksOverview}
                        dataKey="value"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        stroke="none"
                        isAnimationActive={true}
                        animationDuration={800}
                        animationEasing="ease-out"
                        animationBegin={200}
                      >
                        {tasksOverview.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white leading-none">{totalTasks}</span>
                    <span className="text-xs text-gray-500 dark:text-slate-400 mt-1">Total Tasks</span>
                  </div>
                </div>
                
                <div className="w-full mt-6 flex flex-col gap-3">
                  {tasksOverview.map((task) => (
                    <div key={task.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: task.color }}></span>
                        <span className="text-gray-600 dark:text-slate-300 font-medium">{task.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 dark:text-white font-semibold">{task.value}</span>
                        <span className="text-gray-400 text-xs w-8 text-right">({totalTasks > 0 ? Math.round(task.value / totalTasks * 100) : 0}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                title="No tasks yet"
                message="Create tasks to track your workflow."
                linkTo="/tasks"
                linkText="Create a task"
              />
            )}
            {tasksOverview.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-50 dark:border-slate-800 text-center">
                <Link to="/tasks" className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center justify-center gap-1 transition-colors">
                  View all tasks <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </Link>
              </div>
            )}
          </motion.div>

          {/* Deals by Stage (Funnel) */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Deals by Stage</h2>
            {dealsByStage.length > 0 ? (
              <div className="flex-1 flex flex-col justify-center gap-4 px-2">
                {dealsByStage.map((deal) => (
                  <div key={deal.stage} className="w-full flex items-center justify-center group relative cursor-default">
                    <div 
                      className="h-10 rounded-lg flex items-center px-4 shadow-sm transition-all duration-300 relative overflow-hidden"
                      style={{ 
                        backgroundColor: deal.color, 
                        width: `${Math.max((deal.count / maxDeals) * 100, 20)}%`,
                      }}
                    >
                      <div className="absolute inset-0 bg-white opacity-10"></div>
                      <span className="text-white text-xs font-bold tracking-wide relative z-10 capitalize">{deal.stage}</span>
                      <span className="text-white text-xs font-bold ml-auto relative z-10 opacity-90">{deal.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>}
                title="No deals yet"
                message="Add deals to see your pipeline."
                linkTo="/deals"
                linkText="Create a deal"
              />
            )}
          </motion.div>

          {/* Upcoming Tasks */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upcoming Tasks</h2>
              {upcomingTasks.length > 0 && (
                <Link to="/tasks" className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">View all</Link>
              )}
            </div>
            
            {upcomingTasks.length > 0 ? (
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
                {upcomingTasks.map((task) => (
                  <div 
                    key={task.id} 
                    onClick={() => { setEditingTask(task); setIsTaskModalOpen(true); }}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 transition border border-transparent hover:border-gray-100 dark:hover:border-slate-700 cursor-pointer"
                  >
                    <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                      ${task.status === 'done' ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-slate-600'}`}>
                      {task.status === 'done' && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium mb-1 truncate ${task.status === 'done' ? 'text-gray-400 dark:text-slate-500 line-through' : 'text-gray-800 dark:text-slate-200'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          <span>{new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        {task.priority && (
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full
                            ${task.priority === 'high' ? 'bg-red-100 text-red-700' :
                              task.priority === 'med' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'}`}>
                            {task.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>}
                title="No upcoming tasks"
                message="Tasks with future due dates will appear here."
                linkTo="/tasks"
                linkText="Create a task"
              />
            )}
          </motion.div>

        </div>
      </motion.div>
    </div>
  )
}

// Reusable empty state component for dashboard sections
function EmptyState({ icon, title, message, linkTo, linkText }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-8">
      <div className="w-14 h-14 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-gray-900 dark:text-slate-200 text-sm font-semibold mb-1">{title}</h3>
      <p className="text-gray-500 dark:text-slate-400 text-xs mb-3 text-center max-w-[200px]">{message}</p>
      {linkTo && (
        <Link to={linkTo} className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors active:scale-[0.98]">
          {linkText}
        </Link>
      )}
    </div>
  )
}

// Custom tooltip with premium styling
function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.12 }}
      className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-gray-100 dark:border-slate-700"
    >
      <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold text-gray-900 dark:text-white">{formatter ? formatter(p.value) : p.value}</p>
      ))}
    </motion.div>
  )
}

// Animated number counter
function AnimatedCounter({ value, duration = 600, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(prefix + '0' + suffix)
  const ref = useRef(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true

    // Parse numeric part from value string
    const numStr = String(value).replace(/[^0-9.]/g, '')
    const target = parseFloat(numStr) || 0
    if (target === 0) { setDisplay(prefix + value + suffix); return }

    const isPercentage = String(value).includes('%')
    const isCurrency = String(value).includes('$') || prefix.includes('$')
    const start = performance.now()

    const animate = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      const current = target * eased

      if (isCurrency) {
        setDisplay(`$${Math.round(current).toLocaleString()}`)
      } else if (isPercentage) {
        setDisplay(`${Math.round(current)}%`)
      } else {
        setDisplay(prefix + Math.round(current).toLocaleString() + suffix)
      }

      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value])

  return <span>{display}</span>
}

function StatCard({ title, value, subtitle, icon, iconBg, sparklineColor, isEmpty }) {
  const data = isEmpty ? [] : Array.from({ length: 15 }, () => ({ val: Math.random() * 100 + 50 }))
  if (!isEmpty) data.sort((a,b) => a.val - b.val)

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full overflow-hidden group">
      <div className="p-5 pb-2">
        <div className="flex items-center gap-3 mb-4">
          <div className={`${iconBg} dark:bg-opacity-20 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm`}>
            {icon}
          </div>
        </div>
        <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-slate-400 mb-1 truncate">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
            {isEmpty ? value : <AnimatedCounter value={value} />}
          </h3>
        </div>
        {subtitle && (
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{subtitle}</p>
        )}
      </div>
      
      {!isEmpty && data.length > 0 ? (
        <div className="mt-4 h-16 w-full opacity-30 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${title.replace(/\s/g,'')}`} x1="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={sparklineColor} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={sparklineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="val" stroke={sparklineColor} strokeWidth={2} fill={`url(#grad-${title.replace(/\s/g,'')})`} dot={false} isAnimationActive={true} animationDuration={800} animationEasing="ease-out" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-6"></div>
      )}
    </div>
  )
}

export default Dashboard