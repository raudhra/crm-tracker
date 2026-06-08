import { useState, useEffect } from 'react'
import { getDashboardStats, getCustomers } from '../services/api'

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await getDashboardStats()
        const customersData = await getCustomers()

        setStats(statsData)
        setCustomers(customersData)
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
          value={`${stats?.taskCompleted ?? 0}%`}
          change="15.2%"
          color="bg-blue-500"
        />
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
    </div>
   )
}
{/*Statcard being a small component defined in the same file for now temporarily*/}
 function StatCard({title, value, change, color}) {
        return (
            <div className="bg-white rounded-xl p-5 border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                <div className={`${color} w-9 h-9 rounded-lg flex items-center justify-center`}>
                    <span className="text-sm text-gray-500">{title}</span>
                </div>
                <span className="text-sm text-gray-500">{title}</span>
                </div>
                <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>
                <p className="text-xs text-green-500">↑ {change} vs last week</p>
            </div>
        )
    }

export default Dashboard