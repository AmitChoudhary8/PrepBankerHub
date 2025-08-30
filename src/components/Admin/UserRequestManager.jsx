import React, { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'

const UserRequestsManager = ({ onUpdate }) => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [responseText, setResponseText] = useState('')

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('user_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequests(data || [])
      onUpdate && onUpdate()
    } catch (error) {
      console.error('Error fetching requests:', error)
    }
    setLoading(false)
  }

  const updateRequestStatus = async (requestId, newStatus, adminResponse = null) => {
    try {
      const updateData = { 
        status: newStatus,
        updated_at: new Date()
      }
      
      if (adminResponse) {
        updateData.admin_response = adminResponse
      }

      const { error } = await supabase
        .from('user_requests')
        .update(updateData)
        .eq('id', requestId)

      if (error) throw error
      
      alert(`✅ Request ${newStatus} successfully!`)
      fetchRequests()
      setSelectedRequest(null)
      setResponseText('')
    } catch (error) {
      console.error('Error updating request:', error)
      alert('❌ Failed to update request')
    }
  }

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true
    return request.status === filter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'resolved': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">📝 User Requests Management</h2>
        <div className="text-center py-8">Loading requests...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
          <h2 className="text-xl font-bold mb-4 sm:mb-0">📝 User Requests Management</h2>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'approved', 'rejected', 'resolved'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={{ minHeight: '36px' }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status === 'pending' && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1">
                    {requests.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-gray-600">No requests found for "{filter}" status</p>
            </div>
          ) : (
            filteredRequests.map(request => (
              <div key={request.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-3 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">{request.name}</h3>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Email:</strong> {request.email || 'Not provided'}</p>
                      <p><strong>Type:</strong> {request.request_type}</p>
                      <p><strong>Date:</strong> {new Date(request.created_at).toLocaleDateString()}</p>
                      {request.message && (
                        <p><strong>Message:</strong> {request.message}</p>
                      )}
                      {request.pdf_link && (
                        <p><strong>PDF Link:</strong> 
                          <a href={request.pdf_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                            {request.pdf_link}
                          </a>
                        </p>
                      )}
                      {request.admin_response && (
                        <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-500">
                          <p><strong>Admin Response:</strong> {request.admin_response}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 lg:ml-4">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                      style={{ minHeight: '36px' }}
                    >
                      ✏️ Respond
                    </button>
                    
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateRequestStatus(request.id, 'approved')}
                          className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                          style={{ minHeight: '36px' }}
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => updateRequestStatus(request.id, 'rejected')}
                          className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                          style={{ minHeight: '36px' }}
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => updateRequestStatus(request.id, 'resolved')}
                      className="bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700"
                      style={{ minHeight: '36px' }}
                    >
                      ✔️ Resolve
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Response Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">📝 Respond to Request</h3>
            
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p><strong>From:</strong> {selectedRequest.name}</p>
              <p><strong>Message:</strong> {selectedRequest.message}</p>
            </div>
            
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Enter your response..."
              className="w-full p-3 border rounded-lg h-32 resize-none"
              style={{ fontSize: '16px' }}
            />
            
            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => updateRequestStatus(selectedRequest.id, 'resolved', responseText)}
                disabled={!responseText.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                style={{ minHeight: '44px' }}
              >
                Send & Resolve
              </button>
              <button
                onClick={() => {
                  setSelectedRequest(null)
                  setResponseText('')
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                style={{ minHeight: '44px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserRequestsManager
