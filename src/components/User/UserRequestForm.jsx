import React, { useState } from 'react'
import { supabase } from '../../utils/supabase'

const UserRequestForm = ({ user }) => {
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    message: '',
    pdfLink: '',
    requestType: 'general'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
    setSuccess('')
  }

  const validateForm = () => {
    // name is required (NOT NULL constraint)
    if (!formData.name || !formData.name.trim()) {
      setError('❌ Name is required and cannot be empty')
      return false
    }
    
    if (formData.name.trim().length < 2) {
      setError('❌ Name must be at least 2 characters long')
      return false
    }

    // Basic email validation if provided
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        setError('❌ Please enter a valid email address')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        setError('🚨 Authentication error: ' + sessionError.message)
        setLoading(false)
        return
      }

      // ✅ PERFECT MAPPING - Based on your exact table structure
      const insertData = {
        // Required fields (NOT NULL)
        name: formData.name.trim(),                    // ✅ name (NOT NULL)
        request_type: formData.requestType || 'general', // ✅ request_type (NOT NULL)
        
        // Optional fields (NULL allowed)
        message: formData.message.trim() || null,      // ✅ message (nullable)
        email: formData.email.trim() || null,          // ✅ email (nullable)  
        pdf_link: formData.pdfLink.trim() || null,     // ✅ pdf_link (nullable)
        status: 'pending',                             // ✅ status (nullable)
      }

      // Add user_id if user is logged in
      if (session?.user?.id) {
        insertData.user_id = session.user.id          // ✅ user_id (nullable)
      }

      // Debug log (remove in production)
      console.log('Inserting data:', insertData)
      alert('Inserting: ' + JSON.stringify(insertData, null, 2))

      const { data, error: insertError } = await supabase
        .from('user_requests')
        .insert([insertData])
        .select()

      console.log('Supabase response:', { data, error: insertError })

      if (insertError) {
        console.error('Insert error:', insertError)
        
        // Handle specific error codes
        if (insertError.code === '23502') {
          setError('❌ Required field missing: ' + insertError.message)
        } else if (insertError.code === '42501') {
          setError('🔒 Permission denied. Please make sure you are logged in.')
        } else {
          setError('❌ Database Error: ' + insertError.message)
        }
        
        alert('Error: ' + JSON.stringify(insertError))
        
      } else {
        console.log('Success:', data)
        setSuccess('✅ Your request has been submitted successfully! We will review it and get back to you soon.')
        
        // Reset form
        setFormData({
          name: user?.user_metadata?.name || '',
          email: user?.email || '',
          message: '',
          pdfLink: '',
          requestType: 'general'
        })
        
        alert('✅ Request submitted successfully!')
      }

    } catch (err) {
      console.error('Catch error:', err)
      setError('🌐 Network Error: ' + err.message + '. Please check your internet connection and try again.')
      alert('Network Error: ' + err.message)
    }

    setLoading(false)
  }

  return (
    <div className="p-2 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-8">
          <h2 className="text-xl md:text-3xl font-bold mb-4 md:mb-6 text-center">
            📝 Submit Your Request
          </h2>
          
          <p className="text-sm md:text-base text-gray-600 text-center mb-6 md:mb-8">
            Have a suggestion, feedback, or want to request a PDF? Let us know!
          </p>

          {/* Error Display */}
          {error && (
            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm md:text-base">
              <div className="font-semibold">Error:</div>
              <div>{error}</div>
            </div>
          )}

          {/* Success Display */}
          {success && (
            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-r-lg text-sm md:text-base">
              <div className="font-semibold">Success!</div>
              <div>{success}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Name Field - REQUIRED */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 md:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                style={{ fontSize: '16px' }}
                placeholder="Enter your full name"
                required
                disabled={loading}
              />
            </div>

            {/* Email Field - OPTIONAL */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 md:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                style={{ fontSize: '16px' }}
                placeholder="Enter your email address"
                disabled={loading}
              />
            </div>

            {/* Request Type - REQUIRED */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Request Type <span className="text-red-500">*</span>
              </label>
              <select
                name="requestType"
                value={formData.requestType}
                onChange={handleChange}
                className="w-full p-3 md:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                style={{ fontSize: '16px' }}
                required
                disabled={loading}
              >
                <option value="general">General Inquiry</option>
                <option value="pdf_request">PDF Request</option>
                <option value="quiz_suggestion">Quiz Suggestion</option>
                <option value="feedback">Feedback</option>
                <option value="bug_report">Bug Report</option>
                <option value="feature_request">Feature Request</option>
              </select>
            </div>

            {/* Message Field - OPTIONAL */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Message <span className="text-gray-500">(Optional)</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                className="w-full p-3 md:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base resize-none"
                style={{ fontSize: '16px' }}
                placeholder="Please describe your request in detail..."
                disabled={loading}
              />
            </div>

            {/* PDF Link Field - OPTIONAL */}
            <div>
              <label className="block text-sm font-medium mb-2">
                PDF Link <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="url"
                name="pdfLink"
                value={formData.pdfLink}
                onChange={handleChange}
                className="w-full p-3 md:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                style={{ fontSize: '16px' }}
                placeholder="https://example.com/your-pdf-link"
                disabled={loading}
              />
              <p className="text-sm text-gray-500 mt-1">
                If you're requesting a specific PDF or want to share a resource, paste the link here
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 md:py-5 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
              style={{ minHeight: '56px' }}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                '📤 Submit Request'
              )}
            </button>
          </form>

          {/* Guidelines */}
          <div className="mt-6 md:mt-8 p-3 md:p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2 text-sm md:text-base">📋 Guidelines:</h4>
            <ul className="text-xs md:text-sm text-gray-600 space-y-1">
              <li>• <strong>Name is required</strong> - please provide your full name</li>
              <li>• Email is optional but recommended for responses</li>
              <li>• For PDF requests, mention the exam name and type</li>
              <li>• We typically respond within 24-48 hours</li>
              <li>• All resources shared will be made free for everyone</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserRequestForm
