import React, { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiSearch, 
  FiCalendar, 
  FiExternalLink,
  FiEye,
  FiEyeOff,
  FiClock,
  FiBookOpen
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import ExamCalendarFormModal from './ExamCalendarFormModal'

function ExamCalendarManagement() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [filteredEvents, setFilteredEvents] = useState([])

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [searchTerm, events])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('form_fill_last_date', { ascending: true })

      if (error) {
        toast.error('Error fetching calendar events')
        console.error(error)
      } else {
        setEvents(data || [])
        setFilteredEvents(data || [])
      }
    } catch (error) {
      toast.error('Error loading events')
    } finally {
      setLoading(false)
    }
  }

  const filterEvents = () => {
    if (!searchTerm) {
      setFilteredEvents(events)
    } else {
      const filtered = events.filter(event => 
        event.exam_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredEvents(filtered)
    }
  }

  const handleDelete = async (event) => {
    if (!window.confirm(`Are you sure you want to delete "${event.exam_name}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', event.id)

      if (error) {
        toast.error('Error deleting event')
      } else {
        toast.success('Event deleted successfully')
        fetchEvents()
      }
    } catch (error) {
      toast.error('Error deleting event')
    }
  }

  const toggleStatus = async (event) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .update({ is_active: !event.is_active })
        .eq('id', event.id)

      if (error) {
        toast.error('Error updating status')
      } else {
        toast.success(`Event ${event.is_active ? 'deactivated' : 'activated'}`)
        fetchEvents()
      }
    } catch (error) {
      toast.error('Error updating status')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatMultipleDates = (datesData) => {
    if (!datesData) return 'N/A'
    
    try {
      // Handle if it's already an array
      if (Array.isArray(datesData)) {
        return datesData.map(date => formatDate(date)).join(', ')
      }
      
      // Handle if it's a JSON string
      if (typeof datesData === 'string') {
        const parsedDates = JSON.parse(datesData)
        return parsedDates.map(date => formatDate(date)).join(', ')
      }
      
      return 'N/A'
    } catch (error) {
      return 'N/A'
    }
  }

  const getStatusColor = (event) => {
    const today = new Date()
    const formFillDate = new Date(event.form_fill_last_date)
    
    if (!event.is_active) {
      return 'text-gray-500'
    } else if (formFillDate < today) {
      return 'text-red-600'
    } else {
      return 'text-green-600'
    }
  }

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Exam Calendar & Notifications</h1>
          <p className="text-gray-600">Add & Manage exam events and notifications</p>
        </div>
        
        <button
          onClick={() => {
            setEditingEvent(null)
            setShowForm(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <FiPlus size={20} />
          <span>Add New Exam</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search events by exam name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <FiCalendar className="text-blue-600 mr-3" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Total Exams Added</p>
                  <p className="text-2xl font-bold text-gray-800">{events.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <FiEye className="text-green-600 mr-3" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Active Events</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {events.filter(event => event.is_active).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <FiClock className="text-orange-600 mr-3" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Upcoming Exams</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {events.filter(event => {
                      const formFillDate = new Date(event.form_fill_last_date)
                      const today = new Date()
                      return formFillDate >= today && event.is_active
                    }).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <FiExternalLink className="text-purple-600 mr-3" size={24} />
                <div>
                  <p className="text-sm text-gray-600">With Notification URLs</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {events.filter(event => event.notification_url).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Events Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exam Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Form Fill Last Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prelims Exam Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mains Exam Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        {searchTerm ? 'No events found matching your search.' : 'No exams added yet. Click "Add New Exam" to get started.'}
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <FiBookOpen className="text-blue-600" size={20} />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {event.exam_name}
                              </p>
                              {event.description && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                  {event.description}
                                </p>
                              )}
                              {event.notification_url && (
                                <a 
                                  href={event.notification_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline flex items-center space-x-1 mt-1"
                                >
                                  <FiExternalLink size={12} />
                                  <span>Notification URL</span>
                                </a>
                              )}
                              <p className="text-xs text-gray-400 mt-1">
                                Created: {formatDate(event.created_at)}
                              </p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className={`text-sm font-medium ${getStatusColor(event)}`}>
                            {formatDate(event.form_fill_last_date)}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs">
                            {formatMultipleDates(event.prelims_exam_date)}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs">
                            {formatMultipleDates(event.mains_exam_date)}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleStatus(event)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              event.is_active 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            } transition-colors`}
                          >
                            {event.is_active ? <FiEye size={12} className="mr-1" /> : <FiEyeOff size={12} className="mr-1" />}
                            {event.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setEditingEvent(event)
                                setShowForm(true)
                              }}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                              title="Edit Event"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            
                            <button
                              onClick={() => handleDelete(event)}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title="Delete Event"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Form Modal */}
      {showForm && (
        <ExamCalendarFormModal
          event={editingEvent}
          onClose={() => {
            setShowForm(false)
            setEditingEvent(null)
          }}
          onSave={() => {
            setShowForm(false)
            setEditingEvent(null)
            fetchEvents()
          }}
        />
      )}
    </div>
  )
}

export default ExamCalendarManagement
