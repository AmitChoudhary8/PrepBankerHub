import React, { useState, useEffect } from 'react'
import { supabase } from './utils/supabase'
import LoginModal from './components/Auth/LoginModal'
import SignupModal from './components/Auth/SignupModal'
import AdminLogin from './components/Admin/AdminLogin'
import AdminDashboard from './components/Admin/AdminDashboard'
import QuizList from './components/User/QuizList'
import QuizPlayer from './components/User/QuizPlayer'
import PDFList from './components/User/PDFList'
import ExamCalendar from './components/User/ExamCalendar'
import './App.css'

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [user, setUser] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  
  // States for Quiz functionality
  const [showQuizList, setShowQuizList] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  
  // State for PDF functionality
  const [showPDFList, setShowPDFList] = useState(false)
  
  // New state for Exam Calendar functionality
  const [showExamCalendar, setShowExamCalendar] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    // Check Admin Session
    const adminSession = localStorage.getItem('adminSession')
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession)
        const twoHours = 2 * 60 * 60 * 1000 // 2 hours timeout
        if (Date.now() - session.loginTime < twoHours) {
          setIsAdmin(true)
        } else {
          localStorage.removeItem('adminSession')
        }
      } catch (error) {
        localStorage.removeItem('adminSession')
      }
    }

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    // Reset all states when user logs out
    setShowQuizList(false)
    setSelectedQuiz(null)
    setShowPDFList(false)
    setShowExamCalendar(false)
  }

  const handleAdminLogout = () => {
    localStorage.removeItem('adminSession')
    setIsAdmin(false)
    alert('Admin logged out successfully!')
  }

  const handleQuizComplete = () => {
    setSelectedQuiz(null)
    setShowQuizList(false)
  }

  const resetToHome = () => {
    setShowQuizList(false)
    setSelectedQuiz(null)
    setShowPDFList(false)
    setShowExamCalendar(false)
  }

  // If admin is logged in, show admin dashboard instead of regular website
  if (isAdmin) {
    return <AdminDashboard onLogout={handleAdminLogout} />
  }

  // Regular website for non-admin users
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center space-x-2">
            <button 
              onClick={resetToHome}
              className="text-2xl font-bold hover:text-blue-200 transition-colors"
            >
              PrepBankerHub
            </button>
            <span className="text-blue-200">🏦</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors"
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>

            {/* Regular User Login/Logout */}
            {user && !isAdmin ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm">Hi, {user.user_metadata?.name || 'User'}!</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  Logout
                </button>
              </div>
            ) : null}

            {/* Login and Admin Buttons (when not logged in) */}
            {!user && !isAdmin ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => setShowAdminLogin(true)}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg transition-colors text-sm"
                >
                  🔐 Admin
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-6xl mx-auto">
        
        {/* Home Page - Show when user is logged in but no section selected */}
        {user && !showQuizList && !selectedQuiz && !showPDFList && !showExamCalendar && (
          <>
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
            <div className="mb-6 p-4 bg-green-100 dark:bg-green-800 rounded-lg text-center">
              <p className="text-green-800 dark:text-green-200">
                ✅ Welcome back, {user.user_metadata?.name || 'User'}! You are logged in.
              </p>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-bold mb-2">📚 Practice Quizzes</h3>
                <p className="text-gray-600 dark:text-gray-300">Test your knowledge with interactive quizzes</p>
                <button 
                  onClick={() => setShowQuizList(true)}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Start Quiz
                </button>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-bold mb-2">📄 PDF Downloads</h3>
                <p className="text-gray-600 dark:text-gray-300">Download study materials and notes</p>
                <button 
                  onClick={() => setShowPDFList(true)}
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  View PDFs
                </button>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-bold mb-2">📅 Exam Calendar</h3>
                <p className="text-gray-600 dark:text-gray-300">Track important exam dates</p>
                <button 
                  onClick={() => setShowExamCalendar(true)}
                  className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  View Calendar
                </button>
              </div>
            </div>
          </>
        )}

        {/* Quiz List - Show when user wants to select a quiz */}
        {user && showQuizList && !selectedQuiz && (
          <div>
            <button
              onClick={() => setShowQuizList(false)}
              className="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Home
            </button>
            <QuizList
              onStartQuiz={(quiz) => {
                setSelectedQuiz(quiz)
                setShowQuizList(false)
              }}
            />
          </div>
        )}

        {/* Quiz Player - Show when user is taking a quiz */}
        {user && selectedQuiz && (
          <QuizPlayer
            quiz={selectedQuiz}
            user={user}
            onComplete={() => {
              setSelectedQuiz(null)
              setShowQuizList(false)
            }}
          />
        )}

        {/* PDF List - Show when user wants to browse PDFs */}
        {user && showPDFList && !showQuizList && !selectedQuiz && !showExamCalendar && (
          <div>
            <button
              onClick={() => setShowPDFList(false)}
              className="mb-6 flex items-center text-green-600 hover:text-green-800 font-medium"
            >
              ← Back to Home
            </button>
            <PDFList />
          </div>
        )}

        {/* Exam Calendar - Show when user wants to view calendar */}
        {user && showExamCalendar && !showQuizList && !selectedQuiz && !showPDFList && (
          <div>
            <button
              onClick={() => setShowExamCalendar(false)}
              className="mb-6 flex items-center text-purple-600 hover:text-purple-800 font-medium"
            >
              ← Back to Home
            </button>
            <ExamCalendar />
          </div>
        )}

        {/* Welcome Page for Non-Logged Users */}
        {!user && !isAdmin && (
          <>
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

            {/* Login Prompt */}
            <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-800 rounded-lg text-center">
              <p className="text-yellow-800 dark:text-yellow-200">
                📢 Please login to access quizzes, download PDFs, and track your progress!
              </p>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-2">📚 Practice Quizzes</h3>
                <p className="text-gray-600 dark:text-gray-300">Test your knowledge with interactive quizzes</p>
                <button 
                  onClick={() => setShowLogin(true)}
                  className="mt-4 bg-gray-400 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-500"
                >
                  Login to Access
                </button>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-2">📄 PDF Downloads</h3>
                <p className="text-gray-600 dark:text-gray-300">Download study materials and notes</p>
                <button 
                  onClick={() => setShowLogin(true)}
                  className="mt-4 bg-gray-400 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-500"
                >
                  Login to Access
                </button>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-2">📅 Exam Calendar</h3>
                <p className="text-gray-600 dark:text-gray-300">Track important exam dates</p>
                <button 
                  onClick={() => setShowLogin(true)}
                  className="mt-4 bg-gray-400 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-500"
                >
                  Login to Access
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 mt-12">
        <div className="text-center">
          <p>&copy; 2025 PrepBankerHub. All resources are completely free!</p>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={() => {
            setShowLogin(false)
            setShowSignup(true)
          }}
        />
      )}

      {/* Signup Modal */}
      {showSignup && (
        <SignupModal
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={() => {
            setShowSignup(false)
            setShowLogin(true)
          }}
        />
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <AdminLogin
          onClose={() => setShowAdminLogin(false)}
          onAdminLogin={setIsAdmin}
        />
      )}
    </div>
  )
}

export default App
