import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Pages import karne hain
import Home from './pages/Home'
import PDFs from './pages/PDFs'
import Magazine from './pages/Magazine'
import Calendar from './pages/Calendar'
import Request from './pages/Request'
import ResetPassword from './pages/ResetPassword'  // NEW - Added

// Admin components import karne hain
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

// Components import karne hain
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'

// Supabase import karna hai
import { getCurrentUser } from './utils/supabase'

import PDFManagement from './pages/admin/PDFManagement'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)

  // User check karne ke liye jab app load ho
  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data, error } = await getCurrentUser()
      if (data.user) {
        setUser(data.user)
      }
    } catch (error) {
      console.log('User check error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PrepBankerHub...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Header/Navbar */}
        <Navbar 
          user={user} 
          setUser={setUser}
          setShowAuthModal={setShowAuthModal}
        />

        {/* Main Content */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/PDFs" element={<PDFs user={user} />} />
            <Route path="/magazine" element={<Magazine user={user} />} />
            <Route path="/calendar" element={<Calendar user={user} />} />
            <Route path="/request" element={<Request />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admindash" element={<AdminDashboard />} />
            <Route path="/admin/pdfs" element={<PDFManagement />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />

        {/* Login/Signup Modal */}
        {showAuthModal && (
          <AuthModal 
            setShowAuthModal={setShowAuthModal}
            setUser={setUser}
          />
        )}

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App
