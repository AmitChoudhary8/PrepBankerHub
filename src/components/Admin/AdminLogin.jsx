import React, { useState } from 'react'

const AdminLogin = ({ onAdminLogin, onClose }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Environment variables से admin credentials check करें
    const adminUsername = import.meta.env.VITE_ADMIN_USERNAME
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD

    if (credentials.username === adminUsername && 
        credentials.password === adminPassword) {
      
      // Admin session create करें
      const adminSession = {
        username: adminUsername,
        loginTime: Date.now(),
        role: 'admin'
      }
      
      localStorage.setItem('adminSession', JSON.stringify(adminSession))
      onAdminLogin(true)
      alert('✅ Admin login successful!')
      
    } else {
      alert('❌ Invalid admin credentials!')
    }
    
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg w-full max-w-md mx-4">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-red-600">🔐 Admin Access</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>
        
        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Admin Username
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter admin username"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Admin Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter admin password"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '🔄 Logging in...' : '🔓 Admin Login'}
          </button>
        </form>
        
        {/* Warning */}
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg text-center">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            ⚠️ Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
