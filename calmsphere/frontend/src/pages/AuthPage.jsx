import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { authAPI } from '../utils/api'
import { setToken } from '../utils/auth'

const AuthPage = () => {
  const [authMode, setAuthMode] = useState('login')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()
  const setUser = useUserStore((state) => state.setUser)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = authMode === 'register' 
        ? await authAPI.register(formData)
        : await authAPI.login({ email: formData.email, password: formData.password })
      
      const { access_token, user_name } = response.data
      setToken(access_token)
      setUser({ name: user_name, email: formData.email }, access_token)
      
      navigate('/preferences')
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-green-500/6 via-transparent to-purple-500/6">
      <div className="w-full max-w-md bg-bg2 border border-border rounded-[20px] p-10 shadow-card">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-accent to-purple rounded-xl flex items-center justify-center text-xl">
            🧘
          </div>
          <div>
            <div className="font-head text-xl text-text">CalmSphere</div>
            <div className="text-xs text-text2 tracking-[0.5px] -mt-0.5">Your mental wellness companion</div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-bg3 rounded-sm p-1 mb-7">
          <button
            className={`flex-1 py-2 text-sm font-medium transition-all rounded-md ${
              authMode === 'login' 
                ? 'bg-bg2 text-text shadow-sm' 
                : 'text-text2 hover:text-text'
            }`}
            onClick={() => setAuthMode('login')}
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium transition-all rounded-md ${
              authMode === 'register' 
                ? 'bg-bg2 text-text shadow-sm' 
                : 'text-text2 hover:text-text'
            }`}
            onClick={() => setAuthMode('register')}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {authMode === 'register' && (
            <div className="mb-4">
              <label className="block text-xs text-text2 mb-1.5 tracking-[0.3px]">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full bg-bg3 border border-border rounded-sm px-3.5 py-2.5 text-text text-sm outline-none transition-all focus:border-accent focus:shadow-[0_0_0_3px_rgba(126,232,162,0.1)]"
                required={authMode === 'register'}
              />
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-xs text-text2 mb-1.5 tracking-[0.3px]">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full bg-bg3 border border-border rounded-sm px-3.5 py-2.5 text-text text-sm outline-none transition-all focus:border-accent focus:shadow-[0_0_0_3px_rgba(126,232,162,0.1)]"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-xs text-text2 mb-1.5 tracking-[0.3px]">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-bg3 border border-border rounded-sm px-3.5 py-2.5 text-text text-sm outline-none transition-all focus:border-accent focus:shadow-[0_0_0_3px_rgba(126,232,162,0.1)]"
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/25 rounded-sm text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-br from-accent to-accent2 text-bg font-semibold text-sm rounded-sm cursor-pointer transition-all hover:opacity-90 hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {loading ? 'Please wait...' : `Continue →`}
          </button>
        </form>

        <div className="text-center text-xs text-text2 mt-4">
          {authMode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button 
                className="text-accent hover:underline"
                onClick={() => setAuthMode('register')}
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button 
                className="text-accent hover:underline"
                onClick={() => setAuthMode('login')}
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthPage
