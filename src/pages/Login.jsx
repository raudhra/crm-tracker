import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)

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
        setExiting(true)
        setTimeout(() => navigate('/dashboard'), 500)
      }
    } catch (err) {
      toast.error(err.message || 'Invalid email or password')
      setShakeKey(prev => prev + 1)
    } finally {
      setLoading(false)
    }
  }

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }
  const fadeUp = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } }
  const shakeAnim = { x: [0, -12, 10, -8, 6, -3, 0], transition: { duration: 0.45 } }

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="min-h-screen flex bg-white dark:bg-slate-900 font-sans"
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          {/* Left Panel - Illustration & Branding */}
          <div className="hidden lg:flex lg:w-1/2 bg-indigo-50 dark:bg-slate-800 flex-col relative overflow-hidden items-center justify-center">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
               <svg className="absolute w-full h-full text-indigo-100 dark:text-slate-700 opacity-50" viewBox="0 0 100 100" preserveAspectRatio="none">
                 <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor"></path>
               </svg>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="z-10 w-full max-w-lg px-12 pt-12 flex flex-col items-center text-center"
            >
               <div className="flex items-center gap-2 mb-12 self-start absolute top-8 left-12">
                <div className="bg-indigo-600 dark:bg-indigo-500 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm">C</div>
                <span className="text-xl font-bold text-gray-800 dark:text-slate-200 tracking-tight">ClientFlow</span>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 mt-16 leading-tight">Welcome back!</h1>
              <p className="text-gray-600 dark:text-slate-400 text-lg mb-12">Sign in to your account to continue<br/>managing your business.</p>
              
              {/* Mockup Illustration */}
              <div className="relative w-full max-w-md mt-4">
                 <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-4 aspect-[4/3] flex flex-col z-20 relative">
                   <div className="flex gap-1.5 mb-4 border-b border-gray-50 dark:border-slate-800 pb-3">
                     <div className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-slate-700"></div>
                     <div className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-slate-700"></div>
                     <div className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-slate-700"></div>
                   </div>
                   <div className="flex-1 flex flex-col gap-3">
                     <div className="h-1/2 w-full bg-gray-50 dark:bg-slate-800 rounded-lg relative overflow-hidden flex items-end">
                        <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full text-indigo-200 dark:text-indigo-900/40" strokeWidth="2">
                          <path d="M0 40 L0 30 Q10 20 20 25 T40 15 T60 25 T80 10 T100 5 L100 40 Z" fill="currentColor" opacity="0.3"></path>
                          <path d="M0 30 Q10 20 20 25 T40 15 T60 25 T80 10 T100 5" fill="none" stroke="currentColor"></path>
                        </svg>
                     </div>
                     <div className="flex gap-3 h-1/2">
                       <div className="w-1/2 bg-gray-50 dark:bg-slate-800 rounded-lg flex items-center justify-center relative">
                         <div className="w-16 h-16 rounded-full border-4 border-indigo-100 dark:border-indigo-900/40 border-t-indigo-500 dark:border-t-indigo-500"></div>
                       </div>
                       <div className="w-1/2 flex flex-col gap-2">
                         <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-full"></div>
                         <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-5/6"></div>
                         <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-4/6"></div>
                       </div>
                     </div>
                   </div>
                 </div>
                 
                 {/* Floating elements with subtle float animation */}
                 <motion.div
                   animate={{ y: [0, -6, 0] }}
                   transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                   className="absolute -left-6 top-1/4 w-12 h-12 bg-orange-400 rounded-xl shadow-lg flex items-center justify-center text-white z-30 transform -rotate-6"
                 >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                 </motion.div>
                 <motion.div
                   animate={{ y: [0, -8, 0] }}
                   transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                   className="absolute -right-6 top-1/3 w-12 h-12 bg-green-500 rounded-xl shadow-lg flex items-center justify-center text-white z-30 transform rotate-12"
                 >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                 </motion.div>
                 <motion.div
                   animate={{ y: [0, -5, 0] }}
                   transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                   className="absolute right-4 -bottom-4 w-10 h-10 bg-blue-500 rounded-xl shadow-lg flex items-center justify-center text-white z-30 transform -rotate-3"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                 </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Right Panel - Login Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="w-full max-w-md"
            >
              <motion.div variants={fadeUp} className="lg:hidden flex items-center gap-2 mb-8">
                <div className="bg-indigo-600 dark:bg-indigo-500 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold">C</div>
                <span className="text-xl font-bold text-gray-800 dark:text-slate-200">ClientFlow</span>
              </motion.div>

              <motion.h2 variants={fadeUp} className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Sign in to your account</motion.h2>

              <motion.div key={shakeKey} animate={shakeKey > 0 ? shakeAnim : {}}>
                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                  <motion.div variants={fadeUp}>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1.5">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      required
                      className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-white transition-shadow placeholder-gray-400 dark:placeholder-slate-500"
                    />
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-white transition-shadow pr-10 placeholder-gray-400 dark:placeholder-slate-500"
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
                  </motion.div>

                  <motion.div variants={fadeUp} className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-gray-300 dark:border-slate-600 focus:ring-indigo-500 dark:bg-slate-800" />
                      <span className="text-sm text-gray-700 dark:text-slate-300">Remember me</span>
                    </label>
                    <a href="#" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">Forgot password?</a>
                  </motion.div>

                  <motion.button
                    variants={fadeUp}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-70 mt-2 shadow-sm flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </>
                    ) : 'Sign in'}
                  </motion.button>
                </form>
              </motion.div>



              <motion.p variants={fadeUp} className="mt-10 text-center text-sm text-gray-600 dark:text-slate-400">
                Don't have an account?{' '}
                <a href="/signup" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">Sign up</a>
              </motion.p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Login