import { useState, useEffect, useRef } from 'react'
import { getCustomers, getMessages, createMessage } from '../api'
import toast from 'react-hot-toast'

function Messages() {
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Input state
  const [content, setContent] = useState('')
  const [channel, setChannel] = useState('note')
  
  const messagesEndRef = useRef(null)
  
  // Fetch initial customers
  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const data = await getCustomers()
      setCustomers(Array.isArray(data) ? data : [])
      setLoading(false)
    } catch (error) {
      toast.error('Failed to load customers')
      setLoading(false)
    }
  }

  // Handle selected customer change
  useEffect(() => {
    if (!selectedCustomer) return

    let intervalId
    let isSubscribed = true

    const loadInitialMessages = async () => {
      try {
        const data = await getMessages(selectedCustomer.id)
        if (isSubscribed) {
          setMessages(Array.isArray(data) ? data : [])
          scrollToBottom()
        }
      } catch (error) {
        if (isSubscribed) toast.error('Failed to load messages')
      }
    }

    const pollNewMessages = async () => {
      setMessages(prev => {
        const lastId = prev.length > 0 ? prev[prev.length - 1].id : 0
        if (lastId === 0) return prev // If empty, rely on initial load

        getMessages(selectedCustomer.id, lastId).then(newMsgs => {
          if (isSubscribed && Array.isArray(newMsgs) && newMsgs.length > 0) {
            setMessages(current => [...current, ...newMsgs])
            scrollToBottom()
          }
        }).catch(() => {})
        
        return prev
      })
    }

    loadInitialMessages()
    intervalId = setInterval(pollNewMessages, 4000)

    return () => {
      isSubscribed = false
      clearInterval(intervalId)
    }
  }, [selectedCustomer])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!content.trim() || !selectedCustomer) return

    const payload = {
      customer_id: selectedCustomer.id,
      content,
      channel
    }

    // Optimistic update
    const optimisticMsg = {
      id: Date.now(), // temporary ID
      customer_id: selectedCustomer.id,
      sender_name: 'Sending...',
      content,
      channel,
      created_at: new Date().toISOString()
    }

    setMessages(prev => [...prev, optimisticMsg])
    setContent('')
    scrollToBottom()

    try {
      await createMessage(payload)
      // The poller will catch the real message shortly and we can either rely on it 
      // or replace the optimistic one. For simplicity, polling will fetch the real one.
      // But let's just trigger an immediate fetch to sync.
      const fresh = await getMessages(selectedCustomer.id)
      setMessages(Array.isArray(fresh) ? fresh : [])
      scrollToBottom()
    } catch (error) {
      toast.error('Failed to send message')
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id))
    }
  }

  const getChannelIcon = (type) => {
    switch(type) {
      case 'email': return <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
      case 'call': return <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
      case 'meeting': return <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
      default: return <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
      
      {/* Left Sidebar - Customers List */}
      <div className="w-1/3 border-r border-gray-100 dark:border-slate-800 flex flex-col bg-gray-50/30 dark:bg-slate-950/50">
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Conversations</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
             <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
          ) : customers.length === 0 ? (
             <div className="p-8 text-center text-sm text-gray-500">No customers found.</div>
          ) : (
            customers.map(c => (
              <div 
                key={c.id} 
                onClick={() => setSelectedCustomer(c)}
                className={`p-4 border-b border-gray-100 dark:border-slate-800 cursor-pointer transition flex items-center gap-3 ${selectedCustomer?.id === c.id ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-l-4 border-l-indigo-600' : 'hover:bg-gray-50 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent'}`}
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold flex-shrink-0">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-200 truncate">{c.name}</h3>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{c.email}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Pane - Chat Thread */}
      <div className="w-2/3 flex flex-col bg-white dark:bg-slate-900">
        {!selectedCustomer ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500">
            <svg className="w-16 h-16 mb-4 text-gray-200 dark:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            <p className="text-lg font-medium text-gray-500 dark:text-slate-400">Select a customer</p>
            <p className="text-sm">Choose a customer from the sidebar to view history.</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">{selectedCustomer.name}</h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{selectedCustomer.company || 'No Company'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 dark:bg-slate-950/30 custom-scrollbar flex flex-col gap-6">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 dark:text-slate-500 text-sm mt-10">No messages yet. Start the conversation!</div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="flex flex-col max-w-[85%] self-start">
                    <div className="flex items-center gap-2 mb-1.5 ml-1">
                      <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">{msg.sender_name}</span>
                      <span className="text-[10px] text-gray-400 dark:text-slate-500">
                        {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm p-3.5 rounded-2xl rounded-tl-sm text-sm text-gray-800 dark:text-slate-200 flex flex-col gap-2">
                       <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                         {getChannelIcon(msg.channel)}
                         <span className="capitalize">{msg.channel}</span>
                       </div>
                       <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <select 
                  value={channel}
                  onChange={e => setChannel(e.target.value)}
                  className="w-28 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 dark:bg-slate-800 text-gray-900 dark:text-white"
                >
                  <option value="note">Note</option>
                  <option value="email">Email</option>
                  <option value="call">Call</option>
                  <option value="meeting">Meeting</option>
                </select>
                <input
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Type a message or log an activity..."
                  className="flex-1 border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                />
                <button 
                  type="submit"
                  disabled={!content.trim()}
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Send
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
              </form>
            </div>
          </>
        )}
      </div>

    </div>
  )
}

export default Messages
