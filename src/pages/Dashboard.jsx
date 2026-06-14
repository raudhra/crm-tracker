import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getDashboardStats, getCustomers, getRevenueData, getTasksOverview, getDealsByStage, getUpcomingTasks } from '../services/api'
import { PieChart, Pie, Cell } from 'recharts'

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
        const statsData = await getDashboardStats()
        const customersData = await getCustomers()
        const revenue = await getRevenueData()
        const tasksData = await getTasksOverview()
        const dealsData = await getDealsByStage()
        const tasksListData = await getUpcomingTasks()
        setRevenueData(revenue)
        setStats(statsData)
        setCustomers(customersData)
        setTasksOverview(tasksData)
        setDealsByStage(dealsData)
        setUpcomingTasks(tasksListData)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="text-gray-500">Loading...</div>
  }

  return (
    <div>
      {/*header*/}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Dashboard
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Welcome Back! Here's what's happening with your business today.
          </p>
        </div>
      </div>

      {/*stat cards*/}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Customers"
          value={stats?.totalCustomers ?? 0}
          change="12.5%"
          color="bg-indigo-500"
        />

        <StatCard
          title="Revenue"
          value={`$${stats?.revenue ?? 0}`}
          change="8.3%"
          color="bg-green-500"
        />

        <StatCard
          title="Open Deals"
          value={stats?.openDeals ?? 0}
          change="4.1%"
          color="bg-orange-500"
        />

        <StatCard
          title="Tasks Completed"
          value={`${stats?.tasksCompleted ?? 0}%`}
          change="15.2%"
          color="bg-blue-500"
        />
      </div>
      {/* Revenue Chart */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 mb-8">
        <h2 className="font-semibold text-gray-800 mb-4">Revenue Overview</h2>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={revenueData}>
            <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
            </defs>
            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip />
            <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#colorRevenue)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/*recent customers*/}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">
            Recent Customers
          </h2>

          <a
            href="/customers"
            className="text-indigo-600 text-sm"
          >
            View all
          </a>
        </div>

        <div className="flex flex-col gap-3">
          {customers.slice(0, 5).map((customer) => (
            <div
              key={customer.id}
              className="flex items-center justify-between py-2 border-b border-gray-50"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-sm">
                {customer.name?.[0] || '?'}
              </div>

              <div className="flex-1 ml-3">
                <p className="text-sm font-medium text-gray-800">
                  {customer.name}
                </p>

                <p className="text-xs text-gray-400">
                  {customer.email}
                </p>
              </div>

              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  customer.status === 'Active'
                    ? 'bg-green-50 text-green-600'
                    : 'bg-yellow-50 text-yellow-600'
                }`}
              >
                {customer.status}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Tasks Overview, Deals by Stage, Upcoming Tasks */}
      <div className="grid grid-cols-3 gap-6 mt-8">

        {/* Tasks Overview: Donut */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Tasks Overview</h2>
          <div className="flex items-center justify-center relative">
            <PieChart width={160} height={160}>
              <Pie
                data={tasksOverview}
                dataKey="value"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={2}
              >
                {tasksOverview.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div className="absolute flex flex-col items-center">
              <p className="text-2xl font-bold text-gray-800">
                {tasksOverview.reduce((sum, t) => sum + t.value, 0)}
              </p>
              <p className="text-xs text-gray-400">Total Tasks</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            {tasksOverview.map((task) => (
              <div key={task.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: task.color }}></span>
                  <span className="text-gray-600">{task.name}</span>
                </div>
                <span className="text-gray-800 font-medium">{task.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Deals by Stage: Funnel */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Deals by Stage</h2>
          <div className="flex flex-col gap-2">
            {dealsByStage.map((deal, index) => (
              <div key={deal.stage} className="flex items-center gap-3">
                <div
                  className="h-8 rounded flex items-center px-3 text-white text-xs font-medium"
                  style={{
                    backgroundColor: deal.color,
                    width: `${100 - index * 15}%`
                  }}
                >
                  {deal.stage}
                </div>
                <span className="text-sm text-gray-600">{deal.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Upcoming Tasks</h2>
            <a href="/tasks" className="text-indigo-600 text-sm">View all</a>
          </div>
          <div className="flex flex-col gap-3">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                  ${task.done ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                  {task.done && <span className="text-white text-xs">✓</span>}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${task.done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {task.title}
                  </p>
                </div>
                <span className="text-xs text-gray-400">{task.date}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
//Statcard being a small component defined in the same file for now temporarily
 function StatCard({title, value, change, color}) {
        return (
            <div className="bg-white rounded-xl p-5 border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                <div className={`${color} w-9 h-9 rounded-lg flex items-center justify-center`}>
                    <span className="text-sm text-white">◆</span>
                </div>
                <span className="text-sm text-gray-500">{title}</span>
                </div>
                <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>
                <p className="text-xs text-green-500">↑ {change} vs last week</p>
            </div>
        )
    }

export default Dashboard