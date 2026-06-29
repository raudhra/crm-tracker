import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = await loginUser(email, password)
      if (data.token) {
        login(data.user, data.token)
        toast.success('Successfully logged in!')
        navigate('/dashboard')
      }
    } catch (err) {
      toast.error(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Panel - Illustration & Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-50 flex-col relative overflow-hidden items-center justify-center">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
           <svg className="absolute w-full h-full text-indigo-100 opacity-50" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor"></path>
           </svg>
        </div>

        <div className="z-10 w-full max-w-lg px-12 pt-12 flex flex-col items-center text-center">
           <div className="flex items-center gap-2 mb-12 self-start absolute top-8 left-12">
            <div className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm">C</div>
            <span className="text-xl font-bold text-gray-800 tracking-tight">ClientFlow</span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4 mt-16 leading-tight">Welcome back!</h1>
          <p className="text-gray-600 text-lg mb-12">Sign in to your account to continue<br/>managing your business.</p>
          
          {/* Mockup Illustration */}
          <div className="relative w-full max-w-md mt-4">
             <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 aspect-[4/3] flex flex-col z-20 relative">
               {/* Browser dots */}
               <div className="flex gap-1.5 mb-4 border-b border-gray-50 pb-3">
                 <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
               </div>
               
               {/* Graph mock */}
               <div className="flex-1 flex flex-col gap-3">
                 <div className="h-1/2 w-full bg-gray-50 rounded-lg relative overflow-hidden flex items-end">
                    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full text-indigo-200" strokeWidth="2">
                      <path d="M0 40 L0 30 Q10 20 20 25 T40 15 T60 25 T80 10 T100 5 L100 40 Z" fill="currentColor" opacity="0.3"></path>
                      <path d="M0 30 Q10 20 20 25 T40 15 T60 25 T80 10 T100 5" fill="none" stroke="currentColor"></path>
                    </svg>
                 </div>
                 <div className="flex gap-3 h-1/2">
                   <div className="w-1/2 bg-gray-50 rounded-lg flex items-center justify-center relative">
                     <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-500"></div>
                   </div>
                   <div className="w-1/2 flex flex-col gap-2">
                     <div className="h-4 bg-gray-100 rounded w-full"></div>
                     <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                     <div className="h-4 bg-gray-100 rounded w-4/6"></div>
                   </div>
                 </div>
               </div>
             </div>
             
             {/* Floating elements */}
             <div className="absolute -left-6 top-1/4 w-12 h-12 bg-orange-400 rounded-xl shadow-lg flex items-center justify-center text-white z-30 transform -rotate-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
             </div>
             <div className="absolute -right-6 top-1/3 w-12 h-12 bg-green-500 rounded-xl shadow-lg flex items-center justify-center text-white z-30 transform rotate-12">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
             </div>
             <div className="absolute right-4 -bottom-4 w-10 h-10 bg-blue-500 rounded-xl shadow-lg flex items-center justify-center text-white z-30 transform -rotate-3">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
             </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold">C</div>
            <span className="text-xl font-bold text-gray-800">ClientFlow</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-8">Sign in to your account</h2>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.05 10.05 0 015.345-2.096c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.29-3.29"></path>
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                <span className="text-sm text-gray-700">Remember me</span>
              </label>
              <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 mt-2 shadow-sm"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or continue with</span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <button className="flex justify-center items-center gap-2 py-2.5 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button className="flex justify-center items-center gap-2 py-2.5 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 21 21"><path fill="#f25022" d="M0 0h10v10H0z"/><path fill="#7fba00" d="M11 0h10v10H11z"/><path fill="#00a4ef" d="M0 11h10v10H0z"/><path fill="#ffb900" d="M11 11h10v10H11z"/></svg>
              Microsoft
            </button>
          </div>

          <p className="mt-10 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login