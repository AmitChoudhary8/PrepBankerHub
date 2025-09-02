import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import toast from 'react-hot-toast'

function AdminLogin() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [debugMode, setDebugMode] = useState(false) // NEW: Debug toggle
  const navigate = useNavigate()

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const adminUsername = import.meta.env.VITE_ADMIN_USERNAME
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD

      if (credentials.username === adminUsername && credentials.password === adminPassword) {
        localStorage.setItem('adminAuth', 'true')
        toast.success('Successfully logged in!')
        navigate('/admindash')
      } else {
        toast.error('Invalid username or password')
      }
    } catch (error) {
      toast.error('Login error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <img 
            className="mx-auto h-16 w-auto" 
            src="/assets/logo.png" 
            alt="PrepBankerHub" 
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access the admin dashboard
          </p>
          
          {/* DEBUG TOGGLE BUTTON */}
          <button
            onClick={() => setDebugMode(!debugMode)}
            className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg text-xs"
          >
            {debugMode ? 'Hide Debug' : 'Show Debug'}
          </button>
        </div>

        {/* DEBUG INFO PANEL */}
        {debugMode && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 text-sm">
            <h4 className="font-bold mb-2">Debug Information:</h4>
            <p><strong>Environment Username:</strong> {import.meta.env.VITE_ADMIN_USERNAME || 'Not Found'}</p>
            <p><strong>Environment Password:</strong> {import.meta.env.VITE_ADMIN_PASSWORD ? 'Found' : 'Not Found'}</p>
            <p><strong>Entered Username:</strong> {credentials.username}</p>
            <p><strong>Entered Password:</strong> {credentials.password}</p>
            <p><strong>All Env Vars:</strong></p>
            <pre className="text-xs bg-gray-200 p-2 mt-2 overflow-x-auto">
              {JSON.stringify(import.meta.env, null, 2)}
            </pre>
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter admin username"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter admin password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login to Admin Panel'}
          </button>
        </form>

        {/* Back to Home */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Back to PrepBankerHub
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
