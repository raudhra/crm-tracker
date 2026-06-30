import { useState, useEffect } from 'react'
import { getCustomers, createCustomer, updateCustomer } from '../services/api'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import CustomerModal from '../components/CustomerModal'

function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const navigate = useNavigate()
  
  const loadCustomers = async () => {
    setLoading(true)
    try {
      const data = await getCustomers(search, filter)
      setCustomers(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  // Reload when filters change (with small debounce for search could be added, but simple here)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers()
    }, 300)
    return () => clearTimeout(timer)
  }, [search, filter])

  const handleCreateOrUpdateCustomer = async (customerData) => {
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, customerData)
        toast.success('Customer updated successfully')
      } else {
        await createCustomer(customerData)
        toast.success('Customer added successfully')
      }
      setIsModalOpen(false)
      setEditingCustomer(null)
      loadCustomers()
    } catch (error) {
      toast.error(error.message || (editingCustomer ? 'Failed to update customer' : 'Failed to add customer'))
    }
  }

  const openCreateModal = () => {
    setEditingCustomer(null)
    setIsModalOpen(true)
  }

  const openEditModal = (customer, e) => {
    e.stopPropagation() // prevent row click navigation
    setEditingCustomer(customer)
    setIsModalOpen(true)
  }

  const handleRowClick = (customerId) => {
    navigate(`/customers/${customerId}`)
  }

  const itemsPerPage = 8
  const totalPages = Math.max(1, Math.ceil(customers.length / itemsPerPage))
  const paginatedCustomers = customers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="pb-8">
      {/* Add/Edit Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCustomer(null); }}
        onSubmit={handleCreateOrUpdateCustomer}
        initialData={editingCustomer}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Customers</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">Manage your customers and their information.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors active:scale-[0.98] shadow-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Add Customer
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="block w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm placeholder-gray-400 dark:placeholder-slate-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
             <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 whitespace-nowrap">
               <svg className="w-4 h-4 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
               Filter
             </button>
             
             <div className="flex bg-gray-50 dark:bg-slate-800/50 p-1 rounded-lg border border-gray-200 dark:border-slate-700">
               {['All', 'Active', 'Pending', 'Inactive'].map(s => (
                 <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors
                      ${filter === s ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-200 dark:border-slate-600' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 border border-transparent'}`}
                 >
                   {s}
                 </button>
               ))}
             </div>
             
             <button className="flex items-center gap-1 px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 whitespace-nowrap">
               More
               <svg className="w-4 h-4 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
             </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Contact</th>
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
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center"><div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
                  </td>
                </tr>
              ) : paginatedCustomers.length === 0 ? (
                <motion.tr variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                      </div>
                      <h3 className="text-gray-900 dark:text-slate-200 text-base font-semibold mb-1">No customers found</h3>
                      <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">Get started by creating a new customer record.</p>
                      <button onClick={openCreateModal} className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors active:scale-[0.98]">
                        Add your first customer
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ) : (
                paginatedCustomers.map(customer => (
                  <motion.tr 
                    variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.2 } } }}
                    key={customer.id} 
                    onClick={() => handleRowClick(customer.id)}
                    className="hover:bg-gray-50/60 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {customer.avatar ? (
                           <img src={customer.avatar} alt={customer.name} className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-slate-700" />
                        ) : (
                           <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm
                              ${customer.status === 'Active' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400' : 
                                customer.status === 'Pending' ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400' : 
                                'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300'}`}>
                             {customer.name?.[0]?.toUpperCase() || 'C'}
                           </div>
                        )}
                        <span className="font-semibold text-gray-900 dark:text-slate-200 text-sm">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-400">
                      {customer.email || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-400">
                      {customer.phone || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border
                        ${customer.status === 'Active' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800' : 
                          customer.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800' : 
                          'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-400">
                       {customer.lastContact ? new Date(customer.lastContact).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button 
                        onClick={(e) => openEditModal(customer, e)}
                        className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 relative z-10"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </motion.tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && customers.length > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Showing <span className="font-medium text-gray-900 dark:text-white">{Math.min(customers.length, (currentPage - 1) * itemsPerPage + 1)}</span> to <span className="font-medium text-gray-900 dark:text-white">{Math.min(customers.length, currentPage * itemsPerPage)}</span> of <span className="font-medium text-gray-900 dark:text-white">{customers.length}</span> results
            </p>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              
              <div className="flex gap-1">
                {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
                   <button
                     key={page}
                     onClick={() => setCurrentPage(page)}
                     className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors
                        ${currentPage === page ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                   >
                     {page}
                   </button>
                ))}
              </div>

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Customers