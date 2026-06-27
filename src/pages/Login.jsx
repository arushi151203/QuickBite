import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

export default function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [registerSuccess, setRegisterSuccess] = useState(null)
  const [needsVerification, setNeedsVerification] = useState(null)
  const [resendLoading, setResendLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  })

  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
    setNeedsVerification(null)
  }

  const handleResendVerification = async () => {
    const email = needsVerification?.email || form.email
    if (!email) return

    setResendLoading(true)
    try {
      const data = await api.resendVerification(email)
      setRegisterSuccess(data)
      setNeedsVerification(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setResendLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setRegisterSuccess(null)
    setNeedsVerification(null)

    try {
      if (isRegister) {
        const data = await register(form)
        setRegisterSuccess(data)
        setForm({ name: '', email: '', password: '', phone: '' })
      } else {
        await login(form.email, form.password)
        navigate('/', { replace: true })
      }
    } catch (err) {
      if (err.needsVerification) {
        setNeedsVerification({ email: err.email || form.email })
      }
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsRegister(r => !r)
    setError('')
    setRegisterSuccess(null)
    setNeedsVerification(null)
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80"
          alt="Food"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-primary/40" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-2xl font-bold">Q</div>
            <span className="text-3xl font-bold">Quick<span className="text-orange-400">Bite</span></span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-3">
            Delicious food,<br />delivered fast.
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Order from your favourite restaurants in Jaipur. Fresh, hot, and at your doorstep.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white text-lg font-bold">Q</div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              Quick<span className="text-orange-600">Bite</span>
            </span>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
            {registerSuccess ? (
              <div className="text-center py-2">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={28} className="text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{registerSuccess.message}</p>
                {registerSuccess.devLink && (
                  <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-left">
                    <p className="text-xs text-orange-600 font-semibold mb-1">Dev mode — verification link:</p>
                    <a href={registerSuccess.devLink} className="text-xs text-orange-600 break-all hover:underline">
                      {registerSuccess.devLink}
                    </a>
                  </div>
                )}
                <button
                  onClick={() => { setRegisterSuccess(null); setIsRegister(false) }}
                  className="text-sm text-orange-600 font-semibold hover:underline"
                >
                  Go to sign in
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {isRegister ? 'Create account' : 'Welcome back'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  {isRegister
                    ? 'Sign up to start ordering your favourite food'
                    : 'Sign in to continue to QuickBite'}
                </p>

                {error && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                    {error}
                    {needsVerification && (
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={resendLoading}
                        className="block mt-2 text-orange-600 font-semibold hover:underline disabled:opacity-50"
                      >
                        {resendLoading ? 'Sending...' : 'Resend verification email'}
                      </button>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {isRegister && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                      <div className="relative">
                        <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          placeholder="Your name"
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="you@example.com"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  {isRegister && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone </label>
                      <div className="relative">
                        <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="9876543210"
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                      {!isRegister && (
                        <Link to="/forgot-password" className="text-xs text-orange-600 font-medium hover:underline">
                          Forgot password?
                        </Link>
                      )}
                    </div>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(s => !s)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 size={18} className="animate-spin" />}
                    {isRegister ? 'Create Account' : 'Sign In'}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button type="button" onClick={switchMode} className="text-primary font-semibold hover:underline">
                    {isRegister ? 'Sign in' : 'Sign up'}
                  </button>
                </p>

               
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
