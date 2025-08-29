import React, { useState, useEffect } from 'react'
import { supabase } from './utils/supabase'
import './App.css'

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [user, setUser] = useState(null)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">PrepBankerHub</h1>
            <span className="text-blue-200">🏦</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors"
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>

            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm">Hi, {user.user_metadata?.name || 'User'}!</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4">
            Welcome to PrepBankerHub
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Complete Banking Exam Preparation Platform
          </p>
          
          {/* Free Banner */}
          <div className="mt-6 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
            <h3 className="text-2xl font-bold">
              👉 All Resources on this Website are 100% Free
            </h3>
            <p className="mt-2">Access PDFs, Quizzes, and Study Materials</p>
          </div>
        </div>

        {/* User Status */}
        {user && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-800 rounded-lg text-center">
            <p className="text-green-800 dark:text-green-200">
              ✅ Welcome back, {user.user_metadata?.name || 'User'}! You are logged in.
            </p>
          </div>
        )}

        {/* Login Prompt for Non-Logged Users */}
        {!user && (
          <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-800 rounded-lg text-center">
            <p className="text-yellow-800 dark:text-yellow-200">
              📢 Please login to access quizzes, download PDFs, and track your progress!
            </p>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-bold mb-2">📚 Practice Quizzes</h3>
            <p className="text-gray-600 dark:text-gray-300">Test your knowledge with interactive quizzes</p>
            {user && (
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Start Quiz
              </button>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-bold mb-2">📄 PDF Downloads</h3>
            <p className="text-gray-600 dark:text-gray-300">Download study materials and notes</p>
            {user && (
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                View PDFs
              </button>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-bold mb-2">📅 Exam Calendar</h3>
            <p className="text-gray-600 dark:text-gray-300">Track important exam dates</p>
            {user && (
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                View Calendar
              </button>
            )}
          </div>
        </div>

        {/* Temporary Login Alert */}
        {showLogin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md mx-4">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-4">Login Coming Soon!</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Authentication system is being developed. 
                  Login functionality will be available soon!
                </p>
                <button
                  onClick={() => setShowLogin(false)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 mt-12">
        <div className="text-center">
          <p>&copy; 2025 PrepBankerHub. All resources are completely free!</p>
        </div>
      </footer>
    </div>
  )
}

export default App
