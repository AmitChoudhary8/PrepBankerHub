import React, { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState({
    users: 0,
    quizzes: 0,
    pdfs: 0,
    requests: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [users, quizzes, pdfs, requests] = await Promise.all([
        supabase.from('auth.users').select('id', { count: 'exact', head: true }),
        supabase.from('quizzes').select('id', { count: 'exact', head: true }),
        supabase.from('pdfs').select('id', { count: 'exact', head: true }),
        supabase.from('user_requests').select('id', { count: 'exact', head: true })
      ])

      setStats({
        users: users.count || 0,
        quizzes: quizzes.count || 0,
        pdfs: pdfs.count || 0,
        requests: requests.count || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
    setLoading(false)
  }

  const StatCard = ({ title, count, icon, color }) => (
    <div className={`bg-white rounded-lg shadow-lg p-4 md:p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm md:text-base text-gray-600 font-medium">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-800">
            {loading ? '...' : count.toLocaleString()}
          </p>
        </div>
        <div className="text-3xl md:text-4xl">{icon}</div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Mobile-Optimized Header */}
        <header className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">🔐 Admin Dashboard</h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Manage your PrepBankerHub platform
              </p>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ minHeight: '40px' }}
              >
                🔄 Refresh
              </button>
              <button
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ minHeight: '40px' }}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </header>

        {/* Stats Cards Grid - Mobile Responsive */}
        <section className="mb-8">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">📊 Platform Statistics</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard
              title="Total Users"
              count={stats.users}
              icon="👥"
              color="border-blue-500"
            />
            <StatCard
              title="Active Quizzes"
              count={stats.quizzes}
              icon="📚"
              color="border-green-500"
            />
            <StatCard
              title="PDF Resources"
              count={stats.pdfs}
              icon="📄"
              color="border-purple-500"
            />
            <StatCard
              title="User Requests"
              count={stats.requests}
              icon="📝"
              color="border-orange-500"
            />
          </div>
        </section>

        {/* Quick Actions - Mobile Optimized */}
        <section className="mb-8">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">⚡ Quick Actions</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="bg-white p-4 md:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left">
              <div className="text-3xl mb-3">➕</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Add New Quiz</h3>
              <p className="text-sm text-gray-600">Create a new quiz for students</p>
            </button>
            
            <button className="bg-white p-4 md:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left">
              <div className="text-3xl mb-3">📤</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Upload PDF</h3>
              <p className="text-sm text-gray-600">Add study materials</p>
            </button>
            
            <button className="bg-white p-4 md:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left">
              <div className="text-3xl mb-3">📧</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Send Notifications</h3>
              <p className="text-sm text-gray-600">Email all users</p>
            </button>
          </div>
        </section>

        {/* Recent Activity - Mobile Optimized */}
        <section>
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">📈 Recent Activity</h2>
          
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">👤</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">New user registered</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">📚</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Quiz completed</p>
                    <p className="text-xs text-gray-500">5 minutes ago</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-sm">📄</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">PDF downloaded</p>
                    <p className="text-xs text-gray-500">10 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Bottom Padding */}
        <div className="h-20 md:h-0"></div>
      </div>
    </div>
  )
}

export default AdminDashboard
