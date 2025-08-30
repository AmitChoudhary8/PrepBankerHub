import React, { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
import UserRequestsManager from './UserRequestsManager'
import ExamCalendarManager from './ExamCalendarManager'  
import UserDataManager from './UserDataManager'
import QuizManager from './QuizManager'
import PDFManager from './PDFManager'

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState({
    users: 0,
    quizzes: 0,
    pdfs: 0,
    requests: 0,
    pendingRequests: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      // Get real user count from auth.users
      const { data: authUsers } = await supabase.auth.admin.listUsers()
      
      // Get other counts
      const [quizzes, pdfs, requests, pendingRequests] = await Promise.all([
        supabase.from('quizzes').select('id', { count: 'exact', head: true }),
        supabase.from('pdfs').select('id', { count: 'exact', head: true }),
        supabase.from('user_requests').select('id', { count: 'exact', head: true }),
        supabase.from('user_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending')
      ])

      setStats({
        users: authUsers?.users?.length || 0,
        quizzes: quizzes.count || 0,
        pdfs: pdfs.count || 0,
        requests: requests.count || 0,
        pendingRequests: pendingRequests.count || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
    setLoading(false)
  }

  const StatCard = ({ title, count, icon, color, description }) => (
    <div className={`bg-white rounded-lg shadow-lg p-4 md:p-6 border-l-4 ${color} hover:shadow-xl transition-shadow`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm md:text-base text-gray-600 font-medium">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-800">
            {loading ? '...' : count.toLocaleString()}
          </p>
        </div>
        <div className="text-3xl md:text-4xl">{icon}</div>
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">🔐 Admin Dashboard</h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Manage PrepBankerHub Platform
              </p>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={fetchStats}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                style={{ minHeight: '40px' }}
              >
                {loading ? '⏳' : '🔄'} Refresh
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

        {/* Navigation Tabs */}
        <nav className="bg-white rounded-lg shadow-lg p-2 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('user-requests')}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors relative ${
                activeTab === 'user-requests' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📝 User Requests
              {stats.pendingRequests > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {stats.pendingRequests}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('exam-calendar')}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'exam-calendar' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📅 Exam Calendar
            </button>
            <button
              onClick={() => setActiveTab('quiz-manager')}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'quiz-manager' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📚 Quiz Manager
            </button>
            <button
              onClick={() => setActiveTab('pdf-manager')}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'pdf-manager' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📄 PDF Manager
            </button>
            <button
              onClick={() => setActiveTab('user-data')}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'user-data' 
                  ? 'bg-cyan-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              👥 User Data
            </button>
          </div>
        </nav>

        {/* Tab Content */}
        <div>
          {activeTab === 'dashboard' && (
            <section>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                <StatCard
                  title="Total Users"
                  count={stats.users}
                  icon="👥"
                  color="border-blue-500"
                  description="Registered users"
                />
                <StatCard
                  title="Active Quizzes"
                  count={stats.quizzes}
                  icon="📚"
                  color="border-green-500"
                  description="Available quizzes"
                />
                <StatCard
                  title="PDF Resources"
                  count={stats.pdfs}
                  icon="📄"
                  color="border-purple-500"
                  description="Study materials"
                />
                <StatCard
                  title="User Requests"
                  count={stats.requests}
                  icon="📝"
                  color="border-orange-500"
                  description={`${stats.pendingRequests} pending`}
                />
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h3 className="text-lg font-bold mb-4">⚡ Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveTab('user-requests')}
                    className="p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors text-left"
                  >
                    <div className="text-2xl mb-2">📝</div>
                    <h4 className="font-semibold text-orange-800">User Requests</h4>
                    <p className="text-sm text-orange-600">{stats.pendingRequests} pending</p>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('exam-calendar')}
                    className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors text-left"
                  >
                    <div className="text-2xl mb-2">📅</div>
                    <h4 className="font-semibold text-purple-800">Exam Calendar</h4>
                    <p className="text-sm text-purple-600">Manage exam dates</p>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('quiz-manager')}
                    className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors text-left"
                  >
                    <div className="text-2xl mb-2">📚</div>
                    <h4 className="font-semibold text-green-800">Quiz Manager</h4>
                    <p className="text-sm text-green-600">Add/Edit quizzes</p>
                  </button>

                  <button
                    onClick={() => setActiveTab('pdf-manager')}
                    className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors text-left"
                  >
                    <div className="text-2xl mb-2">📄</div>
                    <h4 className="font-semibold text-indigo-800">PDF Manager</h4>
                    <p className="text-sm text-indigo-600">Upload/Manage PDFs</p>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4">📈 Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">👤</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New user registered</p>
                      <p className="text-xs text-gray-500">2 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 text-sm">📝</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New request submitted</p>
                      <p className="text-xs text-gray-500">5 minutes ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'user-requests' && <UserRequestsManager onStatsUpdate={fetchStats} />}
          {activeTab === 'exam-calendar' && <ExamCalendarManager />}
          {activeTab === 'quiz-manager' && <QuizManager />}
          {activeTab === 'pdf-manager' && <PDFManager />}
          {activeTab === 'user-data' && <UserDataManager />}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
