import { useState, useEffect } from 'react'
import { getCalendarEvents, createCalendarEvent } from '../api'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, parseISO } from 'date-fns'
import toast from 'react-hot-toast'

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const data = await getCalendarEvents()
      setEvents(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async (eventData) => {
    try {
      await createCalendarEvent(eventData)
      toast.success('Event created')
      setIsModalOpen(false)
      loadEvents()
    } catch (error) {
      toast.error('Failed to create event')
    }
  }

  const handleDayClick = (day) => {
    setSelectedDate(format(day, 'yyyy-MM-dd'))
    setIsModalOpen(true)
  }

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const dateFormat = "d"
  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate
  })

  const getEventsForDay = (day) => {
    return events.filter(e => {
      if (!e.start_time) return false
      return isSameDay(parseISO(e.start_time), day)
    })
  }

  const getEventColor = (type) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
      case 'task_due': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800'
      case 'deal_close': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
      default: return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800'
    }
  }

  return (
    <div className="pb-8 h-full flex flex-col">
      <AddEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateEvent}
        selectedDate={selectedDate}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Calendar</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">Schedule meetings and track important deadlines.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition">
             <svg className="w-5 h-5 text-gray-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <span className="font-bold text-gray-800 dark:text-slate-200 min-w-[120px] text-center">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <button onClick={nextMonth} className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition">
             <svg className="w-5 h-5 text-gray-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
          <button
            onClick={() => handleDayClick(new Date())}
            className="ml-4 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
          >
            New Event
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 auto-rows-fr">
          {calendarDays.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, monthStart)
            const isToday = isSameDay(day, new Date())
            const dayEvents = getEventsForDay(day)
            
            return (
              <div 
                key={day.toString()} 
                onClick={() => handleDayClick(day)}
                className={`min-h-[120px] border-b border-r border-gray-100 dark:border-slate-800/50 p-2 cursor-pointer hover:bg-indigo-50/30 dark:hover:bg-slate-800/50 transition flex flex-col gap-1 ${
                  !isCurrentMonth ? 'bg-gray-50/50 dark:bg-slate-800/20 text-gray-400 dark:text-slate-600' : 'bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200'
                } ${idx % 7 === 6 ? 'border-r-0' : ''}`}
              >
                <div className="flex justify-end">
                  <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-indigo-600 text-white' : ''
                  }`}>
                    {format(day, dateFormat)}
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-1 mt-1 custom-scrollbar">
                  {dayEvents.map(event => (
                    <div 
                      key={event.id} 
                      className={`text-xs px-2 py-1 rounded border truncate font-medium ${getEventColor(event.type)}`}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function AddEventModal({ isOpen, onClose, onSubmit, selectedDate }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [type, setType] = useState('meeting')

  useEffect(() => {
    if (selectedDate && isOpen) {
      setDate(selectedDate)
    }
  }, [selectedDate, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      title,
      description,
      start_time: new Date(date).toISOString(),
      type
    })
    setTitle('')
    setDescription('')
    setDate('')
    setType('meeting')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md relative z-10 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">New Event</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1.5">Event Title *</label>
            <input 
              required
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white" 
              placeholder="e.g. Sync with Client" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1.5">Date *</label>
              <input 
                required
                type="date"
                value={date} 
                onChange={e => setDate(e.target.value)} 
                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1.5">Event Type</label>
              <select 
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                <option value="meeting">Meeting</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1.5">Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white min-h-[80px]" 
            />
          </div>
          
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
             <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition shadow-sm">
                Cancel
             </button>
             <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition shadow-sm">
                Save Event
             </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Calendar
