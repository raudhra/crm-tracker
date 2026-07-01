import { useState, useEffect } from 'react'
import { getInvoices, createInvoice, updateInvoice, deleteInvoice, downloadInvoicePdf, getCustomers } from '../api'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0)
}

function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [downloadingId, setDownloadingId] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [invoicesData, customersData] = await Promise.all([
        getInvoices(),
        getCustomers()
      ])
      setInvoices(Array.isArray(invoicesData) ? invoicesData : [])
      setCustomers(Array.isArray(customersData) ? customersData : [])
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInvoice = async (invoiceData) => {
    try {
      await createInvoice(invoiceData)
      toast.success('Invoice created successfully')
      setIsModalOpen(false)
      loadData()
    } catch (error) {
      toast.error('Failed to create invoice')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return
    try {
      await deleteInvoice(id)
      toast.success('Invoice deleted')
      setInvoices(invoices.filter(i => i.id !== id))
    } catch (error) {
      toast.error('Failed to delete invoice')
    }
  }

  const handleDownloadPdf = async (id) => {
    setDownloadingId(id)
    try {
      await downloadInvoicePdf(id)
      toast.success('Download started')
    } catch (error) {
      toast.error('Failed to download PDF')
    } finally {
      setDownloadingId(null)
    }
  }

  const getCustomerName = (id) => {
    const c = customers.find(c => c.id === id)
    return c ? c.name : 'Unknown'
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid': return <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-md text-xs font-medium border border-green-200 dark:border-green-800">Paid</span>
      case 'sent': return <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-md text-xs font-medium border border-blue-200 dark:border-blue-800">Sent</span>
      case 'overdue': return <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2.5 py-1 rounded-md text-xs font-medium border border-red-200 dark:border-red-800">Overdue</span>
      default: return <span className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-200 dark:border-slate-700">Draft</span>
    }
  }

  return (
    <div className="pb-8">
      <AddInvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateInvoice}
        customers={customers}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Invoices</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">Manage your billing and payments.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto justify-center bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors active:scale-[0.98] shadow-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          New Invoice
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-x-auto">
          {/* Desktop Table */}
          <table className="hidden md:table w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Invoice</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Issue Date</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <motion.tbody 
              initial="hidden" 
              animate="show" 
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.04 } }
              }}
              className="divide-y divide-gray-100"
            >
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center"><div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <motion.tr variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      </div>
                      <h3 className="text-gray-900 dark:text-slate-200 text-base font-semibold mb-1">No invoices found</h3>
                      <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">Get started by creating a new invoice.</p>
                      <button onClick={() => setIsModalOpen(true)} className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors active:scale-[0.98]">
                        Create your first invoice
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ) : (
                invoices.map(invoice => (
                  <motion.tr 
                    variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.2 } } }}
                    key={invoice.id} 
                    className="hover:bg-gray-50/60 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-slate-200">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-400 font-medium">
                      {getCustomerName(invoice.customer_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                      {new Date(invoice.issue_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-slate-200">
                      {formatCurrency(invoice.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleDownloadPdf(invoice.id)}
                          disabled={downloadingId === invoice.id}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition p-1.5 rounded bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 disabled:opacity-50 flex items-center gap-1"
                          title="Download PDF"
                        >
                          {downloadingId === invoice.id ? (
                            <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                          )}
                          <span className="text-xs">PDF</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(invoice.id)}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </motion.tbody>
          </table>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col divide-y divide-gray-100 dark:divide-slate-800">
            {loading ? (
              <div className="px-6 py-12 text-center text-gray-500">
                <div className="flex justify-center"><div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
              </div>
            ) : invoices.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </div>
                  <h3 className="text-gray-900 dark:text-slate-200 text-base font-semibold mb-1">No invoices found</h3>
                  <button onClick={() => setIsModalOpen(true)} className="mt-4 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors active:scale-[0.98]">
                    Create your first invoice
                  </button>
                </div>
              </div>
            ) : (
              invoices.map(invoice => (
                <div key={invoice.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-slate-200 text-base flex items-center gap-2">
                        {invoice.invoice_number}
                        {getStatusBadge(invoice.status)}
                      </div>
                      <div className="text-sm font-medium text-gray-600 dark:text-slate-400 mt-1">
                        {getCustomerName(invoice.customer_id)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleDownloadPdf(invoice.id)}
                        disabled={downloadingId === invoice.id}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30 disabled:opacity-50"
                      >
                        {downloadingId === invoice.id ? (
                          <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        )}
                      </button>
                      <button 
                        onClick={() => handleDelete(invoice.id)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-500 dark:text-slate-400">
                      Due: {new Date(invoice.due_date).toLocaleDateString()}
                    </div>
                    <div className="font-bold text-gray-900 dark:text-slate-200">
                      {formatCurrency(invoice.total_amount)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function AddInvoiceModal({ isOpen, onClose, onSubmit, customers }) {
  const [customer_id, setCustomerId] = useState('')
  const [status, setStatus] = useState('draft')
  const [issue_date, setIssueDate] = useState('')
  const [due_date, setDueDate] = useState('')
  const [lineItems, setLineItems] = useState([{ description: '', quantity: 1, unit_price: 0 }])

  if (!isOpen) return null

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unit_price: 0 }])
  }

  const handleRemoveLineItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const handleLineItemChange = (index, field, value) => {
    const newItems = [...lineItems]
    newItems[index][field] = value
    setLineItems(newItems)
  }

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const processedItems = lineItems.filter(i => i.description.trim() !== '').map(i => ({
      ...i,
      quantity: parseInt(i.quantity) || 0,
      unit_price: parseFloat(i.unit_price) || 0
    }))

    if (processedItems.length === 0) {
      toast.error('Please add at least one line item')
      return
    }

    const payload = {
      customer_id: parseInt(customer_id),
      status,
      line_items: processedItems,
      issue_date: issue_date ? new Date(issue_date).toISOString() : undefined,
      due_date: due_date ? new Date(due_date).toISOString() : undefined
    }

    onSubmit(payload)
    
    // reset form
    setCustomerId('')
    setStatus('draft')
    setIssueDate('')
    setDueDate('')
    setLineItems([{ description: '', quantity: 1, unit_price: 0 }])
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-slate-900 md:rounded-2xl w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl relative z-10 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-20 shrink-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">New Invoice</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1.5">Customer *</label>
              <select 
                required
                value={customer_id}
                onChange={e => setCustomerId(e.target.value)}
                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                <option value="">-- Select Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1.5">Status</label>
              <select 
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1.5">Issue Date (Optional)</label>
              <input 
                type="date"
                value={issue_date} 
                onChange={e => setIssueDate(e.target.value)} 
                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1.5">Due Date (Optional)</label>
              <input 
                type="date"
                value={due_date} 
                onChange={e => setDueDate(e.target.value)} 
                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]" 
              />
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block">Line Items</label>
              <button 
                type="button" 
                onClick={handleAddLineItem}
                className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-2 py-1 rounded text-xs font-medium"
              >
                + Add Item
              </button>
            </div>
            
            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4 border border-gray-200 dark:border-slate-700 flex flex-col gap-3">
              {lineItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input 
                    placeholder="Description" 
                    required
                    value={item.description}
                    onChange={e => handleLineItemChange(idx, 'description', e.target.value)}
                    className="flex-1 min-w-[200px] border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white" 
                  />
                  <input 
                    type="number" 
                    placeholder="Qty"
                    min="1"
                    required
                    value={item.quantity}
                    onChange={e => handleLineItemChange(idx, 'quantity', e.target.value)}
                    className="w-20 border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white" 
                  />
                  <input 
                    type="number" 
                    placeholder="Price"
                    min="0"
                    step="0.01"
                    required
                    value={item.unit_price}
                    onChange={e => handleLineItemChange(idx, 'unit_price', e.target.value)}
                    className="w-24 border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white" 
                  />
                  <button 
                    type="button"
                    onClick={() => handleRemoveLineItem(idx)}
                    disabled={lineItems.length === 1}
                    className="text-red-400 hover:text-red-600 disabled:opacity-30 p-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              ))}
              
              <div className="flex justify-end pt-3 border-t border-gray-200 dark:border-slate-700 mt-2">
                 <div className="text-right">
                   <div className="text-sm text-gray-500 dark:text-slate-400">Total</div>
                   <div className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(calculateTotal())}</div>
                 </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-slate-800 sticky bottom-[-24px] bg-white dark:bg-slate-900 pb-6 pt-4 z-20 shrink-0">
             <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition shadow-sm">
                Cancel
             </button>
             <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition shadow-sm">
                Save Invoice
             </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Invoices
