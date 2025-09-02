import React, { useState } from 'react'
import { FiX, FiEye, FiEyeOff } from 'react-icons/fi'
import { signIn, signUp } from '../utils/supabase'
import toast from 'react-hot-toast'

function AuthModal({ setShowAuthModal, setUser }) {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    mobileNumber: '',
    examType: 'PO (SBI, IBPS, RRB)',
    confirmPassword: '',
    agreeToTerms: false
  })

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Login function
  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in email and password')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await signIn(formData.email, formData.password)
      
      if (error) {
        toast.error('Problem during login: ' + error.message)
      } else {
        toast.success('Successfully logged in!')
        setUser(data.user)
        setShowAuthModal(false)
      }
    } catch (error) {
      toast.error('Login error')
    } finally {
      setLoading(false)
    }
  }

  // Signup function
  const handleSignup = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.fullName || !formData.email || !formData.mobileNumber || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill all fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Password does not match')
      return
    }

    if (!formData.agreeToTerms) {
      toast.error('Please accept the terms and conditions')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await signUp(
        formData.email, 
        formData.password, 
        formData.fullName, 
        formData.mobileNumber, 
        formData.examType
      )
      
      if (error) {
        toast.error('Problem during signup: ' + error.message)
      } else {
        toast.success('Account created! Please check your email for verification (also check spam folder)')
        setShowAuthModal(false)
      }
    } catch (error) {
      toast.error('Signup error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md modal-animate">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <img src="/assets/logo.png" alt="PrepBankerHub" className="h-8 w-8" />
          <div className="flex items-center space-x-4 text-sm">
            <span>Home</span>
            <span>Study Material</span>  
            <span>Request Form</span>
          </div>
          <button
            onClick={() => setShowAuthModal(false)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">
            {isLogin ? 'Login to Your Account' : 'Create Your Account'}
          </h2>

          <form onSubmit={isLogin ? handleLogin : handleSignup}>
            
            {/* Signup Fields */}
            {!isLogin && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your mobile number"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm mb-2">Select Exam User is Preparing For</label>
                  <select
                    name="examType"
                    value={formData.examType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="PO (SBI, IBPS, RRB)">PO (SBI, IBPS, RRB)</option>
                    <option value="Clerk (SBI, IBPS, RRB)">Clerk (SBI, IBPS, RRB)</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </>
            )}

            {/* Email Field */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Signup only) */}
            {!isLogin && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm mb-2">Re-enter Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Re-enter your password"
                />
              </div>
            )}

            {/* Terms Checkbox (Signup only) */}
            {!isLogin && (
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="mr-2 text-blue-500"
                  />
                  <span className="text-sm text-gray-600">I agree to the terms and conditions</span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-primary text-white py-3 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
            </button>

            {/* Toggle Login/Signup */}
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have account? Log in"}
              </button>
            </div>

            {/* Forgot Password (Login only) */}
            {isLogin && (
              <div className="text-center mt-2">
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default AuthModal
