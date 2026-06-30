import { useState, useEffect } from 'react'
import { getTasks, createTask, updateTask, deleteTask, getCustomers } from '../api'
import toast from 'react-hot-toast'
import { motion, LayoutGroup } from 'framer-motion'

function Tasks() {
  const [tasks, setTasks] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [draggedTaskId, setDraggedTaskId] = useState(null)
  const [dragOverCol, setDragOverCol] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [tasksData, customersData] = await Promise.all([
        getTasks(),
        getCustomers()
      ])
      setTasks(Array.isArray(tasksData) ? tasksData : [])
      setCustomers(Array.isArray(customersData) ? customersData : [])
    } catch (error) {
      toast.error('Failed to load tasks data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (taskData) => {
    try {
      await createTask(taskData)
      toast.success('Task created successfully')
      setIsModalOpen(false)
      loadData()
    } catch (error) {
      toast.error('Failed to create task')
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    try {
      await deleteTask(taskId)
      toast.success('Task deleted')
      setTasks(tasks.filter(t => t.id !== taskId))
    } catch (error) {
      toast.error('Failed to delete task')
    }
  }

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId)
    e.dataTransfer.effectAllowed = 'move'
    // This is required for Firefox to work
    e.dataTransfer.setData('text/plain', taskId)
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

  const handleDrop = async (e, newStatus) => {
    e.preventDefault()
    setDragOverCol(null)
    if (!draggedTaskId) return

    const task = tasks.find(t => t.id === draggedTaskId)
    if (!task || task.status === newStatus) {
      setDraggedTaskId(null)
      return
    }

    // Optimistic update
    setTasks(tasks.map(t => t.id === draggedTaskId ? { ...t, status: newStatus } : t))
    setDraggedTaskId(null)

    try {
      await updateTask(draggedTaskId, { status: newStatus })
      toast.success('Task moved')
    } catch (error) {
      toast.error('Failed to update task status')
      // Revert on failure
      loadData()
    }
  }

  const columns = [
    { id: 'todo', title: 'To Do', color: 'border-gray-200 bg-gray-50/50' },
    { id: 'in_progress', title: 'In Progress', color: 'border-blue-200 bg-blue-50/30' },
    { id: 'done', title: 'Done', color: 'border-green-200 bg-green-50/30' }
  ]

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700'
      case 'med': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="pb-8 h-full flex flex-col">
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
        customers={customers}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Tasks Board</h1>
          <p className="text-gray-500 text-sm">Manage your workflow and track progress.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors active:scale-[0.98] shadow-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          New Task
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <LayoutGroup>
          <div className="flex-1 flex gap-6 overflow-x-auto pb-4 min-h-[500px]">
            {columns.map(col => (
              <motion.div 
                layout
                key={col.id} 
                className={`flex-shrink-0 w-80 rounded-xl border ${col.color} p-4 flex flex-col transition-all duration-200
                  ${dragOverCol === col.id ? 'ring-2 ring-indigo-400 scale-[1.02] shadow-lg' : ''}`}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">{col.title}</h3>
                  <span className="bg-white text-gray-500 text-xs px-2 py-1 rounded-full border border-gray-200 shadow-sm">
                    {tasks.filter(t => t.status === col.id).length}
                  </span>
                </div>
                
                <div className="flex-1 flex flex-col gap-3 min-h-[100px]">
                  {tasks.filter(t => t.status === col.id).length === 0 && (
                    <div className="flex-1 border-2 border-dashed border-gray-300/50 rounded-lg flex items-center justify-center text-sm text-gray-400">
                      Drop tasks here
                    </div>
                  )}
                  {tasks.filter(t => t.status === col.id).map(task => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group relative"
                    >
                      <button 
                        onClick={() => handleDeleteTask(task.id)}
                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                      
                      <div className="flex gap-2 mb-2 pr-6">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      
                      <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                      {task.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{task.description}</p>
                      )}
                      
                      {(task.customer_id || task.due_date) && (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                          {task.customer_id && (
                            <div className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                              <span className="truncate max-w-[100px]">
                                {customers.find(c => c.id === task.customer_id)?.name || 'Client'}
                              </span>
                            </div>
                          )}
                          {task.due_date && (
                            <div className="flex items-center gap-1.5 ml-auto">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                              {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </LayoutGroup>
      )}
    </div>
  )
}

function AddTaskModal({ isOpen, onClose, onSubmit, customers }) {
  const [formData, setFormData] = useState({
    title: '', description: '', status: 'todo', priority: 'med', customer_id: '', due_date: ''
  })

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...formData,
      customer_id: formData.customer_id ? parseInt(formData.customer_id) : null,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null
    }
    onSubmit(payload)
    // reset form
    setFormData({ title: '', description: '', status: 'todo', priority: 'med', customer_id: '', due_date: '' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl w-full max-w-lg relative z-10 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">New Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Task Title *</label>
            <input 
              required
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              placeholder="e.g. Follow up with Acme Corp" 
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Description</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px]" 
              placeholder="Task details..." 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Status</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Priority</label>
              <select 
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="low">Low</option>
                <option value="med">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Due Date</label>
              <input 
                type="date"
                value={formData.due_date} 
                onChange={e => setFormData({...formData, due_date: e.target.value})} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Linked Customer (Optional)</label>
              <select 
                value={formData.customer_id}
                onChange={e => setFormData({...formData, customer_id: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="">-- None --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
             <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm">
                Cancel
             </button>
             <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition shadow-sm">
                Create Task
             </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Tasks
