import React, { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
import QuizManager from './QuizManager'
import PDFManager from './PDFManager'
import UserManager from './UserManager'
import ExamCalendarManager from './ExamCalendarManager'

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuizzes: 0,
    totalPDFs: 0,
    totalExams: 0, // New stat for exams
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
      const { data: exams } = await supabase.from('exam_calendar').select('id') // New exam count
      const { data: requests } = await supabase
        .from('user_requests')
        .select('id')
        .eq('status', 'pending')
      
      setStats({
        totalUsers: userCount || 0,
        totalQuizzes: quizzes?.length || 0,
        totalPDFs: pdfs?.length || 0,
        totalExams: exams?.length || 0, // New exam stat
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-red-600 text-white p-4 shadow-lg">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">PrepBankerHub Admin Panel</h1>
            <span className="text-red-200">👨‍💼</span>
          </div>
          <button
            onClick={onLogout}
            className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left p-3 rounded-lg ${
                    activeTab === 'overview' ? 'bg-red-100 text-red-700' : 'hover:bg-gray-100'
                  }`}
                >
                  📊 Dashboard Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('quiz-management')}
                  className={`w-full text-left p-3 rounded-lg ${
                    activeTab === 'quiz-management' ? 'bg-red-100 text-red-700' : 'hover:bg-gray-100'
                  }`}
                >
                  📚 Quiz Management
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('pdf-management')}
                  className={`w-full text-left p-3 rounded-lg ${
                    activeTab === 'pdf-management' ? 'bg-red-100 text-red-700' : 'hover:bg-gray-100'
                  }`}
                >
                  📄 PDF Management
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('user-management')}
                  className={`w-full text-left p-3 rounded-lg ${
                    activeTab === 'user-management' ? 'bg-red-100 text-red-700' : 'hover:bg-gray-100'
                  }`}
                >
                  👥 User Management
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('exam-calendar')}
                  className={`w-full text-left p-3 rounded-lg ${
                    activeTab === 'exam-calendar' ? 'bg-red-100 text-red-700' : 'hover:bg-gray-100'
                  }`}
                >
                  📅 Exam Calendar
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`w-full text-left p-3 rounded-lg ${
                    activeTab === 'requests' ? 'bg-red-100 text-red-700' : 'hover:bg-gray-100'
                  }`}
                >
                  📝 User Requests
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Dashboard Overview</h2>
              
              {/* Stats Cards - Updated to include Exams */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-600">Total Users</h3>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-600">Total Quizzes</h3>
                  <p className="text-3xl font-bold text-green-600">{stats.totalQuizzes}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-600">Total PDFs</h3>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalPDFs}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-600">Exam Events</h3>
                  <p className="text-3xl font-bold text-indigo-600">{stats.totalExams}</p>
                </div>
              </div>

              {/* Quick Actions - Updated to include Exam Calendar */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveTab('quiz-management')}
                    className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    ➕ Add New Quiz
                  </button>
                  <button
                    onClick={() => setActiveTab('pdf-management')}
                    className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    📄 Add New PDF
                  </button>
                  <button
                    onClick={() => setActiveTab('exam-calendar')}
                    className="bg-indigo-600 text-white p-4 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    📅 Add Exam Event
                  </button>
                  <button
                    onClick={() => setActiveTab('user-management')}
                    className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    👥 Manage Users
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="mt-6 bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                <div className="space-y-3 text-sm text-gray-600">
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

          {/* Exam Calendar Tab - NEW ADDITION */}
          {activeTab === 'exam-calendar' && <ExamCalendarManager />}

          {/* User Requests Tab */}
          {activeTab === 'requests' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">User Requests & Submissions</h2>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4">Pending Requests</h3>
                <div className="text-gray-600">
                  <p className="mb-4">Request management functionality coming soon...</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Request Types:</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• PDF upload requests</li>
                        <li>• Quiz suggestions</li>
                        <li>• Content feedback</li>
                        <li>• Feature requests</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Management Features:</h4>
                      <ul className="space-y-1 text-sm">
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
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
