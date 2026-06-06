import { useState, useEffect } from 'react'
import { getDashboardStats, getCustomers} from './services/api'

function Dashboard() {
    const [stats, setStats] = useState(null)
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
}

useEffect(() => {
    const fetchData = async () => {
        const statsData = await getDashboardStats()
        const customerData = await getCustomers()
        setStats(statsData)
        setCustomers(customerData)
        setLoading(false)
    }
    fetchData()
}, [])

if (loading) return <div className="text-gray-500">Loading</div>

return (
    <div>
        //header
    <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray text-sm mt-1">Welcome Back! Here's what's happening with your business today.</p>
        </div>
    </div>
        //stat cards
        <div className="grid grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Customers" value={stats?.totalCustomers ?? 0} change="12.5%" color="bg-indigo-500" />
            <StatCard title="Revenue" value={`$${stats?.revenue ?? 0}`} change="8.3%" color="bg-green-500" />
            <StatCard title="Open Deals" value={stats?.openDeals ?? 0} change="4.1%" color="bg-orange-500" />
            <StatCard title="Tasks completed" value={`${stats?.taskCompleted ?? 0}%`} change"15.2%" color="bg-blue-500" />
        </div>
    </div>
)