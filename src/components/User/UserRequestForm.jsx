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
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required')
      return false
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }
    if (!formData.message.trim()) {
      setError('Message is required')
      return false
    }
    if (formData.pdfLink && !isValidURL(formData.pdfLink)) {
      setError('Please enter a valid PDF link')
      return false
    }
    return true
  }

  const isValidURL = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      const { error: submitError } = await supabase
        .from('user_requests')
        .insert([{
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
          pdf_link: formData.pdfLink.trim() || null,
          request_type: formData.requestType,
          status: 'pending'
        }])

      if (submitError) {
        setError('Failed to submit request. Please try again.')
      } else {
        setSuccess('✅ Your request has been submitted successfully! We will review it and get back to you soon.')
        // Reset form
        setFormData({
          name: user?.user_metadata?.name || '',
          email: user?.email || '',
          message: '',
          pdfLink: '',
          requestType: 'general'
        })
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    }
    
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">📝 Submit Your Request</h2>
        <p className="text-gray-600 text-center mb-8">
          Have a suggestion, feedback, or want to request a PDF? Let us know!
        </p>

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
              required
              disabled={loading}
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email address"
              required
              disabled={loading}
            />
          </div>

          {/* Request Type */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Request Type <span className="text-red-500">*</span>
            </label>
            <select
              name="requestType"
              value={formData.requestType}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
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

          {/* Message Field */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="5"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Please describe your request in detail..."
              required
              disabled={loading}
            />
          </div>

          {/* PDF Link Field */}
          <div>
            <label className="block text-sm font-medium mb-2">
              PDF Link <span className="text-gray-500">(Optional)</span>
            </label>
            <input
              type="url"
              name="pdfLink"
              value={formData.pdfLink}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Submitting...' : '📤 Submit Request'}
          </button>
        </form>

        {/* Guidelines */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">📋 Guidelines:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Please be specific and clear in your message</li>
            <li>• For PDF requests, mention the exam name and type</li>
            <li>• We typically respond within 24-48 hours</li>
            <li>• All resources shared will be made free for everyone</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default UserRequestForm
