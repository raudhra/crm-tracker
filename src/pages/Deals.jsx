import { useState, useEffect } from 'react'
import { getDeals, createDeal, updateDeal, updateDealStage, deleteDeal, getCustomers } from '../api'
import toast from 'react-hot-toast'
import { motion, LayoutGroup } from 'framer-motion'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0)
}

function Deals() {
  const [deals, setDeals] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState(null)
  const [draggedDealId, setDraggedDealId] = useState(null)
  const [dragOverCol, setDragOverCol] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [dealsData, customersData] = await Promise.all([
        getDeals(),
        getCustomers()
      ])
      setDeals(Array.isArray(dealsData) ? dealsData : [])
      setCustomers(Array.isArray(customersData) ? customersData : [])
    } catch (error) {
      toast.error('Failed to load deals data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDeal = async (dealData) => {
    try {
      await createDeal(dealData)
      toast.success('Deal created successfully')
      setIsNewModalOpen(false)
      loadData()
    } catch (error) {
      toast.error('Failed to create deal')
    }
  }

  const handleUpdateDeal = async (dealId, dealData) => {
    try {
      await updateDeal(dealId, dealData)
      toast.success('Deal updated')
      setSelectedDeal(null)
      loadData()
    } catch (error) {
      toast.error('Failed to update deal')
    }
  }

  const handleDeleteDeal = async (dealId) => {
    if (!confirm('Are you sure you want to delete this deal?')) return
    try {
      await deleteDeal(dealId)
      toast.success('Deal deleted')
      setSelectedDeal(null)
      setDeals(deals.filter(d => d.id !== dealId))
    } catch (error) {
      toast.error('Failed to delete deal')
    }
  }

  const handleDragStart = (e, dealId) => {
    setDraggedDealId(dealId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', dealId)
  }

  const handleDragOver = (e, colId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverCol !== colId) setDragOverCol(colId)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOverCol(null)
  }

  const handleDrop = async (e, newStage) => {
    e.preventDefault()
    setDragOverCol(null)
    if (!draggedDealId) return

    const deal = deals.find(d => d.id === draggedDealId)
    if (!deal || deal.stage === newStage) {
      setDraggedDealId(null)
      return
    }

    // Optimistic update
    setDeals(deals.map(d => d.id === draggedDealId ? { ...d, stage: newStage } : d))
    setDraggedDealId(null)

    try {
      await updateDealStage(draggedDealId, newStage)
      toast.success('Deal moved')
    } catch (error) {
      toast.error('Failed to update deal stage')
      // Revert on failure
      loadData()
    }
  }

  const columns = [
    { id: 'lead', title: 'Lead', accent: 'border-t-blue-500', bg: 'bg-gray-50 dark:bg-slate-800/30', border: 'border-gray-200 dark:border-slate-800' },
    { id: 'contacted', title: 'Contacted', accent: 'border-t-purple-500', bg: 'bg-blue-50/50 dark:bg-blue-900/10', border: 'border-blue-200 dark:border-blue-900/30' },
    { id: 'proposal', title: 'Proposal', accent: 'border-t-pink-500', bg: 'bg-purple-50/50 dark:bg-purple-900/10', border: 'border-purple-200 dark:border-purple-900/30' },
    { id: 'negotiation', title: 'Negotiation', accent: 'border-t-orange-500', bg: 'bg-orange-50/50 dark:bg-orange-900/10', border: 'border-orange-200 dark:border-orange-900/30' },
    { id: 'won', title: 'Won', accent: 'border-t-green-500', bg: 'bg-green-50/50 dark:bg-green-900/10', border: 'border-green-200 dark:border-green-900/30' },
    { id: 'lost', title: 'Lost', accent: 'border-t-red-500', bg: 'bg-red-50/50 dark:bg-red-900/10', border: 'border-red-200 dark:border-red-900/30' }
  ]

  const getCustomerName = (id) => {
    const c = customers.find(c => c.id === id)
    return c ? c.name : 'Unknown Customer'
  }

  return (
    <div className="pb-8 h-full flex flex-col">
      <AddDealModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreateDeal}
        customers={customers}
      />
      
      {selectedDeal && (
        <EditDealModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onSubmit={(data) => handleUpdateDeal(selectedDeal.id, data)}
          onDelete={() => handleDeleteDeal(selectedDeal.id)}
          customers={customers}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Sales Pipeline</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">Track and manage your deals across all stages.</p>
        </div>
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors active:scale-[0.98] shadow-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          New Deal
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <LayoutGroup>
          <div className="flex-1 flex gap-6 overflow-x-auto pb-4 max-h-[calc(100vh-200px)]">
            {columns.map(col => {
              const columnDeals = deals.filter(d => d.stage === col.id)
              const totalValue = columnDeals.reduce((sum, d) => sum + (d.value || 0), 0)
              
              return (
                <motion.div 
                  layout
                  key={col.id} 
                  className={`flex-shrink-0 w-80 rounded-xl border ${col.border} ${col.bg} flex flex-col overflow-y-auto custom-scrollbar transition-all duration-200
                    ${dragOverCol === col.id ? 'ring-2 ring-indigo-400 shadow-lg bg-indigo-50/10 dark:bg-indigo-900/10' : ''}`}
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, col.id)}
                >
                  <div className={`sticky top-0 z-10 p-4 mb-2 border-t-4 ${col.accent} ${col.bg} backdrop-blur-sm rounded-t-lg`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800 dark:text-slate-200">{col.title}</h3>
                      <motion.span 
                        key={columnDeals.length}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="bg-white dark:bg-slate-700 text-gray-500 dark:text-slate-300 text-xs px-2.5 py-1 rounded-full border border-gray-200 dark:border-slate-600 shadow-sm font-medium"
                      >
                        {columnDeals.length}
                      </motion.span>
                    </div>
                    <div className="text-sm font-bold text-indigo-700 dark:text-indigo-400">
                      {formatCurrency(totalValue)}
                    </div>
                  </div>
                  
                  <motion.div 
                    className="flex-1 flex flex-col gap-3 min-h-[100px] px-4 pb-4"
                    variants={{
                      hidden: {},
                      show: {
                        transition: { staggerChildren: 0.03 }
                      }
                    }}
                    initial="hidden"
                    animate="show"
                  >
                    {columnDeals.length === 0 && (
                      <div className="flex-1 border-2 border-dashed border-gray-300/50 dark:border-slate-700/50 rounded-lg flex items-center justify-center text-sm text-gray-400 dark:text-slate-500">
                        Drop deals here
                      </div>
                    )}
                    {columnDeals.map(deal => (
                      <motion.div
                        layout
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          show: { opacity: 1, y: 0 }
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                        key={deal.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal.id)}
                        onClick={() => setSelectedDeal(deal)}
                        className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all"
                      >
                        <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                          {getCustomerName(deal.customer_id)}
                        </div>
                        
                        <h4 className="font-medium text-gray-900 dark:text-slate-200 mb-2 leading-tight">{deal.title}</h4>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-bold text-gray-700 dark:text-slate-300">{formatCurrency(deal.value)}</span>
                          {deal.expected_close_date && (
                             <span className="text-xs text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-gray-100 dark:border-slate-700">
                               {new Date(deal.expected_close_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                             </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        </LayoutGroup>
      )}
    </div>
  )
}

function AddDealModal({ isOpen, onClose, onSubmit, customers }) {
  const [formData, setFormData] = useState({
    title: '', customer_id: '', value: '', stage: 'lead', expected_close_date: '', notes: ''
  })

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...formData,
      customer_id: parseInt(formData.customer_id),
      value: parseFloat(formData.value) || 0,
      expected_close_date: formData.expected_close_date ? new Date(formData.expected_close_date).toISOString() : null
    }
    onSubmit(payload)
    setFormData({ title: '', customer_id: '', value: '', stage: 'lead', expected_close_date: '', notes: '' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg relative z-10 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">New Deal</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1.5">Deal Title *</label>
            <input 
              required
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white" 
              placeholder="e.g. Q3 Enterprise License" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1.5">Customer *</label>
              <select 
                required
                value={formData.customer_id}
                onChange={e => setFormData({...formData, customer_id: e.target.value})}
                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                <option value="">-- Select Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1.5">Value ($)</label>
              <input 
                type="number"
                min="0"
                step="0.01"
                value={formData.value} 
                onChange={e => setFormData({...formData, value: e.target.value})} 
                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white" 
                placeholder="10000" 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1.5">Stage</label>
              <select 
                value={formData.stage}
                onChange={e => setFormData({...formData, stage: e.target.value})}
                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                <option value="lead">Lead</option>
                <option value="contacted">Contacted</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Expected Close Date</label>
              <input 
                type="date"
                value={formData.expected_close_date} 
                onChange={e => setFormData({...formData, expected_close_date: e.target.value})} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1.5">Notes</label>
            <textarea 
              value={formData.notes} 
              onChange={e => setFormData({...formData, notes: e.target.value})} 
              className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white min-h-[80px]" 
              placeholder="Additional information..." 
            />
          </div>
          
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
             <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition shadow-sm">
                Cancel
             </button>
             <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition shadow-sm">
                Create Deal
             </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditDealModal({ deal, onClose, onSubmit, onDelete, customers }) {
  const [formData, setFormData] = useState({
    title: deal.title, 
    value: deal.value, 
    expected_close_date: deal.expected_close_date ? deal.expected_close_date.split('T')[0] : '', 
    notes: deal.notes || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...formData,
      value: parseFloat(formData.value) || 0,
      expected_close_date: formData.expected_close_date ? new Date(formData.expected_close_date).toISOString() : null
    }
    onSubmit(payload)
  }

  const cName = customers.find(c => c.id === deal.customer_id)?.name || 'Unknown'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg relative z-10 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Deal</h2>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onDelete} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded-lg transition" title="Delete Deal">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 border border-gray-100 dark:border-slate-700 mb-2">
            <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">Customer</div>
            <div className="font-semibold text-gray-900 dark:text-slate-200">{cName}</div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1.5">Deal Title *</label>
            <input 
              required
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1.5">Value ($)</label>
              <input 
                type="number"
                min="0"
                step="0.01"
                value={formData.value} 
                onChange={e => setFormData({...formData, value: e.target.value})} 
                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Expected Close Date</label>
              <input 
                type="date"
                value={formData.expected_close_date} 
                onChange={e => setFormData({...formData, expected_close_date: e.target.value})} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1.5">Notes</label>
            <textarea 
              value={formData.notes} 
              onChange={e => setFormData({...formData, notes: e.target.value})} 
              className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white min-h-[80px]" 
            />
          </div>
          
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
             <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition shadow-sm">
                Cancel
             </button>
             <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition shadow-sm">
                Save Changes
             </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Deals
