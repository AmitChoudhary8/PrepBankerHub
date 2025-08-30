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
import Footer from './components/Footer'
import './App.css'

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [user, setUser] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  
  const [showQuizList, setShowQuizList] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [showPDFList, setShowPDFList] = useState(false)
  const [showExamCalendar, setShowExamCalendar] = useState(false)
  const [showRequestForm, setShowRequestForm] = useState(false)
  
  // Share URL handling states
  const [sharedItemType, setSharedItemType] = useState(null)
  const [sharedItemId, setSharedItemId] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

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

    // Handle shared URLs - Check if URL contains share parameters
    const currentPath = window.location.pathname
    const pathSegments = currentPath.split('/').filter(segment => segment)
    
    if (pathSegments.length === 2) {
      const [itemType, itemId] = pathSegments
      if ((itemType === 'pdf' || itemType === 'quiz') && itemId) {
        setSharedItemType(itemType)
        setSharedItemId(itemId)
        
        // Auto-navigate to appropriate section when user is logged in
        if (session?.user) {
          if (itemType === 'pdf') {
            setShowPDFList(true)
          } else if (itemType === 'quiz') {
            setShowQuizList(true)
          }
        }
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
    setSharedItemType(null)
    setSharedItemId(null)
    
    // Clean URL when going back to home
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/')
    }
  }

  const resetToHome = () => {
    resetAllStates()
  }

  if (isAdmin) {
    return <AdminDashboard onLogout={handleAdminLogout} />
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Mobile-Optimized Header with Logo */}
      <header className="bg-blue-600 text-white p-2 md:p-3 shadow-lg">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          {/* Logo Section - Full Width Logo */}
          <div className="flex-1 flex items-center justify-start">
            <button 
              onClick={resetToHome}
              className="hover:opacity-80 transition-opacity"
            >
              <img 
                src="/assets/logo.png" 
                alt="PrepBankerHub Logo" 
                className="h-10 md:h-14 w-auto object-contain max-w-full"
                style={{ 
                  maxHeight: '56px', // Prevents logo from being too large
                  maxWidth: '300px'   // Responsive max width
                }}
              />
            </button>
          </div>
          
          {/* Mobile-Optimized Controls */}
          <div className="flex items-center space-x-1 md:space-x-4">
            {/* Dark Mode Toggle - Compact on mobile */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="bg-blue-700 hover:bg-blue-800 px-2 md:px-4 py-2 rounded-lg transition-colors text-sm"
              style={{ minHeight: '44px' }}
            >
              <span className="md:hidden">{darkMode ? '☀️' : '🌙'}</span>
              <span className="hidden md:inline">{darkMode ? '☀️ Light' : '🌙 Dark'}</span>
            </button>

            {/* User Section - Mobile Optimized */}
            {user && !isAdmin ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                <span className="text-xs sm:text-sm hidden sm:block truncate max-w-24 md:max-w-none">
                  Hi, {user.user_metadata?.name || 'User'}!
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-2 md:px-4 py-2 rounded-lg transition-colors text-xs md:text-sm font-medium"
                  style={{ minHeight: '44px' }}
                >
                  <span className="sm:hidden">Exit</span>
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : null}

            {/* Login Buttons - Mobile Stack */}
            {!user && !isAdmin ? (
              <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-green-600 hover:bg-green-700 px-3 md:px-4 py-2 rounded-lg transition-colors text-xs md:text-sm font-medium"
                  style={{ minHeight: '44px' }}
                >
                  Login
                </button>
                <button
                  onClick={() => setShowAdminLogin(true)}
                  className="bg-red-600 hover:bg-red-700 px-2 md:px-3 py-2 rounded-lg transition-colors text-xs"
                  style={{ minHeight: '44px' }}
                >
                  🔐
                  <span className="hidden sm:inline ml-1">Admin</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Main Content - Mobile Responsive */}
      <main className="p-3 md:p-6 max-w-6xl mx-auto">
        
        {/* Shared Content Message - Show when someone visits via shared link */}
        {sharedItemType && sharedItemId && !user && (
          <div className="mb-4 md:mb-6 p-4 bg-blue-100 dark:bg-blue-800 rounded-lg text-center">
            <p className="text-blue-800 dark:text-blue-200 text-sm md:text-base mb-3">
              🔗 You've accessed a shared {sharedItemType}! Please login to view the content.
            </p>
            <button
              onClick={() => setShowLogin(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
              style={{ minHeight: '44px' }}
            >
              Login to Access
            </button>
          </div>
        )}
        
        {/* Home Page - Mobile Optimized */}
        {user && !showQuizList && !selectedQuiz && !showPDFList && !showExamCalendar && !showRequestForm && (
          <>
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">
                Welcome to PrepBankerHub
              </h2>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 px-4">
                Complete Banking Exam Preparation Platform
              </p>
              
              <div className="mt-4 md:mt-6 p-4 md:p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white mx-2 md:mx-0">
                <h3 className="text-lg md:text-2xl font-bold">
                  👉 All Resources on this Website are 100% Free
                </h3>
                <p className="mt-2 text-sm md:text-base">Access PDFs, Quizzes, and Study Materials</p>
              </div>
            </div>

            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-green-100 dark:bg-green-800 rounded-lg text-center">
              <p className="text-green-800 dark:text-green-200 text-sm md:text-base">
                ✅ Welcome back, {user.user_metadata?.name || 'User'}! You are logged in.
              </p>
            </div>

            {/* Show shared content notification if user accessed via shared link */}
            {sharedItemType && sharedItemId && (
              <div className="mb-4 md:mb-6 p-3 md:p-4 bg-yellow-100 dark:bg-yellow-800 rounded-lg text-center">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm md:text-base mb-3">
                  🎉 You accessed a shared {sharedItemType}! Click below to view it:
                </p>
                <button
                  onClick={() => {
                    if (sharedItemType === 'pdf') {
                      setShowPDFList(true)
                    } else if (sharedItemType === 'quiz') {
                      setShowQuizList(true)
                    }
                  }}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 text-sm font-medium"
                  style={{ minHeight: '44px' }}
                >
                  View Shared {sharedItemType.toUpperCase()}
                </button>
              </div>
            )}

            {/* Mobile-Optimized Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-6 md:mt-8">
              <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-lg md:text-xl font-bold mb-2">📚 Practice Quizzes</h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-3 md:mb-4">
                  Test your knowledge with interactive quizzes
                </p>
                <button 
                  onClick={() => setShowQuizList(true)}
                  className="w-full bg-blue-600 text-white px-3 md:px-4 py-3 rounded-lg hover:bg-blue-700 text-sm md:text-base font-medium"
                  style={{ minHeight: '44px' }}
                >
                  Start Quiz
                </button>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-lg md:text-xl font-bold mb-2">📄 PDF Downloads</h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-3 md:mb-4">
                  Download study materials and notes
                </p>
                <button 
                  onClick={() => setShowPDFList(true)}
                  className="w-full bg-green-600 text-white px-3 md:px-4 py-3 rounded-lg hover:bg-green-700 text-sm md:text-base font-medium"
                  style={{ minHeight: '44px' }}
                >
                  View PDFs
                </button>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-lg md:text-xl font-bold mb-2">📅 Exam Calendar</h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-3 md:mb-4">
                  Track important exam dates
                </p>
                <button 
                  onClick={() => setShowExamCalendar(true)}
                  className="w-full bg-purple-600 text-white px-3 md:px-4 py-3 rounded-lg hover:bg-purple-700 text-sm md:text-base font-medium"
                  style={{ minHeight: '44px' }}
                >
                  View Calendar
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-lg md:text-xl font-bold mb-2">📝 Submit Request</h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-3 md:mb-4">
                  Request PDFs or send feedback
                </p>
                <button 
                  onClick={() => setShowRequestForm(true)}
                  className="w-full bg-orange-600 text-white px-3 md:px-4 py-3 rounded-lg hover:bg-orange-700 text-sm md:text-base font-medium"
                  style={{ minHeight: '44px' }}
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
              className="mb-4 md:mb-6 flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm md:text-base"
              style={{ minHeight: '44px' }}
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
              className="mb-4 md:mb-6 flex items-center text-green-600 hover:text-green-800 font-medium text-sm md:text-base"
              style={{ minHeight: '44px' }}
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
              className="mb-4 md:mb-6 flex items-center text-purple-600 hover:text-purple-800 font-medium text-sm md:text-base"
              style={{ minHeight: '44px' }}
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
              className="mb-4 md:mb-6 flex items-center text-orange-600 hover:text-orange-800 font-medium text-sm md:text-base"
              style={{ minHeight: '44px' }}
            >
              ← Back to Home
            </button>
            <UserRequestForm user={user} />
          </div>
        )}

        {/* Welcome Page for Non-Logged Users - Mobile Optimized */}
        {!user && !isAdmin && (
          <>
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">
                Welcome to PrepBankerHub
              </h2>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 px-4">
                Complete Banking Exam Preparation Platform
              </p>
              
              <div className="mt-4 md:mt-6 p-4 md:p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white mx-2 md:mx-0">
                <h3 className="text-lg md:text-2xl font-bold">
                  👉 All Resources on this Website are 100% Free
                </h3>
                <p className="mt-2 text-sm md:text-base">Access PDFs, Quizzes, and Study Materials</p>
              </div>
            </div>

            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-yellow-100 dark:bg-yellow-800 rounded-lg text-center">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm md:text-base">
                📢 Please login to access quizzes, download PDFs, and track your progress!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-6 md:mt-8">
              <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
                <h3 className="text-lg md:text-xl font-bold mb-2">📚 Practice Quizzes</h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-3 md:mb-4">
                  Test your knowledge with interactive quizzes
                </p>
                <button 
                  onClick={() => setShowLogin(true)}
                  className="w-full bg-gray-400 text-white px-3 md:px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-500 text-sm md:text-base"
                  style={{ minHeight: '44px' }}
                >
                  Login to Access
                </button>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
                <h3 className="text-lg md:text-xl font-bold mb-2">📄 PDF Downloads</h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-3 md:mb-4">
                  Download study materials and notes
                </p>
                <button 
                  onClick={() => setShowLogin(true)}
                  className="w-full bg-gray-400 text-white px-3 md:px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-500 text-sm md:text-base"
                  style={{ minHeight: '44px' }}
                >
                  Login to Access
                </button>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
                <h3 className="text-lg md:text-xl font-bold mb-2">📅 Exam Calendar</h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-3 md:mb-4">
                  Track important exam dates
                </p>
                <button 
                  onClick={() => setShowLogin(true)}
                  className="w-full bg-gray-400 text-white px-3 md:px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-500 text-sm md:text-base"
                  style={{ minHeight: '44px' }}
                >
                  Login to Access
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
                <h3 className="text-lg md:text-xl font-bold mb-2">📝 Submit Request</h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-3 md:mb-4">
                  Request PDFs or send feedback
                </p>
                <button 
                  onClick={() => setShowLogin(true)}
                  className="w-full bg-gray-400 text-white