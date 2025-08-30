import React, { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
import QuizManager from './QuizManager'
import PDFManager from './PDFManager'
import UserManager from './UserManager'
import ExamCalendarManager from './ExamCalendarManager'

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuizzes: 0,
    totalPDFs: 0,
    totalExams: 0,
    pendingRequests: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Get user count from users table (synced with auth.users)
      const { count: userCount } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
      
      const { data: quizzes } = await supabase.from('quizzes').select('id')
      const { data: pdfs } = await supabase.from('pdfs').select('id')
      const { data: exams } = await supabase.from('exam_calendar').select('id')
      const { data: requests } = await supabase
        .from('user_requests')
        .select('id')
        .eq('status', 'pending')
      
      setStats({
        totalUsers: userCount || 0,
        totalQuizzes: quizzes?.length || 0,
        totalPDFs: pdfs?.length || 0,
        totalExams: exams?.length || 0,
        pendingRequests: requests?.length || 0
      })
    } catch (error) {
      console.log('Error fetching stats:', error)
      setStats({
        totalUsers: 0,
        totalQuizzes: 0,
        totalPDFs: 0,
        totalExams: 0,
        pendingRequests: 0
      })
    }
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile-Optimized Admin Header */}
      <header className="bg-red-600 text-white p-3 md:p-4 shadow-lg">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden bg-red-700 hover:bg-red-800 p-2 rounded-lg transition-colors"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <span className="text-lg">☰</span>
            </button>
            
            <div>
              <h1 className="text-lg md:text-2xl font-bold">
                <span className="hidden sm:inline">PrepBankerHub Admin Panel</span>
                <span className="sm:hidden">PBH Admin</span>
              </h1>
            </div>
            <span className="text-red-200 text-lg">👨‍💼</span>
          </div>
          
          <button
            onClick={onLogout}
            className="bg-red-700 hover:bg-red-800 px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base"
            style={{ minHeight: '44px' }}
          >
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Exit</span>
          </button>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto relative">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={closeSidebar}
          ></div>
        )}

        {/* Mobile-Responsive Sidebar */}
        <aside className={`
          fixed md:relative
          w-64 bg-white shadow-lg min-h-screen z-30
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}>
          <nav className="p-3 md:p-4">
            {/* Mobile Close Button */}
            <div className="flex justify-end mb-4 md:hidden">
              <button
                onClick={closeSidebar}
                className="text-gray-500 hover:text-gray-700 p-2"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                ✕
              </button>
            </div>

            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    setActiveTab('overview')
                    closeSidebar()
                  }}
                  className={`w-full text-left p-3 rounded-lg text-sm md:text-base transition-colors ${
                    activeTab === 'overview' ? 'bg-red-100 text-red-700' : 'hover:bg-gray-100'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  📊 Dashboard Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('quiz-management')
                    closeSidebar()
                  }}
                  className={`w-full text-left p-3 rounded-lg text-sm md:text-base transition-colors ${
                    activeTab === 'quiz-management' ? 'bg-red-100 text-red-700' : 'hover:bg-gray-100'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  📚 Quiz Management
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('pdf-management')
                    closeSidebar()
                  }}
                  className={`w-full text-left p-3 rounded-lg text-sm md:text-base transition-colors ${
                    activeTab === 'pdf-management' ? 'bg-red-100 text-red-700' : 'hover:bg-gray-100'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  📄 PDF Management
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('user-management')
                    closeSidebar()
                  }}
                  className={`w-full text-left p-3 rounded-lg text-sm md:text-base transition-colors ${
                    activeTab === 'user-management' ? 'bg-red-100 text-red-700' : 'hover:bg-gray-100'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  👥 User Management
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('exam-calendar')
                    closeSidebar()
                  }}
                  className={`w-full text-left p-3 rounded-lg text-sm md:text-base transition-colors ${
                    activeTab === 'exam-calendar' ? 'bg-red-100 text-red-700' : 'hover:bg-gray-100'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  📅 Exam Calendar
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('requests')
                    closeSidebar()
                  }}
                  className={`w-full text-left p-3 rounded-lg text-sm md:text-base transition-colors ${
                    activeTab === 'requests' ? 'bg-red-100 text-red-700' : 'hover:bg-gray-100'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  📝 User Requests
                  {stats.pendingRequests > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {stats.pendingRequests}
                    </span>
                  )}
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Mobile-Responsive Main Content */}
        <main className="flex-1 p-3 md:p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Dashboard Overview</h2>
              
              {/* Mobile-Responsive Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                  <h3 className="text-sm md:text-lg font-semibold text-gray-600">Total Users</h3>
                  <p className="text-2xl md:text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
                </div>
                <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                  <h3 className="text-sm md:text-lg font-semibold text-gray-600">Total Quizzes</h3>
                  <p className="text-2xl md:text-3xl font-bold text-green-600">{stats.totalQuizzes}</p>
                </div>
                <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                  <h3 className="text-sm md:text-lg font-semibold text-gray-600">Total PDFs</h3>
                  <p className="text-2xl md:text-3xl font-bold text-purple-600">{stats.totalPDFs}</p>
                </div>
                <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                  <h3 className="text-sm md:text-lg font-semibold text-gray-600">Exam Events</h3>
                  <p className="text-2xl md:text-3xl font-bold text-indigo-600">{stats.totalExams}</p>
                </div>
              </div>

              {/* Mobile-Responsive Quick Actions */}
              <div className="bg-white p-4 md:p-6 rounded-lg shadow mb-6">
                <h3 className="text-lg md:text-xl font-bold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <button
                    onClick={() => setActiveTab('quiz-management')}
                    className="bg-blue-600 text-white p-3 md:p-4 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
                    style={{ minHeight: '44px' }}
                  >
                    ➕ Add New Quiz
                  </button>
                  <button
                    onClick={() => setActiveTab('pdf-management')}
                    className="bg-green-600 text-white p-3 md:p-4 rounded-lg hover:bg-green-700 transition-colors text-sm md:text-base"
                    style={{ minHeight: '44px' }}
                  >
                    📄 Add New PDF
                  </button>
                  <button
                    onClick={() => setActiveTab('exam-calendar')}
                    className="bg-indigo-600 text-white p-3 md:p-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm md:text-base"
                    style={{ minHeight: '44px' }}
                  >
                    📅 Add Exam Event
                  </button>
                  <button
                    onClick={() => setActiveTab('user-management')}
                    className="bg-purple-600 text-white p-3 md:p-4 rounded-lg hover:bg-purple-700 transition-colors text-sm md:text-base"
                    style={{ minHeight: '44px' }}
                  >
                    👥 Manage Users
                  </button>
                </div>
              </div>

              {/* Mobile-Responsive Recent Activity */}
              <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                <h3 className="text-lg md:text-xl font-bold mb-4">Recent Activity</h3>
                <div className="space-y-2 md:space-y-3 text-xs md:text-sm text-gray-600">
                  <p>• Database successfully initialized with sample data</p>
                  <p>• {stats.totalQuizzes} quiz(es) available for users</p>
                  <p>• {stats.totalPDFs} PDF(s) ready for download</p>
                  <p>• {stats.totalUsers} user(s) registered on platform</p>
                  <p>• {stats.totalExams} exam event(s) scheduled</p>
                  <p>• Admin panel fully operational</p>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Management Tab */}
          {activeTab === 'quiz-management' && <QuizManager />}

          {/* PDF Management Tab */}
          {activeTab === 'pdf-management' && <PDFManager />}

          {/* User Management Tab */}
          {activeTab === 'user-management' && <UserManager />}

          {/* Exam Calendar Tab */}
          {activeTab === 'exam-calendar' && <ExamCalendarManager />}

          {/* User Requests Tab */}
          {activeTab === 'requests' && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">User Requests & Submissions</h2>
              <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                <h3 className="text-lg md:text-xl font-bold mb-4">Pending Requests</h3>
                <div className="text-gray-600">
                  <p className="mb-4 text-sm md:text-base">Request management functionality coming soon...</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <h4 className="font-semibold mb-2 text-sm md:text-base">Request Types:</h4>
                      <ul className="space-y-1 text-xs md:text-sm">
                        <li>• PDF upload requests</li>
                        <li>• Quiz suggestions</li>
                        <li>• Content feedback</li>
                        <li>• Feature requests</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-sm md:text-base">Management Features:</h4>
                      <ul className="space-y-1 text-xs md:text-sm">
                        <li>• Approve/Reject submissions</li>
                        <li>• Send response messages</li>
                        <li>• Priority handling</li>
                        <li>• Status tracking</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Bottom Spacing */}
          <div className="h-16 md:h-0"></div>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
