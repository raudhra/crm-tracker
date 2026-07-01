import { useState, useEffect } from 'react'

export default function CustomerModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '', status: 'Active'
  })

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        company: initialData.company || '',
        status: initialData.status || 'Active'
      })
    } else if (isOpen) {
      setFormData({
        name: '', email: '', phone: '', company: '', status: 'Active'
      })
    }
  }, [initialData, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const isEdit = !!initialData

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-900/40 dark:bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-slate-900 md:rounded-2xl w-full h-full md:h-auto md:max-h-[90vh] md:max-w-md relative z-10 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-transparent dark:border-slate-800 flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-20 shrink-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{isEdit ? 'Edit Customer' : 'Add Customer'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 flex-1 overflow-y-auto custom-scrollbar">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1.5">Full Name *</label>
            <input 
              required
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white" 
              placeholder="e.g. Acme Corp" 
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1.5">Email Address</label>
            <input 
              type="email"
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white" 
              placeholder="info@example.com" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1.5">Phone</label>
                <input 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white" 
                  placeholder="(555) 123-4567" 
                />
             </div>
             <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1.5">Status</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
             </div>
          </div>
          <div>
             <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1.5">Company</label>
             <input 
               value={formData.company} 
               onChange={e => setFormData({...formData, company: e.target.value})} 
               className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white" 
               placeholder="Company name" 
             />
          </div>
          
          <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-slate-800 sticky bottom-[-24px] bg-white dark:bg-slate-900 pb-6 pt-4 z-20 shrink-0">
             <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition shadow-sm">
                Cancel
             </button>
             <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition shadow-sm">
                {isEdit ? 'Save Changes' : 'Save Customer'}
             </button>
          </div>
        </form>
      </div>
    </div>
  )
}
