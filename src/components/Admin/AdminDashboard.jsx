import React, { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuizzes: 0,
    totalPDFs: 0,
    pendingRequests: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    // Fetch basic stats from Supabase
    try {
      const { data: users } = await supabase.from('users').select('id')
      const { data: quizzes } = await supabase.from('quizzes').select('id')
      const { data: pdfs } = await supabase.from('pdfs').select('id')
      
      setStats({
        totalUsers: users?.length || 0,
        totalQuizzes: quizzes?.length || 0,
        totalPDFs: pdfs?.length || 0,
        pendingRequests: 0
      })
    } catch (error) {
      console.log('Error fetching stats:', error)
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
              
              {/* Stats Cards */}
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
                  <h3 className="text-lg font-semibold text-gray-600">Pending Requests</h3>
                  <p className="text-3xl font-bold text-orange-600">{stats.pendingRequests}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('quiz-management')}
                    className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700"
                  >
                    ➕ Add New Quiz
                  </button>
                  <button
                    onClick={() => setActiveTab('pdf-management')}
                    className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700"
                  >
                    📄 Add New PDF
                  </button>
                  <button
                    onClick={() => setActiveTab('requests')}
                    className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700"
                  >
                    📝 Review Requests
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quiz-management' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Quiz Management</h2>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">All Quizzes</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    ➕ Add New Quiz
                  </button>
                </div>
                <div className="text-gray-600">
                  <p>Quiz management functionality coming soon...</p>
                  <ul className="mt-4 space-y-2">
                    <li>• Add/Edit Quiz Details (Title, Category, Time Limit)</li>
                    <li>• Manage Quiz Questions (Add/Edit/Delete Questions)</li>
                    <li>• Set Quiz Difficulty Level</li>
                    <li>• Enable/Disable Quizzes</li>
                    <li>• View Quiz Statistics</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pdf-management' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">PDF Management</h2>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">All PDFs</h3>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                    📄 Add New PDF
                  </button>
                </div>
                <div className="text-gray-600">
                  <p>PDF management functionality coming soon...</p>
                  <ul className="mt-4 space-y-2">
                    <li>• Add PDF Details with Google Drive Links</li>
                    <li>• Edit PDF Information</li>
                    <li>• Categorize PDFs by Subject/Exam Type</li>
                    <li>• Enable/Disable PDF Downloads</li>
                    <li>• Track Download Statistics</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'user-management' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">User Management</h2>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4">Registered Users</h3>
                <div className="text-gray-600">
                  <p>User management functionality coming soon...</p>
                  <ul className="mt-4 space-y-2">
                    <li>• View All Registered Users</li>
                    <li>• User Activity Tracking</li>
                    <li>• User Progress Analytics</li>
                    <li>• Export User Data</li>
                    <li>• Send Notifications to Users</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">User Requests & Submissions</h2>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4">Pending Requests</h3>
                <div className="text-gray-600">
                  <p>Request management functionality coming soon...</p>
                  <ul className="mt-4 space-y-2">
                    <li>• Review PDF Upload Requests from Users</li>
                    <li>• Approve/Reject Content Submissions</li>
                    <li>• Manage Quiz Suggestions</li>
                    <li>• Handle User Feedback and Reports</li>
                    <li>• Send Response Messages to Users</li>
                  </ul>
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
