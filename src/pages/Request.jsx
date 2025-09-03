import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiUser, FiMail, FiSend, FiFileText, FiClock, FiCheckCircle, FiEye, FiAlertCircle } from 'react-icons/fi';
import supabase from '../utils/supabase';
import toast from 'react-hot-toast';

function Request({ user }) {
  const [formData, setFormData] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    requesttype: 'pdf_request',
    subject: '',
    message: '',
    examtype: 'SBI PO'
  });
  
  const [loading, setLoading] = useState(false);
  const [userRequests, setUserRequests] = useState([]);
  const [debugInfo, setDebugInfo] = useState(null);

  const requestTypes = [
    { value: 'pdf_request', label: 'Request PDF/Study Material' },
    { value: 'feedback', label: 'Website Feedback' },
    { value: 'suggestion', label: 'Suggestions' },
    { value: 'bug_report', label: 'Report Bug/Issue' },
    { value: 'other', label: 'Other' }
  ];

  const examTypes = ['SBI PO', 'SBI Clerk', 'IBPS PO', 'IBPS Clerk', 'RRB PO', 'RRB Clerk', 'Insurance', 'RBI Grade B', 'NABARD', 'Other'];

  // Fetch user's previous requests
  useEffect(() => {
    if (formData.email) {
      fetchUserRequests();
    }
  }, [formData.email]);

  const fetchUserRequests = async () => {
    try {
      console.log('Fetching user requests for:', formData.email);
      const { data, error } = await supabase
        .from('user_requests')
        .select('*')
        .eq('email', formData.email)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching user requests:', error);
        throw error;
      }
      
      console.log('Fetched user requests:', data);
      setUserRequests(data || []);
    } catch (error) {
      console.error('Catch: Error fetching user requests:', error);
      setDebugInfo({
        action: 'fetch_requests',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous debug info
    setDebugInfo(null);
    
    console.log('Form submission started with data:', formData);

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill all required fields');
      console.log('Validation failed: Missing required fields');
      return;
    }

    setLoading(true);

    // Generate email-based user ID
    const emailBasedUserId = btoa(formData.email + Date.now()).substring(0, 16);
    
    // Prepare insert data
    const insertData = {
      user_id: user?.id || emailBasedUserId, // Use authenticated user ID or generate one
      name: formData.name,
      email: formData.email,
      request_type: formData.requesttype,
      subject: formData.subject,
      message: formData.message,
      exam_type: formData.requesttype === 'pdf_request' ? formData.examtype : null,
      status: 'review', // Changed from 'pending' to 'review'
      admin_response: null
    };

    console.log('Inserting data:', insertData);

    try {
      const { data, error } = await supabase
        .from('user_requests')
        .insert(insertData)
        .select();

      console.log('Supabase response - Data:', data);
      console.log('Supabase response - Error:', error);

      if (error) {
        console.error('Supabase Insert Error Details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error
        });
        
        setDebugInfo({
          action: 'insert_request',
          error: error.message || 'Unknown Supabase error',
          details: error.details || 'No details available',
          code: error.code || 'No code',
          hint: error.hint || 'No hint',
          timestamp: new Date().toISOString(),
          insertData: insertData
        });

        // Show specific error messages based on error code
        if (error.code === '42501') {
          toast.error('Permission denied. Please check table policies or try logging in again.');
        } else if (error.code === '23505') {
          toast.error('Duplicate entry. This request may already exist.');
        } else {
          toast.error(`Failed to submit request: ${error.message}`);
        }
        
        setLoading(false);
        return;
      }

      console.log('Request submitted successfully:', data);
      toast.success('Request submitted successfully! We will review it soon.');
      
      // Store tracking ID for future reference
      if (!user?.id) {
        localStorage.setItem('user_tracking_id', emailBasedUserId);
      }

      // Reset form
      setFormData({
        name: user?.full_name || '',
        email: user?.email || '',
        requesttype: 'pdf_request',
        subject: '',
        message: '',
        examtype: 'SBI PO'
      });

      // Refresh user requests
      fetchUserRequests();

    } catch (error) {
      console.error('Handle Submit Catch Error Details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        fullError: error
      });
      
      setDebugInfo({
        action: 'submit_catch',
        error: error.message || 'Unknown catch error',
        name: error.name || 'No name',
        timestamp: new Date().toISOString(),
        insertData: insertData
      });
      
      toast.error(`Failed to submit request. Error: ${error.message || JSON.stringify(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'review':
        return <FiEye className="text-orange-500" size={16} />;
      case 'approved':
        return <FiCheckCircle className="text-green-500" size={16} />;
      case 'completed':
        return <FiCheckCircle className="text-blue-500" size={16} />;
      default:
        return <FiClock className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'review':
        return 'bg-orange-100 text-orange-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Debug Information Panel - Only show in development or when there's an error */}
      {debugInfo && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <FiAlertCircle className="text-red-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
            <div className="flex-1">
              <h4 className="font-semibold text-red-800 mb-2">Debug Information</h4>
              <div className="text-sm text-red-700 space-y-1">
                <p><strong>Action:</strong> {debugInfo.action}</p>
                <p><strong>Error:</strong> {debugInfo.error}</p>
                {debugInfo.code && <p><strong>Code:</strong> {debugInfo.code}</p>}
                {debugInfo.details && <p><strong>Details:</strong> {debugInfo.details}</p>}
                {debugInfo.hint && <p><strong>Hint:</strong> {debugInfo.hint}</p>}
                <p><strong>Timestamp:</strong> {debugInfo.timestamp}</p>
                {debugInfo.insertData && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium">Insert Data</summary>
                    <pre className="mt-1 text-xs bg-red-100 p-2 rounded overflow-auto">
                      {JSON.stringify(debugInfo.insertData, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                <FiUser className="inline mr-2" size={16} />
                Full Name
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
                Email Address
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
              Request Type
            </label>
            <select
              name="requesttype"
              value={formData.requesttype}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
            >
              {requestTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Type (show only for PDF requests) */}
          {formData.requesttype === 'pdf_request' && (
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Exam Type
              </label>
              <select
                name="examtype"
                value={formData.examtype}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              >
                {examTypes.map((exam) => (
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
              Subject
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
              Detailed Message
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

      {/* Previous Requests */}
      {userRequests.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Your Recent Requests</h3>
          <div className="space-y-4">
            {userRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800">{request.subject}</h4>
                  <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                    <span className="ml-1">{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-2">{request.message.substring(0, 100)}...</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Type: {request.request_type.replace('_', ' ').toUpperCase()}</span>
                  <span>{new Date(request.created_at).toLocaleDateString()}</span>
                </div>
                
                {request.admin_response && (
                  <div className="mt-3 bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Admin Response:</p>
                    <p className="text-sm text-blue-700">{request.admin_response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
          For urgent queries, you can also reach us directly at
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
  );
}

export default Request;
