import { useState, useEffect } from 'react'
import { getAnalyticsRevenue, getAnalyticsPipeline, getAnalyticsMetrics, getAnalyticsTasks } from '../api'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import toast from 'react-hot-toast'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0)
}

function Analytics() {
  const [metrics, setMetrics] = useState({ total_revenue: 0, total_deals: 0, won_deals: 0, active_customers: 0, open_tasks: 0 })
  const [revenueData, setRevenueData] = useState([])
  const [pipelineData, setPipelineData] = useState([])
  const [taskData, setTaskData] = useState({ total: 0, completed: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [m, rev, pipe, tasks] = await Promise.all([
        getAnalyticsMetrics(),
        getAnalyticsRevenue(),
        getAnalyticsPipeline(),
        getAnalyticsTasks()
      ])
      
      setMetrics(m || {})
      setRevenueData(Array.isArray(rev) ? rev : [])
      setPipelineData(Array.isArray(pipe) ? pipe : [])
      setTaskData(tasks || { total: 0, completed: 0 })
    } catch (error) {
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const winRate = metrics.total_deals > 0 ? Math.round((metrics.won_deals / metrics.total_deals) * 100) : 0
  const taskCompletionRate = taskData.total > 0 ? Math.round((taskData.completed / taskData.total) * 100) : 0

  const pieData = [
    { name: 'Completed', value: taskData.completed, color: '#4F46E5' },
    { name: 'Open', value: taskData.total - taskData.completed, color: '#E5E7EB' }
  ]

  const CustomTooltip = ({ active, payload, label, isCurrency }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
          <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
          <p className="text-sm text-indigo-600">
            {isCurrency ? formatCurrency(payload[0].value) : payload[0].value}
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="pb-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Analytics Overview</h1>
        <p className="text-gray-500 text-sm">Key performance indicators and trends.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Total Revenue
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.total_revenue)}</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
            Win Rate
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-gray-900">{winRate}%</div>
            <div className="text-xs text-gray-400">({metrics.won_deals}/{metrics.total_deals})</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Active Customers
          </div>
          <div className="text-2xl font-bold text-gray-900">{metrics.active_customers}</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            Open Tasks
          </div>
          <div className="text-2xl font-bold text-gray-900">{metrics.open_tasks}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Line Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
          <h2 className="text-base font-bold text-gray-900 mb-6">Monthly Revenue</h2>
          <div className="h-72">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip content={<CustomTooltip isCurrency={true} />} />
                  <Line type="monotone" dataKey="total" stroke="#4F46E5" strokeWidth={3} dot={{r: 4, fill: '#4F46E5', strokeWidth: 2, stroke: '#FFF'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No revenue data available</div>
            )}
          </div>
        </div>

        {/* Task Completion Pie */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
           <h2 className="text-base font-bold text-gray-900 mb-6 w-full">Task Completion</h2>
           <div className="h-48 w-full relative flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-gray-900">{taskCompletionRate}%</span>
                <span className="text-xs text-gray-500">Completed</span>
             </div>
           </div>
           <div className="flex items-center gap-4 mt-6 text-sm">
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-600"></div> <span className="text-gray-600">Done ({taskData.completed})</span></div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-200"></div> <span className="text-gray-600">Open ({taskData.total - taskData.completed})</span></div>
           </div>
        </div>
      </div>

      {/* Pipeline Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
         <h2 className="text-base font-bold text-gray-900 mb-6">Pipeline Value by Stage</h2>
         <div className="h-80">
            {pipelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickFormatter={(val) => `$${val/1000}k`} />
                  <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} tick={{fill: '#4B5563', fontSize: 12, fontWeight: 500}} width={90} />
                  <Tooltip cursor={{fill: '#F3F4F6'}} content={<CustomTooltip isCurrency={true} />} />
                  <Bar dataKey="value" fill="#6366F1" radius={[0, 4, 4, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No pipeline data available</div>
            )}
         </div>
      </div>

    </div>
  )
}

export default Analytics
