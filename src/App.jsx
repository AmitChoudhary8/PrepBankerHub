return <h1>Hello World (Debug Mode)</h1>

import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Pages imports
import Home from './pages/Home'
import PDFs from './pages/PDFs'
import Magazine from './pages/Magazine'
import Calendar from './pages/Calendar'
import Request from './pages/Request'
import ResetPassword from './pages/ResetPassword'

// Blog pages
import BlogsList from './pages/BlogsList'
import BlogPost from './pages/BlogPost'

// Admin components
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import PDFManagement from './pages/admin/PDFManagement'
import AdminBlogManagement from './pages/admin/AdminBlogManagement'  // Added

// Components
import Layout from './components/Layout'
import AuthModal from './components/AuthModal'
import TermsAndConditions from './components/TermsAndConditions'

// ErrorBoundary import
import ErrorBoundary from './components/ErrorBoundary'

// Supabase utils
import { getCurrentUser } from './utils/supabase'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    async function checkUser() {
      try {
        const { data, error } = await getCurrentUser()
        if (data?.user) setUser(data.user)
      } catch (error) {
        console.log('User fetch error:', error)
      } finally {
        setLoading(false)
      }
    }
    checkUser()
  }, [])

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PrepBankerHub...</p>
        </div>
      </div>
    )

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen">
          <Routes>
            {/* Using Layout */}
            <Route
              path="/"
              element={
                <Layout user={user} setUser={setUser} setShowModal={setShowModal}>
                  <Home />
                </Layout>
              }
            />
            <Route
              path="/PDFs"
              element={
                <Layout user={user} setUser={setUser} setShowModal={setShowModal}>
                  <PDFs user={user} />
                </Layout>
              }
            />
            <Route
              path="/magazine"
              element={
                <Layout user={user} setUser={setUser} setShowModal={setShowModal}>
                  <Magazine />
                </Layout>
              }
            />
            <Route
              path="/calendar"
              element={
                <Layout user={user} setUser={setUser} setShowModal={setShowModal}>
                  <Calendar />
                </Layout>
              }
            />
            <Route
              path="/request"
              element={
                <Layout user={user} setUser={setUser} setShowModal={setShowModal}>
                  <Request />
                </Layout>
              }
            />
            <Route path="/termandconditions" element={<TermsAndConditions />} />

            {/* Blog Routes */}
            <Route
              path="/blogs"
              element={
                <Layout user={user} setUser={setUser} setShowModal={setShowModal}>
                  <BlogsList />
                </Layout>
              }
            />
            <Route
              path="/blogs/:slug"
              element={
                <Layout user={user} setUser={setUser} setShowModal={setShowModal}>
                  <BlogPost />
                </Layout>
              }
            />

            {/* Admin Routes */}
            <Route path="/adminLogin" element={<AdminLogin />} />
            <Route path="/admindash" element={<AdminDashboard />} />
            <Route path="/admin/blogs" element={<AdminBlogManagement />} />
            <Route path="/admin/pdfs" element={<PDFManagement />} />

            {/* Others */}
            <Route path="/reset-password" element={<ResetPassword />} />

          </Routes>

          {/* Footer */}
          <Footer />

          {/* Auth modal */}
          {showModal && <AuthModal setShowModal={setShowModal} setUser={setUser} />}

          {/* Toasts */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { background: '#000', color: '#fff' },
            }}
          />
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
