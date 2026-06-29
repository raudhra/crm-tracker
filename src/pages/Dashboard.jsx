import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import { getDashboardStats, getCustomers, getRevenueData, getTasksOverview, getDealsByStage, getUpcomingTasks } from '../services/api'
import toast from 'react-hot-toast'

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [revenueData, setRevenueData] = useState([])
  const [tasksOverview, setTasksOverview] = useState([])
  const [dealsByStage, setDealsByStage] = useState([])
  const [upcomingTasks, setUpcomingTasks] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, customersData, revenue, tasksData, dealsData, tasksListData] = await Promise.all([
          getDashboardStats().catch(() => null),
          getCustomers().catch(() => []),
          getRevenueData(),
          getTasksOverview(),
          getDealsByStage(),
          getUpcomingTasks()
        ])
        
        setStats(statsData)
        setCustomers(Array.isArray(customersData) ? customersData : [])
        setRevenueData(revenue)
        setTasksOverview(tasksData)
        setDealsByStage(dealsData)
        setUpcomingTasks(tasksListData)
      } catch (error) {
        toast.error('Failed to load some dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  const totalTasks = tasksOverview.reduce((sum, t) => sum + t.value, 0)
  const maxDeals = Math.max(...dealsByStage.map(d => d.count), 1)

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back, John! Here's what's happening with your business today.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 shadow-sm">
          <span>May 12 - May 18, 2024</span>
          <svg className="w-4 h-4 text-gray-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Customers"
          value={(stats?.totalCustomers || 1248).toLocaleString()}
          change="+12.5%"
          isPositive={true}
          icon={<svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>}
          iconBg="bg-indigo-100"
          sparklineColor="#6366f1"
        />
        <StatCard
          title="Revenue"
          value={`$${(stats?.revenue || 58432).toLocaleString()}`}
          change="+8.3%"
          isPositive={true}
          icon={<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
          iconBg="bg-green-100"
          sparklineColor="#22c55e"
        />
        <StatCard
          title="Open Deals"
          value={(stats?.openDeals || 346).toLocaleString()}
          change="+4.1%"
          isPositive={true}
          icon={<svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>}
          iconBg="bg-orange-100"
          sparklineColor="#f97316"
        />
        <StatCard
          title="Tasks Completed"
          value={`${stats?.tasksCompleted || 86}%`}
          change="+15.2%"
          isPositive={true}
          icon={<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
          iconBg="bg-blue-100"
          sparklineColor="#3b82f6"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Overview Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Revenue Overview</h2>
            <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-600 font-medium">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(val) => `$${val/1000}K`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fill="url(#colorRevenue)" activeDot={{ r: 6, strokeWidth: 0, fill: '#6366f1' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Customers */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Customers</h2>
            <Link to="/customers" className="text-indigo-600 text-sm font-medium hover:text-indigo-700">View all</Link>
          </div>

          <div className="flex-1 flex flex-col gap-5 overflow-y-auto pr-2">
            {(customers.length > 0 ? customers.slice(0, 5) : mockCustomers).map((customer) => (
              <div key={customer.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm
                    ${customer.status === 'Active' ? 'bg-indigo-100 text-indigo-700' : 
                      customer.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 
                      'bg-gray-100 text-gray-700'}`}>
                    {customer.name?.[0] || 'C'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{customer.name}</p>
                    <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                   <span className={`hidden sm:inline-flex text-xs px-2.5 py-1 rounded-md font-medium border
                    ${customer.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' : 
                      customer.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                      'bg-gray-50 text-gray-700 border-gray-200'}`}>
                    {customer.status}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tasks Overview (Donut) */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Tasks Overview</h2>
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
                  >
                    {tasksOverview.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900 leading-none">{totalTasks}</span>
                <span className="text-xs text-gray-500 mt-1">Total Tasks</span>
              </div>
            </div>
            
            <div className="w-full mt-6 flex flex-col gap-3">
              {tasksOverview.map((task) => (
                <div key={task.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: task.color }}></span>
                    <span className="text-gray-600 font-medium">{task.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 font-semibold">{task.value}</span>
                    <span className="text-gray-400 text-xs w-8 text-right">({Math.round(task.value / totalTasks * 100)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 text-center">
            <Link to="/tasks" className="text-indigo-600 text-sm font-medium hover:text-indigo-700 flex items-center justify-center gap-1">
              View all tasks <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </Link>
          </div>
        </div>

        {/* Deals by Stage (Funnel) */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Deals by Stage</h2>
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
                  {/* Glass highlight effect */}
                  <div className="absolute inset-0 bg-white opacity-10"></div>
                  <span className="text-white text-xs font-bold tracking-wide relative z-10">{deal.stage}</span>
                  <span className="text-white text-xs font-bold ml-auto relative z-10 opacity-90">{deal.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Upcoming Tasks</h2>
            <Link to="/tasks" className="text-indigo-600 text-sm font-medium hover:text-indigo-700">View all</Link>
          </div>
          
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors
                  ${task.done ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-indigo-400'}`}>
                  {task.done && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium mb-1 truncate ${task.done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span>{task.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

function StatCard({ title, value, change, isPositive, icon, iconBg, sparklineColor }) {
  // Generate random data for the decorative sparkline
  const data = Array.from({ length: 15 }, () => ({ val: Math.random() * 100 + 50 }))
  if (isPositive) data.sort((a,b) => a.val - b.val) // generally trending up

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group">
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className={`${iconBg} w-10 h-10 rounded-xl flex items-center justify-center shadow-sm`}>
              {icon}
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          </div>
          <p className={`text-xs font-medium mt-2 flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{transform: isPositive ? 'rotate(0deg)' : 'rotate(180deg)'}}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
            </svg>
            {change} <span className="text-gray-400 font-normal">vs last week</span>
          </p>
        </div>
      </div>
      
      {/* Decorative Sparkline at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`grad-${title.replace(/\s/g,'')}`} x1="0" y1="0" y2="1">
                <stop offset="0%" stopColor={sparklineColor} stopOpacity={0.2} />
                <stop offset="100%" stopColor={sparklineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="val" stroke={sparklineColor} strokeWidth={2} fill={`url(#grad-${title.replace(/\s/g,'')})`} dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Fallback data if API fails to load customers
const mockCustomers = [
  { id: 1, name: 'Acme Corporation', email: 'info@acme.com', status: 'Active' },
  { id: 2, name: 'Globex Solutions', email: 'hello@globex.com', status: 'Active' },
  { id: 3, name: 'Initech LLC', email: 'contact@initech.com', status: 'Pending' },
  { id: 4, name: 'Umbrella Corp', email: 'support@umbrella.com', status: 'Active' },
  { id: 5, name: 'Stark Industries', email: 'sales@stark.com', status: 'Active' },
]

export default Dashboard