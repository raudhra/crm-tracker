import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError('')
    navigate('/dashboard')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">

      {/* Left Panel */}
      <div className="w-1/2 bg-indigo-600 flex flex-col items-center justify-center p-12 text-white">
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-white text-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold">C</div>
          <span className="text-xl font-semibold">ClientFlow</span>
        </div>
        <h1 className="text-3xl font-bold mb-4 text-center">Create your account</h1>
        <p className="text-indigo-200 text-center">Join ClientFlow and streamline your business management.</p>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 flex items-center justify-center p-12 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Create your account</h2>
          <p className="text-gray-500 mb-6">Fill in the details below to get started.</p>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              onClick={handleSignup}
              disabled={loading}
              className="bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            <p className="text-sm text-center text-gray-500">
              Already have an account?{' '}
              <a href="/login" className="text-indigo-600 font-medium">Sign in</a>
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Signup