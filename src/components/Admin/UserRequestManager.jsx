import React, { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'

const UserRequestManager = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchRequests()
  }, [filterStatus])

  const fetchRequests = async () => {
    setLoading(true)
    
    let query = supabase.from('user_requests').select('*')
    
    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching requests:', error)
    } else {
      setRequests(data || [])
    }
    setLoading(false)
  }

  const updateRequestStatus = async (requestId, newStatus, adminResponse = '') => {
    const { error } = await supabase
      .from('user_requests')
      .update({ 
        status: newStatus, 
        admin_response: adminResponse || null,
        updated_at: new Date()
      })
      .eq('id', requestId)
    
    if (error) {
      alert('Error updating request status')
    } else {
      alert(`Request ${newStatus} successfully!`)
      fetchRequests()
    }
  }

  const deleteRequest = async (requestId) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      const { error } = await supabase
        .from('user_requests')
        .delete()
        .eq('id', requestId)
      
      if (error) {
        alert('Error deleting request')
      } else {
        alert('Request deleted successfully!')
        fetchRequests()
      }
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'in_review': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      {/* Filter Controls */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 border rounded-lg"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="in_review">In Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="text-sm text-gray-600">
          Total Requests: {requests.length}
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="text-center p-8">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500">No requests found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(request => (
            <div key={request.id} className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">{request.name}</h3>
                  <p className="text-gray-600">{request.email}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(request.created_at)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                    {request.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                    {request.request_type}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">Message:</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded">{request.message}</p>
              </div>

              {request.pdf_link && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">PDF Link:</h4>
                  <a 
                    href={request.pdf_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {request.pdf_link}
                  </a>
                </div>
              )}

              {request.admin_response && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Admin Response:</h4>
                  <p className="text-gray-700 bg-blue-50 p-3 rounded">{request.admin_response}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {request.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateRequestStatus(request.id, 'in_review')}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Mark as In Review
                    </button>
                    <button
                      onClick={() => {
                        const response = prompt('Enter response (optional):')
                        updateRequestStatus(request.id, 'approved', response)
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const response = prompt('Enter rejection reason:')
                        if (response) updateRequestStatus(request.id, 'rejected', response)
                      }}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
                )}
                
                {request.status === 'in_review' && (
                  <>
                    <button
                      onClick={() => {
                        const response = prompt('Enter response (optional):')
                        updateRequestStatus(request.id, 'approved', response)
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const response = prompt('Enter rejection reason:')
                        if (response) updateRequestStatus(request.id, 'rejected', response)
                      }}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
                )}

                <button
                  onClick={() => deleteRequest(request.id)}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UserRequestManager
