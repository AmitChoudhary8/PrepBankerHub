import React, { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'

const UserManager = () => {
  const [users, setUsers] = useState([])
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    recentSignups: 0,
    activeUsers: 0
  })
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [userAttempts, setUserAttempts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
    fetchUserStats()
  }, [])

  const fetchUsers = async () => {
    try {
      // Fetch from public.users table (synced with auth.users)
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching users:', error)
      } else {
        console.log('Fetched users:', users)
        setUsers(users || [])
      }
      setLoading(false)
    } catch (error) {
      console.error('Error in fetchUsers:', error)
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      // Get stats from public.users table
      const { count: totalCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Get recent signups (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { count: recentCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString())

      setUserStats({
        totalUsers: totalCount || 0,
        recentSignups: recentCount || 0,
        activeUsers: totalCount || 0
      })
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const fetchUserAttempts = async (userId) => {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        quizzes (title, difficulty)
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })

    if (error) {
      console.error('Error fetching user attempts:', error)
    } else {
      setUserAttempts(data || [])
    }
  }

  const handleViewUserDetails = (user) => {
    setSelectedUser(user)
    setShowUserDetails(true)
    fetchUserAttempts(user.id)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString()
  }

  const calculateUserScore = (attempts) => {
    if (!attempts.length) return 0
    const totalScore = attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0)
    return Math.round(totalScore / attempts.length)
  }

  const exportUsersToCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Join Date', 'Last Sign In'],
      ...users.map(user => [
        user.name || 'N/A',
        user.email,
        new Date(user.created_at).toLocaleDateString(),
        user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `users_export_${new Date().toISOString().split('T')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const refreshUsers = async () => {
    setLoading(true)
    await fetchUsers()
    await fetchUserStats()
  }

  // User Details Modal
  if (showUserDetails && selectedUser) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">User Details</h2>
            <button
              onClick={() => {
                setShowUserDetails(false)
                setSelectedUser(null)
                setUserAttempts([])
              }}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-bold mb-4">📋 Basic Information</h3>
              <div className="space-y-2">
                <p><strong>Name:</strong> {selectedUser.name}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Join Date:</strong> {formatDate(selectedUser.created_at)}</p>
                <p><strong>Last Login:</strong> {formatDate(selectedUser.last_sign_in_at)}</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-bold mb-4">📊 Quiz Statistics</h3>
              <div className="space-y-2">
                <p><strong>Total Attempts:</strong> {userAttempts.length}</p>
                <p><strong>Average Score:</strong> {calculateUserScore(userAttempts)}%</p>
                <p><strong>Best Score:</strong> {userAttempts.length ? Math.max(...userAttempts.map(a => a.score || 0)) : 0}%</p>
                <p><strong>Total Time:</strong> {userAttempts.reduce((sum, a) => sum + (a.time_taken || 0), 0)} minutes</p>
              </div>
            </div>
          </div>

          {/* Quiz Attempts */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4">🎯 Quiz Attempts History</h3>
            {userAttempts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full bg-white border rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Quiz</th>
                      <th className="px-4 py-2 text-left">Score</th>
                      <th className="px-4 py-2 text-left">Questions</th>
                      <th className="px-4 py-2 text-left">Time Taken</th>
                      <th className="px-4 py-2 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userAttempts.map(attempt => (
                      <tr key={attempt.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <div className="font-medium">{attempt.quizzes?.title || 'Unknown Quiz'}</div>
                          <div className="text-sm text-gray-500">{attempt.quizzes?.difficulty}</div>
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-sm ${
                            (attempt.score || 0) >= 70 ? 'bg-green-100 text-green-800' :
                            (attempt.score || 0) >= 50 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {attempt.score || 0}%
                          </span>
                        </td>
                        <td className="px-4 py-2">{attempt.total_questions}</td>
                        <td className="px-4 py-2">{attempt.time_taken} min</td>
                        <td className="px-4 py-2 text-sm">{formatDate(attempt.completed_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No quiz attempts found for this user.</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">User Management</h2>
        <div className="space-x-2">
          <button
            onClick={refreshUsers}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            🔄 Refresh
          </button>
          <button
            onClick={exportUsersToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            📊 Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600">{userStats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Recent Signups (7 days)</h3>
          <p className="text-3xl font-bold text-green-600">{userStats.recentSignups}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Active Users</h3>
          <p className="text-3xl font-bold text-purple-600">{userStats.activeUsers}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Loading users...</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{user.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatDate(user.last_sign_in_at)}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => handleViewUserDetails(user)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      👁️ View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {users.length === 0 && !loading && (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500">No users found. Users will appear here when they register on your website.</p>
        </div>
      )}
    </div>
  )
}

export default UserManager
