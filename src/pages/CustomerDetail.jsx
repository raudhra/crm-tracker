import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getCustomerById, updateCustomer } from '../services/api'
import { getDeals, getTasks, getInvoices, getMessages } from '../api'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import CustomerModal from '../components/CustomerModal'
import TaskModal from '../components/TaskModal'

const statusColor = { Active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400', Pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', Inactive: 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400' }
const stageColor = { lead: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', contacted: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400', proposal: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400', negotiation: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400', won: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400', lost: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' }
const priorityColor = { high: 'text-red-600 dark:text-red-400', med: 'text-amber-600 dark:text-amber-400', low: 'text-blue-600 dark:text-blue-400' }
const channelIcon = { note: '📝', email: '✉️', call: '📞', meeting: '🤝' }

function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(null)
  const [deals, setDeals] = useState([])
  const [tasks, setTasks] = useState([])
  const [invoices, setInvoices] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [taskModalOpen, setTaskModalOpen] = useState(false)

  const loadData = async () => {
    try {
      const [cust, d, t, inv, msg] = await Promise.all([
        getCustomerById(id),
        getDeals(null, id),
        getTasks(null, id),
        getInvoices(null, id),
        getMessages(id)
      ])
      setCustomer(cust)
      setDeals(Array.isArray(d) ? d : [])
      setTasks(Array.isArray(t) ? t : [])
      setInvoices(Array.isArray(inv) ? inv : [])
      setMessages(Array.isArray(msg) ? msg : [])
    } catch (err) {
      toast.error('Failed to load customer details')
      navigate('/customers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [id])

  const handleUpdateCustomer = async (data) => {
    try {
      const updated = await updateCustomer(id, data)
      setCustomer(updated)
      setEditModalOpen(false)
      toast.success('Customer updated')
    } catch { toast.error('Failed to update customer') }
  }

  if (loading) return <div className="flex h-full items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
  if (!customer) return null

  const totalDealValue = deals.reduce((s, d) => s + (d.value || 0), 0)
  const wonDeals = deals.filter(d => d.stage === 'won')
  const totalInvoiced = invoices.reduce((s, i) => s + (i.total_amount || 0), 0)
  const initials = customer.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'deals', label: 'Deals', count: deals.length },
    { key: 'tasks', label: 'Tasks', count: tasks.length },
    { key: 'invoices', label: 'Invoices', count: invoices.length },
    { key: 'messages', label: 'Messages', count: messages.length },
  ]

  return (
    <div className="pb-8">
      <CustomerModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} onSubmit={handleUpdateCustomer} initialData={customer} />
      <TaskModal isOpen={taskModalOpen} onClose={() => { setTaskModalOpen(false); setEditingTask(null) }} onSubmit={() => { setTaskModalOpen(false); setEditingTask(null); loadData() }} initialData={editingTask} />

      {/* Back + Header */}
      <button onClick={() => navigate('/customers')} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
        Back to Customers
      </button>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-800 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-200/50 dark:shadow-none shrink-0">{initials}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{customer.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor[customer.status] || 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'}`}>{customer.status}</span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-slate-400 flex-wrap">
              {customer.company && <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>{customer.company}</span>}
              {customer.email && <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>{customer.email}</span>}
              {customer.phone && <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>{customer.phone}</span>}
            </div>
          </div>
          <button onClick={() => setEditModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm flex items-center gap-2 shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
            Edit
          </button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Deals', value: deals.length, sub: `$${totalDealValue.toLocaleString()} pipeline`, color: 'text-indigo-600 dark:text-indigo-400' },
          { label: 'Won Deals', value: wonDeals.length, sub: `$${wonDeals.reduce((s,d) => s+d.value, 0).toLocaleString()} won`, color: 'text-green-600 dark:text-green-400' },
          { label: 'Open Tasks', value: tasks.filter(t => t.status !== 'done').length, sub: `${tasks.filter(t => t.status === 'done').length} completed`, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Total Invoiced', value: `$${totalInvoiced.toLocaleString()}`, sub: `${invoices.length} invoices`, color: 'text-purple-600 dark:text-purple-400' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-slate-800 mb-6 flex gap-1 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${activeTab === tab.key ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}>
            {tab.label}{tab.count != null && <span className="ml-1.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-1.5 py-0.5 rounded-full text-xs">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Deals */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-gray-900 dark:text-white">Recent Deals</h3><Link to="/deals" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">View all</Link></div>
            {deals.length === 0 ? <p className="text-sm text-gray-400 text-center py-6">No deals yet</p> : deals.slice(0, 5).map(deal => (
              <div key={deal.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-slate-800/50 last:border-0">
                <div><p className="text-sm font-medium text-gray-900 dark:text-slate-200">{deal.title}</p><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageColor[deal.stage] || 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300'}`}>{deal.stage}</span></div>
                <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">${(deal.value || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
          {/* Recent Tasks */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-gray-900 dark:text-white">Tasks</h3><Link to="/tasks" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">View all</Link></div>
            {tasks.length === 0 ? <p className="text-sm text-gray-400 text-center py-6">No tasks yet</p> : tasks.slice(0, 5).map(task => (
              <div key={task.id} onClick={() => { setEditingTask(task); setTaskModalOpen(true) }} className="flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-slate-800/50 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-lg px-2 -mx-2 transition">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${task.status === 'done' ? 'bg-green-500' : task.status === 'in_progress' ? 'bg-amber-500' : 'bg-gray-300 dark:bg-slate-600'}`}></div>
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-200">{task.title}</p>
                </div>
                <span className={`text-xs font-medium ${priorityColor[task.priority] || ''}`}>{task.priority}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'deals' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 overflow-hidden">
          {deals.length === 0 ? <p className="text-sm text-gray-400 text-center py-12">No deals linked to this customer</p> : (
            <table className="w-full">
              <thead><tr className="bg-gray-50/80 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3">Deal</th><th className="px-5 py-3">Stage</th><th className="px-5 py-3">Value</th><th className="px-5 py-3">Expected Close</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {deals.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/50 transition">
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900 dark:text-slate-200">{d.title}</td>
                    <td className="px-5 py-3.5"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageColor[d.stage] || 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300'}`}>{d.stage}</span></td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-700 dark:text-slate-300">${(d.value || 0).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-slate-400">{d.expected_close_date ? new Date(d.expected_close_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 overflow-hidden">
          {tasks.length === 0 ? <p className="text-sm text-gray-400 text-center py-12">No tasks linked to this customer</p> : (
            <table className="w-full">
              <thead><tr className="bg-gray-50/80 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3">Task</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Priority</th><th className="px-5 py-3">Due Date</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {tasks.map(t => (
                  <tr key={t.id} onClick={() => { setEditingTask(t); setTaskModalOpen(true) }} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/50 transition cursor-pointer">
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900 dark:text-slate-200">{t.title}</td>
                    <td className="px-5 py-3.5"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.status === 'done' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : t.status === 'in_progress' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'}`}>{t.status?.replace('_', ' ')}</span></td>
                    <td className="px-5 py-3.5"><span className={`text-xs font-semibold ${priorityColor[t.priority] || ''}`}>{t.priority}</span></td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-slate-400">{t.due_date ? new Date(t.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 overflow-hidden">
          {invoices.length === 0 ? <p className="text-sm text-gray-400 text-center py-12">No invoices for this customer</p> : (
            <table className="w-full">
              <thead><tr className="bg-gray-50/80 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3">Invoice #</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Due Date</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/50 transition">
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900 dark:text-slate-200">{inv.invoice_number}</td>
                    <td className="px-5 py-3.5"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${inv.status === 'paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : inv.status === 'overdue' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'}`}>{inv.status}</span></td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-700 dark:text-slate-300">${(inv.total_amount || 0).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-slate-400">{inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 p-5">
          {messages.length === 0 ? <p className="text-sm text-gray-400 text-center py-12">No messages for this customer</p> : (
            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto">
              {messages.map(msg => (
                <div key={msg.id} className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-sm shrink-0">{channelIcon[msg.channel] || '💬'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-gray-900 dark:text-slate-200">{msg.sender_name}</span>
                      <span className="text-xs text-gray-400 dark:text-slate-500">{new Date(msg.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                      <span className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 px-1.5 py-0.5 rounded">{msg.channel}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-300">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CustomerDetail
