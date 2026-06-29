import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateProfile } from '../services/api'
import toast from 'react-hot-toast'

function Settings() {
  const [activeTab, setActiveTab] = useState('Profile')
  const { user } = useAuth()

  const tabs = [
    { id: 'Profile', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path> },
    { id: 'Security', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path> },
    { id: 'Notifications', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path> },
    { id: 'Preferences', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path> },
    { id: 'Integrations', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path> },
    { id: 'Billing', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path> },
    { id: 'Team', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path> },
    { id: 'Appearance', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path> },
  ]

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Tab Menu */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <svg className={`w-5 h-5 ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {tab.icon}
                </svg>
                {tab.id}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Content */}
        <div className="flex-1">
          {activeTab === 'Profile' && <ProfileTab user={user} />}
          {activeTab === 'Security' && <SecurityTab />}
          {activeTab === 'Notifications' && <NotificationsTab />}
          {['Preferences', 'Integrations', 'Billing', 'Team', 'Appearance'].includes(activeTab) && (
             <PlaceholderTab name={activeTab} />
          )}
        </div>
      </div>
    </div>
  )
}

function ProfileTab({ user }) {
  const { updateSessionProfile } = useAuth()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    job_title: user?.jobTitle || '',
    company: user?.company || ''
  })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const updatedUser = await updateProfile(formData)
      updateSessionProfile(updatedUser)
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
      <h2 className="text-lg font-bold text-gray-900 mb-1">Profile Information</h2>
      <p className="text-sm text-gray-500 mb-8">Update your personal information and profile.</p>

      {/* Avatar Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8 pb-8 border-b border-gray-100">
        <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-3xl font-bold shadow-sm">
          {user?.name?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <div>
          <div className="flex gap-3 mb-2">
            <button className="text-sm font-medium bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm">
              Change Photo
            </button>
            <button className="text-sm font-medium text-red-600 px-4 py-2 hover:bg-red-50 rounded-lg transition">
              Remove
            </button>
          </div>
          <p className="text-xs text-gray-500">JPG, GIF or PNG. Max size of 2MB.</p>
        </div>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 mb-8">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Full name</label>
          <input
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Email address</label>
          <input
            value={user?.email || ''}
            disabled
            className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1.5">Email cannot be changed.</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone number</label>
          <input
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="(555) 123-4567"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Job title</label>
          <input
            value={formData.job_title}
            onChange={(e) => setFormData({...formData, job_title: e.target.value})}
            placeholder="Project Manager"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Company</label>
          <input
            value={formData.company}
            onChange={(e) => setFormData({...formData, company: e.target.value})}
            placeholder="Acme Corporation"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-100">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}

function SecurityTab() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
      <h2 className="text-lg font-bold text-gray-900 mb-1">Change Password</h2>
      <p className="text-sm text-gray-500 mb-8">Update your password to keep your account secure.</p>
      
      <div className="flex flex-col gap-5 max-w-md mb-8">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Current password</label>
          <input type="password" placeholder="Enter current password" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">New password</label>
          <input type="password" placeholder="Create new password" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          <p className="text-xs text-gray-500 mt-1.5">Must be at least 8 characters long.</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Confirm new password</label>
          <input type="password" placeholder="Confirm new password" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
      </div>
      
      <div className="pt-6 border-t border-gray-100">
         <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm">
           Update password
         </button>
      </div>
    </div>
  )
}

function NotificationsTab() {
  const [notifs, setNotifs] = useState({
    email: true, push: false, weekly: true, marketing: false
  })

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
      <h2 className="text-lg font-bold text-gray-900 mb-1">Notifications</h2>
      <p className="text-sm text-gray-500 mb-8">Choose how you want to be notified.</p>
      
      <div className="flex flex-col gap-6">
        {[
          { id: 'email', title: 'Email notifications', desc: 'Receive daily updates and alerts via email.', val: notifs.email },
          { id: 'push', title: 'Push notifications', desc: 'Get notified immediately in your browser.', val: notifs.push },
          { id: 'weekly', title: 'Weekly digest', desc: 'A weekly summary of your business performance.', val: notifs.weekly },
          { id: 'marketing', title: 'Marketing emails', desc: 'Receive news, special offers and tips.', val: notifs.marketing },
        ].map((item) => (
          <div key={item.id} className="flex items-center justify-between pb-6 border-b border-gray-50 last:border-0 last:pb-0">
            <div className="pr-4">
               <h3 className="text-sm font-medium text-gray-900 mb-1">{item.title}</h3>
               <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
            <button
              onClick={() => setNotifs({...notifs, [item.id]: !item.val})}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${item.val ? 'bg-indigo-600' : 'bg-gray-200'}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${item.val ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function PlaceholderTab({ name }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-12 flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-4">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">{name} Settings</h2>
      <p className="text-gray-500 max-w-sm mx-auto">This section is currently under development. Check back soon for new features!</p>
    </div>
  )
}

export default Settings