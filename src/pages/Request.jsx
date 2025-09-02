import React, { useState } from 'react'
import { FiMessageSquare, FiUser, FiMail, FiSend, FiFileText } from 'react-icons/fi'
import { supabase } from '../utils/supabase'
import toast from 'react-hot-toast'

function Request({ user }) {
  const [formData, setFormData] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    request_type: 'pdf_request',
    subject: '',
    message: '',
    exam_type: 'SBI PO'
  })
  const [loading, setLoading] = useState(false)

  const requestTypes = [
    { value: 'pdf_request', label: 'Request PDF/Study Material' },
    { value: 'feedback', label: 'Website Feedback' },
    { value: 'suggestion', label: 'Suggestions' },
    { value: 'bug_report', label: 'Report Bug/Issue' },
    { value: 'other', label: 'Other' }
  ]

  const examTypes = [
    'SBI PO', 'SBI Clerk', 'IBPS PO', 'IBPS Clerk', 'RRB PO', 'RRB Clerk', 
    'Insurance', 'RBI Grade B', 'NABARD', 'Other'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('user_requests')
        .insert({
          user_id: user?.id || null,
          name: formData.name,
          email: formData.email,
          request_type: formData.request_type,
          subject: formData.subject,
          message: formData.message,
          exam_type: formData.exam_type,
          status: 'pending'
        })

      if (error) throw error

      toast.success('Request submitted successfully! We will get back to you soon.')
      
      // Reset form
      setFormData({
        name: user?.full_name || '',
        email: user?.email || '',
        request_type: 'pdf_request',
        subject: '',
        message: '',
        exam_type: 'SBI PO'
      })
    } catch (error) {
      console.error('Error submitting request:', error)
      toast.error('Failed to submit request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          <FiMessageSquare className="inline mr-3 text-blue-500" />
          Request Form
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Request specific study materials, provide feedback, or share suggestions to help us improve PrepBankerHub
        </p>
      </div>

      {/* Request Form */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                <FiUser className="inline mr-2" size={16} />
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                <FiMail className="inline mr-2" size={16} />
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Request Type */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Request Type *
            </label>
            <select
              name="request_type"
              value={formData.request_type}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
            >
              {requestTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Type (show only for PDF requests) */}
          {formData.request_type === 'pdf_request' && (
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Exam Type
              </label>
              <select
                name="exam_type"
                value={formData.exam_type}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {examTypes.map(exam => (
                  <option key={exam} value={exam}>
                    {exam}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Subject *
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of your request"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              <FiFileText className="inline mr-2" size={16} />
              Detailed Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Please provide detailed information about your request..."
              required
            />
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-primary text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
            >
              <FiSend size={18} />
              <span>{loading ? 'Submitting...' : 'Submit Request'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Information Cards */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <div className="text-blue-500 mb-3">
            <FiFileText size={32} className="mx-auto" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">PDF Requests</h3>
          <p className="text-gray-600 text-sm">
            Request specific study materials, practice sets, or previous year questions
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-6 text-center">
          <div className="text-green-500 mb-3">
            <FiMessageSquare size={32} className="mx-auto" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Feedback</h3>
          <p className="text-gray-600 text-sm">
            Share your experience and suggestions to help us improve our platform
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-6 text-center">
          <div className="text-purple-500 mb-3">
            <FiSend size={32} className="mx-auto" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Quick Response</h3>
          <p className="text-gray-600 text-sm">
            We typically respond to requests within 24-48 hours via email
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6 text-center">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Need immediate help?</h3>
        <p className="text-gray-600 mb-4">
          For urgent queries, you can also reach us directly at:
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6">
          <a 
            href="mailto:info.amitsihag@gmail.com"
            className="text-blue-600 hover:text-blue-800 flex items-center space-x-2"
          >
            <FiMail size={16} />
            <span>info.amitsihag@gmail.com</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default Request
