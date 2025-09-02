import React from 'react'
import { Link } from 'react-router-dom'
import { FiUser, FiLogOut } from 'react-icons/fi'
import { signOut } from '../utils/supabase'
import toast from 'react-hot-toast'

function Navbar({ user, setUser, setShowAuthModal }) {

  // Logout function
  const handleLogout = async () => {
    try {
      const { error } = await signOut()
      if (error) {
        toast.error('Logout mein problem hui')
      } else {
        setUser(null)
        toast.success('Successfully logged out')
      }
    } catch (error) {
      toast.error('Logout mein error')
    }
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Only - No Site Name */}
          <Link to="/" className="flex items-center">
            <img 
              src="/assets/logo.png" 
              alt="PrepBankerHub" 
              className="h-12 w-auto"
            />
          </Link>

          {/* Mobile Menu - Hidden on desktop */}
          <div className="md:hidden">
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {user.user_metadata?.full_name || 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-500"
                >
                  <FiLogOut size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Login/SignUp
              </button>
            )}
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            
            {/* Navigation Links */}
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/PDFs" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Study Material
            </Link>
            <Link 
              to="/request" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Request Form
            </Link>

            {/* User Section */}
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FiUser className="text-gray-600" />
                  <span className="text-gray-700 font-medium">
                    {user.user_metadata?.full_name || 'User'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center space-x-1"
                >
                  <FiLogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-primary text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Login/SignUp
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
