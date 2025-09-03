import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiUser, FiMail, FiClock, FiCheckCircle, FiEye, FiEdit3, FiSend, FiSearch, FiRefreshCw } from 'react-icons/fi';
import supabase from '../../utils/supabase'; // Fixed import path - removed brackets
import toast from 'react-hot-toast';

function RequestReview() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [response, setResponse] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchRequestId, setSearchRequestId] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('user_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      setRequests(data || []);
      console.log('Fetched requests:', data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  // Search by Request ID
  const searchByRequestId = async () => {
    if (!searchRequestId || searchRequestId.length !== 5) {
      toast.error('Please enter a valid 5-digit Request ID');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_requests')
        .select('*')
        .eq('request_id', searchRequestId);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setRequests(data);
        toast.success('Request found!');
      } else {
        toast.error('No request found with this ID');
        setRequests([]);
      }
    } catch (error) {
      console.error('Error searching request:', error);
      toast.error('Error searching request');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId, newStatus, adminResponse = null) => {
    try {
      const updateData = { status: newStatus };
      if (adminResponse) {
        updateData.admin_response = adminResponse;
      }

      const { error } = await supabase
        .from('user_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;
      
      toast.success(`Request ${newStatus} successfully`);
      fetchRequests();
      setSelectedRequest(null);
      setResponse('');
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    }
  };

  const handleResponse = async (e) => {
    e.preventDefault();
    if (!response.trim()) {
      toast.error('Please enter a response');
      return;
    }
    
    await updateRequestStatus(selectedRequest.id, 'completed', response);
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
    <div className="p-6">
      {/* Header with filters and search */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800">User Requests & Suggestions</h2>
        
        <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-4">
          {/* Search by Request ID */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={searchRequestId}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                setSearchRequestId(value);
              }}
              placeholder="Search by Request ID"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={5}
            />
            <button
              onClick={searchByRequestId}
              disabled={loading || searchRequestId.length !== 5}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <FiSearch size={16} />
              <span>Search</span>
            </button>
          </div>

          {/* Filter dropdown */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setSearchRequestId(''); // Clear search when changing filter
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Requests</option>
            <option value="review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
          </select>

          {/* Refresh button */}
          <button
            onClick={fetchRequests}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <FiRefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading requests...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              
              {/* Header */}
              <div className="flex flex-col lg:flex-row justify-between items-start mb-4 space-y-2 lg:space-y-0">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{request.subject}</h3>
                  <div className="flex flex-wrap items-center text-sm text-gray-600 space-x-4">
                    <span className="flex items-center">
                      <FiUser size={14} className="mr-1" />
                      {request.name}
                    </span>
                    <span className="flex items-center">
                      <FiMail size={14} className="mr-1" />
                      {request.email}
                    </span>
                    <span>{new Date(request.created_at).toLocaleDateString()}</span>
                    {request.request_id && (
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                        ID: {request.request_id}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  <span className="ml-1">{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
                </div>
              </div>

              {/* Request Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Request Type:</span>
                  <p className="text-gray-800">{request.request_type.replace('_', ' ').toUpperCase()}</p>
                </div>
                
                {request.exam_type && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Exam Type:</span>
                    <p className="text-gray-800">{request.exam_type}</p>
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-500">Message:</span>
                <p className="text-gray-800 mt-1">{request.message}</p>
              </div>

              {/* Admin Response */}
              {request.admin_response && (
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <span className="text-sm font-medium text-blue-800">Admin Response:</span>
                  <p className="text-blue-700 mt-1">{request.admin_response}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {request.status === 'review' && (
                  <>
                    <button
                      onClick={() => updateRequestStatus(request.id, 'approved')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <FiCheckCircle size={16} />
                      <span>Approve</span>
                    </button>
                    
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <FiEdit3 size={16} />
                      <span>Reply & Complete</span>
                    </button>
                  </>
                )}
                
                {request.status === 'approved' && (
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <FiSend size={16} />
                    <span>Send Response</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {requests.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <FiMessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No requests found.</p>
              {searchRequestId && (
                <button
                  onClick={() => {
                    setSearchRequestId('');
                    setFilterStatus('all');
                    fetchRequests();
                  }}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Show all requests
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Response Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Send Response</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">To: {selectedRequest.email}</p>
              <p className="text-sm text-gray-600 mb-1">Subject: {selectedRequest.subject}</p>
              {selectedRequest.request_id && (
                <p className="text-sm text-gray-600">Request ID: {selectedRequest.request_id}</p>
              )}
            </div>
            
            <form onSubmit={handleResponse}>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Enter your response..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                required
              />
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <FiSend size={16} />
                  <span>Send & Complete</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRequest(null);
                    setResponse('');
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RequestReview;
