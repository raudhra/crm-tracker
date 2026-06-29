import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function Settings() {
  const [activeTab, setActiveTab] = useState('Profile')
  const { user } = useAuth()

  const tabs = ['Profile', 'Security', 'Notifications', 'Preferences']

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="flex gap-6">
        {/* Left Tab Menu */}
        <div className="w-48 bg-white rounded-xl border border-gray-100 p-2 h-fit">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium mb-1 transition
                ${activeTab === tab
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right Content */}
        <div className="flex-1 bg-white rounded-xl border border-gray-100 p-6">
          {activeTab === 'Profile' && <ProfileTab user={user} />}
          {activeTab === 'Security' && <SecurityTab />}
          {activeTab === 'Notifications' && <NotificationsTab />}
          {activeTab === 'Preferences' && <PreferencesTab />}
        </div>
      </div>
    </div>
  )
}

function ProfileTab({ user }) {
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Profile Information</h2>
      <p className="text-sm text-gray-500 mb-6">Update your personal information and profile.</p>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
          {user?.name?.[0] ?? 'U'}
        </div>
        <button className="text-sm text-indigo-600 border border-indigo-200 px-3 py-1 rounded-lg hover:bg-indigo-50">
          Change Photo
        </button>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Full name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Email address</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Phone number</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Job title</label>
          <input
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Project Manager"
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="col-span-2">
          <label className="text-sm font-medium text-gray-700">Company</label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Acme Corporation"
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          {saved ? 'Saved!' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}

function SecurityTab() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Change Password</h2>
      <p className="text-sm text-gray-500 mb-6">Update your password to keep your account secure.</p>
      <div className="flex flex-col gap-4 max-w-md">
        <div>
          <label className="text-sm font-medium text-gray-700">Current password</label>
          <input type="password" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">New password</label>
          <input type="password" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Confirm new password</label>
          <input type="password" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 w-fit">
          Update password
        </button>
      </div>
    </div>
  )
}

function NotificationsTab() {
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [pushNotifs, setPushNotifs] = useState(false)

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Notifications</h2>
      <p className="text-sm text-gray-500 mb-6">Choose how you want to be notified.</p>
      <div className="flex flex-col gap-4">
        {[
          { label: 'Email notifications', value: emailNotifs, set: setEmailNotifs },
          { label: 'Push notifications', value: pushNotifs, set: setPushNotifs },
        ].map(({ label, value, set }) => (
          <div key={label} className="flex items-center justify-between py-3 border-b border-gray-50">
            <span className="text-sm text-gray-700">{label}</span>
            <button
              onClick={() => set(!value)}
              className={`w-10 h-5 rounded-full transition ${value ? 'bg-indigo-600' : 'bg-gray-200'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5
                ${value ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function PreferencesTab() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Preferences</h2>
      <p className="text-sm text-gray-500 mb-6">Customize your experience.</p>
      <p className="text-sm text-gray-400">More preferences coming soon.</p>
    </div>
  )
}

export default Settings