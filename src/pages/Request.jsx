import React, { useState } from 'react';
import { FiMessageSquare, FiUser, FiMail, FiSend, FiFileText, FiClock, FiCheckCircle, FiEye, FiSearch, FiCopy } from 'react-icons/fi';
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
  const [generatedRequestId, setGeneratedRequestId] = useState('');
  const [showRequestId, setShowRequestId] = useState(false);
  
  // Check Request Status states
  const [checkRequestId, setCheckRequestId] = useState('');
  const [requestStatus, setRequestStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const requestTypes = [
    { value: 'pdf_request', label: 'Request PDF/Study Material' },
    { value: 'feedback', label: 'Website Feedback' },
    { value: 'suggestion', label: 'Suggestions' },
    { value: 'bug_report', label: 'Report Bug/Issue' },
    { value: 'other', label: 'Other' }
  ];

  const examTypes = ['SBI PO', 'SBI Clerk', 'IBPS PO', 'IBPS Clerk', 'RRB PO', 'RRB Clerk', 'Insurance', 'RBI Grade B', 'NABARD', 'Other'];

  // Generate 5-digit random Request ID
  const generateRequestId = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    // Generate unique 5-digit Request ID
    const requestId = generateRequestId();
    
    const insertData = {
      request_id: requestId,
      user_id: user?.id || null,
      name: formData.name,
      email: formData.email,
      request_type: formData.requesttype,
      subject: formData.subject,
      message: formData.message,
      exam_type: formData.requesttype === 'pdf_request' ? formData.examtype : null,
      status: 'review',
      admin_response: null
    };

    try {
      const { data, error } = await supabase
        .from('user_requests')
        .insert(insertData)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        toast.error(`Failed to submit request: ${error.message}`);
        return;
      }

      console.log('Request submitted successfully:', data);
      
      // Show success message and Request ID
      setGeneratedRequestId(requestId);
      setShowRequestId(true);
      toast.success('Request submitted successfully!');

      // Reset form
      setFormData({
        name: user?.full_name || '',
        email: user?.email || '',
        requesttype: 'pdf_request',
        subject: '',
        message: '',
        examtype: 'SBI PO'
      });

    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check Request Status Function
  const checkStatus = async () => {
    if (!checkRequestId || checkRequestId.length !== 5) {
      toast.error('Please enter a valid 5-digit Request ID');
      return;
    }

    setLoadingStatus(true);
    try {
      const { data, error } = await supabase
        .from('user_requests')
        .select('*')
        .eq('request_id', checkRequestId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error('Request ID not found. Please check and try again.');
          setRequestStatus(null);
        } else {
          toast.error('Error checking status. Please try again.');
        }
        return;
      }

      setRequestStatus(data);
      toast.success('Request found!');
    } catch (error) {
      console.error('Error checking status:', error);
      toast.error('Error checking status. Please try again.');
    } finally {
      setLoadingStatus(false);
    }
  };

  const copyRequestId = (id) => {
    navigator.clipboard.writeText(id);
    toast.success('Request ID copied to clipboard!');
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
      {/* Show Request ID after submission */}
      {showRequestId && (
        <div className="mb-8 bg-green-50 border-2 border-green-200 rounded-xl p-6">
          <div className="text-center">
            <div className="mb-4">
              <FiCheckCircle className="text-green-500 mx-auto mb-2" size={48} />
              <h3 className="text-xl font-bold text-green-800 mb-2">Request Submitted Successfully!</h3>
              <p className="text-green-700">Your Request ID is:</p>
            </div>
            
            <div className="bg-white border-2 border-green-300 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center space-x-3">
                <span className="text-3xl font-mono font-bold text-green-800">{generatedRequestId}</span>
                <button
                  onClick={() => copyRequestId(generatedRequestId)}
                  className="p-2 bg-green-100 hover:bg-green-200 rounded-lg text-green-600 transition-colors"
                  title="Copy Request ID"
                >
                  <FiCopy size={20} />
                </button>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Please save this Request ID to check your request status later.
              </p>
            </div>
            
            <button
              onClick={() => setShowRequestId(false)}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Continue
            </button>
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
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
            >
              <FiSend size={18} />
              <span>{loading ? 'Submitting...' : 'Submit Request'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Check Request Status Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
          <FiSearch className="inline mr-2" size={24} />
          Check Request Status
        </h3>
        
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Enter Your Request ID
            </label>
            <input
              type="text"
              value={checkRequestId}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                setCheckRequestId(value);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-mono"
              placeholder="12345"
              maxLength={5}
            />
            <p className="text-xs text-gray-500 mt-1 text-center">
              Enter the 5-digit Request ID you received after submission
            </p>
          </div>
          
          <button
            onClick={checkStatus}
            disabled={loadingStatus || checkRequestId.length !== 5}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <FiSearch size={18} />
            <span>{loadingStatus ? 'Checking...' : 'Check Status'}</span>
          </button>
        </div>

        {/* Display Request Status */}
        {requestStatus && (
          <div className="mt-6 bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-semibold text-gray-800 text-lg">{requestStatus.subject}</h4>
              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(requestStatus.status)}`}>
                {getStatusIcon(requestStatus.status)}
                <span className="ml-1">{requestStatus.status.charAt(0).toUpperCase() + requestStatus.status.slice(1)}</span>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div><strong>Request ID:</strong> {requestStatus.request_id}</div>
              <div><strong>Name:</strong> {requestStatus.name}</div>
              <div><strong>Email:</strong> {requestStatus.email}</div>
              <div><strong>Type:</strong> {requestStatus.request_type.replace('_', ' ').toUpperCase()}</div>
              {requestStatus.exam_type && <div><strong>Exam:</strong> {requestStatus.exam_type}</div>}
              <div><strong>Submitted:</strong> {new Date(requestStatus.created_at).toLocaleDateString()}</div>
            </div>
            
            <div className="mt-4">
              <strong className="text-gray-700">Message:</strong>
              <p className="mt-1 text-gray-600">{requestStatus.message}</p>
            </div>
            
            {requestStatus.admin_response && (
              <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                <strong className="text-blue-800">Admin Response:</strong>
                <p className="mt-1 text-blue-700">{requestStatus.admin_response}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
