import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Pages import karne hain
import Home from './pages/Home'
import PDFs from './pages/PDFs'
import Magazine from './pages/Magazine'
import Calendar from './pages/Calendar'
import Request from './pages/Request'
import ResetPassword from './pages/ResetPassword'

// Admin components import karne hain
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import PDFManagement from './pages/admin/PDFManagement'

// Components import karne hain
import Layout from './components/Layout'
import AuthModal from './components/AuthModal'
import TermsAndConditions from './components/TermsAndConditions'

// Supabase import karna hai
import { getCurrentUser } from './utils/supabase'

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
      <div className="min-h-screen">
        
        <Routes>
          {/* Main Pages with Layout */}
          <Route path="/" element={
            <Layout user={user} setUser={setUser} setShowAuthModal={setShowAuthModal}>
              <Home />
            </Layout>
          } />
          
          <Route path="/PDFs" element={
            <Layout user={user} setUser={setUser} setShowAuthModal={setShowAuthModal}>
              <PDFs user={user} />
            </Layout>
          } />
          
          <Route path="/magazine" element={
            <Layout user={user} setUser={setUser} setShowAuthModal={setShowAuthModal}>
              <Magazine user={user} />
            </Layout>
          } />
          
          <Route path="/calendar" element={
            <Layout user={user} setUser={setUser} setShowAuthModal={setShowAuthModal}>
              <Calendar user={user} />
            </Layout>
          } />
          
          <Route path="/request" element={
            <Layout user={user} setUser={setUser} setShowAuthModal={setShowAuthModal}>
              <Request />
            </Layout>
          } />

          <Route path="/termandconditions" element={
            <TermsAndConditions />
          } />

          {/* Special Pages without Layout */}
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admindash" element={<AdminDashboard />} />
          <Route path="/admin/pdfs" element={<PDFManagement />} />
        </Routes>

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
