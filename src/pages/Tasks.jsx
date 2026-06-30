import { useState, useEffect } from 'react'
import { getTasks, createTask, updateTask, deleteTask, getCustomers } from '../api'
import toast from 'react-hot-toast'
import { motion, LayoutGroup } from 'framer-motion'
import TaskModal from '../components/TaskModal'

function Tasks() {
  const [tasks, setTasks] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
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

  const handleCreateOrUpdateTask = async (taskData) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskData)
        toast.success('Task updated successfully')
      } else {
        await createTask(taskData)
        toast.success('Task created successfully')
      }
      setIsModalOpen(false)
      setEditingTask(null)
      loadData()
    } catch (error) {
      toast.error(editingTask ? 'Failed to update task' : 'Failed to create task')
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    try {
      await deleteTask(taskId)
      toast.success('Task deleted')
      setTasks(tasks.filter(t => t.id !== taskId))
      setIsModalOpen(false)
      setEditingTask(null)
    } catch (error) {
      toast.error('Failed to delete task')
    }
  }

  const openEditModal = (task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    setEditingTask(null)
    setIsModalOpen(true)
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
    { id: 'todo', title: 'To Do', accent: 'border-t-gray-400 dark:border-t-slate-500', bg: 'bg-gray-50/50 dark:bg-slate-800/30', border: 'border-gray-200 dark:border-slate-800' },
    { id: 'in_progress', title: 'In Progress', accent: 'border-t-blue-500 dark:border-t-blue-400', bg: 'bg-blue-50/30 dark:bg-blue-900/10', border: 'border-blue-200 dark:border-blue-900/30' },
    { id: 'done', title: 'Done', accent: 'border-t-green-500 dark:border-t-green-400', bg: 'bg-green-50/30 dark:bg-green-900/10', border: 'border-green-200 dark:border-green-900/30' }
  ]

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      case 'med': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      case 'low': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      default: return 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-400'
    }
  }

  return (
    <div className="pb-8 h-full flex flex-col">
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
        onSubmit={handleCreateOrUpdateTask}
        onDelete={handleDeleteTask}
        initialData={editingTask}
        customers={customers}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Tasks Board</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">Manage your workflow and track progress.</p>
        </div>
        <button
          onClick={openCreateModal}
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
          <div className="flex-1 flex gap-6 overflow-x-auto pb-4 max-h-[calc(100vh-200px)]">
            {columns.map(col => (
              <motion.div 
                layout
                key={col.id} 
                className={`flex-shrink-0 w-80 rounded-xl border ${col.border} ${col.bg} flex flex-col overflow-y-auto custom-scrollbar transition-all duration-200
                  ${dragOverCol === col.id ? 'ring-2 ring-indigo-400 shadow-lg bg-indigo-50/10 dark:bg-indigo-900/10' : ''}`}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <div className={`sticky top-0 z-10 flex items-center justify-between p-4 mb-2 border-t-4 ${col.accent} ${col.bg} backdrop-blur-sm rounded-t-lg`}>
                  <h3 className="font-semibold text-gray-800 dark:text-slate-200">{col.title}</h3>
                  <motion.span 
                    key={tasks.filter(t => t.status === col.id).length}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="bg-white dark:bg-slate-700 text-gray-500 dark:text-slate-300 text-xs px-2.5 py-1 rounded-full border border-gray-200 dark:border-slate-600 shadow-sm font-medium"
                  >
                    {tasks.filter(t => t.status === col.id).length}
                  </motion.span>
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
                  {tasks.filter(t => t.status === col.id).length === 0 && (
                    <div className="flex-1 border-2 border-dashed border-gray-300/50 dark:border-slate-700/50 rounded-lg flex items-center justify-center text-sm text-gray-400 dark:text-slate-500">
                      Drop tasks here
                    </div>
                  )}
                  {tasks.filter(t => t.status === col.id).map(task => (
                    <motion.div
                      layout
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0 }
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 28 }}
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => openEditModal(task)}
                      className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group relative"
                    >
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                      
                      <div className="flex gap-2 mb-2 pr-6">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      
                      <h4 className="font-medium text-gray-900 dark:text-slate-200 mb-1">{task.title}</h4>
                      {task.description && (
                        <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-2 mb-3">{task.description}</p>
                      )}
                      
                      {(task.customer_id || task.due_date) && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
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
                </motion.div>
              </motion.div>
            ))}
          </div>
        </LayoutGroup>
      )}
    </div>
  )
}

export default Tasks
