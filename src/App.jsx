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
import UserRequestForm from './components/User/UserRequestForm'
import './App.css'

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [user, setUser] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  
  // States for functionality
  const [showQuizList, setShowQuizList] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [showPDFList, setShowPDFList] = useState(false)
  const [showExamCalendar, setShowExamCalendar] = useState(false)
  const [showRequestForm, setShowRequestForm] = useState(false)

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
        const twoHours = 2 * 60 * 60 * 1000
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
    resetAllStates()
  }

  const handleAdminLogout = () => {
    localStorage.removeItem('adminSession')
    setIsAdmin(false)
    alert('Admin logged out successfully!')
  }

  const resetAllStates = () => {
    setShowQuizList(false)
    setSelectedQuiz(null)
    setShowPDFList(false)
    setShowExamCalendar(false)
    setShowRequestForm(false)
  }

  const resetToHome = () => {
    resetAllStates()
  }

  // If admin is logged in, show admin dashboard
  if (isAdmin) {
    return <AdminDashboard onLogout={handleAdminLogout} />
  }

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
        
        {/* Home Page */}
        {user && !showQuizList && !selectedQuiz && !showPDFList && !showExamCalendar && !showRequestForm && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4">Welcome to PrepBankerHub</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Complete Banking Exam Preparation Platform
              </p>
              
              <div className="mt-6 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
                <h3 className="text-2xl font-bold">👉 All Resources on this Website are 100% Free</h3>
                <p className="mt-2">Access PDFs, Quizzes, and Study Materials</p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-green-100 dark:bg-green-800 rounded-lg text-center">
              <p className="text-green-800 dark:text-green-200">
                ✅ Welcome back, {user.user_metadata?.name || 'User'}! You are logged in.
              </p>
            </div>

            {/* Quick Links - Updated with Request Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-bold mb-2">📚 Practice Quizzes</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Test your knowledge with interactive quizzes</p>
                <button 
                  onClick={() => setShowQuizList(true)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Start Quiz
                </button>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-bold mb-2">📄 PDF Downloads</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Download study materials and notes</p>
                <button 
                  onClick={() => setShowPDFList(true)}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  View PDFs
                </button>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-bold mb-2">📅 Exam Calendar</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Track important exam dates</p>
                <button 
                  onClick={() => setShowExamCalendar(true)}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  View Calendar
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-bold mb-2">📝 Submit Request</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Request PDFs or send feedback</p>
                <button 
                  onClick={() => setShowRequestForm(true)}
                  className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                >
                  Send Request
                </button>
              </div>
            </div>
          </>
        )}

        {/* Quiz List */}
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

        {/* Quiz Player */}
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

        {/* PDF List */}
        {user && showPDFList && !showQuizList && !selectedQuiz && !showExamCalendar && !showRequestForm && (
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

        {/* Exam Calendar */}
        {user && showExamCalendar && !showQuizList && !selectedQuiz && !showPDFList && !showRequestForm && (
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

        {/* User Request Form */}
        {user && showRequestForm && !showQuizList && !selectedQuiz && !showPDFList && !showExamCalendar && (
          <div>
            <button
              onClick={() => setShowRequestForm(false)}
              className="mb-6 flex items-center text-orange-600 hover:text-orange-800 font-medium"
            >
              ← Back to Home
            </button>
            <UserRequestForm user={user} />
          </div>
        )}

        {/* Welcome Page for Non-Logged Users */}
        {!user && !isAdmin && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4">Welcome to PrepBankerHub</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Complete Banking Exam Preparation Platform
              </p>
              
              <div className="mt-6 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
                <h3 className="text-2xl font-bold">👉 All Resources on this Website are 100% Free</h3>
                <p className="mt-2">Access PDFs, Quizzes, and Study Materials</p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-800 rounded-lg text-center">
              <p className="text-yellow-800 dark:text-yellow-200">
                📢 Please login to access quizzes, download PDFs, and track your progress!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-2">📚 Practice Quizzes</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Test your knowledge with interactive quizzes</p>
                <button 
                  onClick={() => setShowLogin(true)}
                  className="w-full bg-gray-400 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-500"
                >
                  Login to Access
                </button>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-2">📄 PDF Downloads</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Download study materials and notes</p>
                <button 
                  onClick={() => setShowLogin(true)}
                  className="w-full bg-gray-400 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-500"
                >
                  Login to Access
                </button>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-2">📅 Exam Calendar</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Track important exam dates</p>
                <button 
                  onClick={() => setShowLogin(true)}
                  className="w-full bg-gray-400 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-500"
                >
                  Login to Access
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-2">📝 Submit Request</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Request PDFs or send feedback</p>
                <button 
                  onClick={() => setShowLogin(true)}
                  className="w-full bg-gray-400 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-500"
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

      {/* Modals */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={() => {
            setShowLogin(false)
            setShowSignup(true)
          }}
        />
      )}

      {showSignup && (
        <SignupModal
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={() => {
            setShowSignup(false)
            setShowLogin(true)
          }}
        />
      )}

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
