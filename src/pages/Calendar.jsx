import React, { useState, useEffect } from 'react'
import { FiClock, FiExternalLink, FiSearch } from 'react-icons/fi'
import { supabase } from '../utils/supabase'
import toast from 'react-hot-toast'

function Calendar({ user }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('is_active', true)
        .order('form_fill_last_date', { ascending: true })
      
      if (error) throw error
      setEvents(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error loading events:', error)
      toast.error('Failed to load calendar events')
      setLoading(false)
    }
  }

  // Calculate days remaining or status
  const getDaysRemaining = (dateString) => {
    const today = new Date()
    const targetDate = new Date(dateString)
    const diffTime = targetDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return { text: 'Expired', color: 'text-red-600', bgColor: 'bg-red-100' }
    } else if (diffDays === 0) {
      return { text: 'Today', color: 'text-orange-600', bgColor: 'bg-orange-100' }
    } else if (diffDays === 1) {
      return { text: 'Tomorrow', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    } else if (diffDays <= 7) {
      return { text: `${diffDays} days`, color: 'text-red-600', bgColor: 'bg-red-100' }
    } else if (diffDays <= 30) {
      return { text: `${diffDays} days`, color: 'text-orange-600', bgColor: 'bg-orange-100' }
    } else {
      return { text: `${diffDays} days`, color: 'text-green-600', bgColor: 'bg-green-100' }
    }
  }

  // Format date for display
  const formatDisplayDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Format multiple dates
  const formatMultipleDates = (datesArray) => {
    try {
      if (Array.isArray(datesArray)) {
        return datesArray.map(date => formatDisplayDate(date)).join(', ')
      } else if (typeof datesArray === 'string') {
        const parsedDates = JSON.parse(datesArray)
        return parsedDates.map(date => formatDisplayDate(date)).join(', ')
      }
      return 'N/A'
    } catch (error) {
      return 'N/A'
    }
  }

  // Get first date from array for countdown calculation
  const getFirstDate = (datesArray) => {
    try {
      if (Array.isArray(datesArray)) {
        return datesArray[0]
      } else if (typeof datesArray === 'string') {
        const parsedDates = JSON.parse(datesArray)
        return parsedDates[0]
      }
      return null
    } catch (error) {
      return null
    }
  }

  const filteredEvents = searchTerm
    ? events.filter(event => 
        event.exam_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : events

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      
      {/* Page Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          <FiClock className="inline mr-2 text-blue-500" />
          Exam Calendar & Notifications
        </h1>
      </div>

      {/* Search Bar */}
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search Exams"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <>
          {/* Mobile Layout - Single column */}
          <div className="md:hidden space-y-4">
            {filteredEvents.map(event => {
              const formDays = getDaysRemaining(event.form_fill_last_date)
              const prelimsFirstDate = getFirstDate(event.prelims_exam_date)
              const mainsFirstDate = getFirstDate(event.mains_exam_date)
              const prelimsDays = prelimsFirstDate ? getDaysRemaining(prelimsFirstDate) : { text: 'N/A', color: 'text-gray-500', bgColor: 'bg-gray-100' }
              const mainsDays = mainsFirstDate ? getDaysRemaining(mainsFirstDate) : { text: 'N/A', color: 'text-gray-500', bgColor: 'bg-gray-100' }

              return (
                <div key={event.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                  
                  {/* Exam Name */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-800">{event.exam_name}</h3>
                    <FiClock className="text-blue-500" size={20} />
                  </div>

                  {/* Description */}
                  {event.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
                  )}

                  {/* Event Details with Countdown */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <div>
                        <span className="text-gray-600 text-sm">Form Fill Last Date:</span>
                        <div className="font-medium">{formatDisplayDate(event.form_fill_last_date)}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${formDays.color} ${formDays.bgColor}`}>
                        {formDays.text}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <div>
                        <span className="text-gray-600 text-sm">Prelims Exam Dates:</span>
                        <div className="font-medium text-xs">{formatMultipleDates(event.prelims_exam_date)}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${prelimsDays.color} ${prelimsDays.bgColor}`}>
                        {prelimsDays.text}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <div>
                        <span className="text-gray-600 text-sm">Mains Exam Dates:</span>
                        <div className="font-medium text-xs">{formatMultipleDates(event.mains_exam_date)}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${mainsDays.color} ${mainsDays.bgColor}`}>
                        {mainsDays.text}
                      </span>
                    </div>
                  </div>

                  {/* Notification URL */}
                  {event.notification_url && (
                    <a
                      href={event.notification_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 text-sm"
                    >
                      <FiExternalLink size={16} />
                      <span>Notification URL</span>
                    </a>
                  )}
                </div>
              )
            })}
          </div>

          {/* Desktop Layout - 4 columns */}
          <div className="hidden md:grid grid-cols-4 gap-6">
            {filteredEvents.map(event => {
              const formDays = getDaysRemaining(event.form_fill_last_date)
              const prelimsFirstDate = getFirstDate(event.prelims_exam_date)
              const mainsFirstDate = getFirstDate(event.mains_exam_date)
              const prelimsDays = prelimsFirstDate ? getDaysRemaining(prelimsFirstDate) : { text: 'N/A', color: 'text-gray-500', bgColor: 'bg-gray-100' }
              const mainsDays = mainsFirstDate ? getDaysRemaining(mainsFirstDate) : { text: 'N/A', color: 'text-gray-500', bgColor: 'bg-gray-100' }

              return (
                <div key={event.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                  
                  {/* Exam Name with Clock */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-800 line-clamp-1">{event.exam_name}</h3>
                    <FiClock className="text-blue-500" size={16} />
                  </div>

                  {/* Description */}
                  {event.description && (
                    <p className="text-gray-600 text-xs mb-3 line-clamp-2">{event.description}</p>
                  )}

                  {/* Event Details with Countdown */}
                  <div className="space-y-2 mb-4">
                    <div className="p-2 rounded bg-gray-50">
                      <div className="text-xs text-gray-600 mb-1">Form Fill Last Date</div>
                      <div className="text-xs font-medium mb-1">{formatDisplayDate(event.form_fill_last_date)}</div>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${formDays.color} ${formDays.bgColor}`}>
                        {formDays.text}
                      </span>
                    </div>

                    <div className="p-2 rounded bg-gray-50">
                      <div className="text-xs text-gray-600 mb-1">Prelims Exam Dates</div>
                      <div className="text-xs font-medium mb-1 line-clamp-2">{formatMultipleDates(event.prelims_exam_date)}</div>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${prelimsDays.color} ${prelimsDays.bgColor}`}>
                        {prelimsDays.text}
                      </span>
                    </div>

                    <div className="p-2 rounded bg-gray-50">
                      <div className="text-xs text-gray-600 mb-1">Mains Exam Dates</div>
                      <div className="text-xs font-medium mb-1 line-clamp-2">{formatMultipleDates(event.mains_exam_date)}</div>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${mainsDays.color} ${mainsDays.bgColor}`}>
                        {mainsDays.text}
                      </span>
                    </div>
                  </div>

                  {/* Notification URL */}
                  {event.notification_url && (
                    <a
                      href={event.notification_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-blue-500 text-white py-2 px-3 rounded font-medium hover:bg-blue-600 transition-colors text-xs flex items-center justify-center space-x-1"
                    >
                      <FiExternalLink size={12} />
                      <span>Notification URL</span>
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <FiClock size={64} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            No exams found
          </h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try different search terms' : 'Check back later for upcoming exam notifications'}
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
          Quick Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {events.filter(e => getDaysRemaining(e.form_fill_last_date).text.includes('Expired')).length}
            </div>
            <div className="text-sm text-gray-600">Forms Expired</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {events.filter(e => {
                const days = getDaysRemaining(e.form_fill_last_date).text
                return days.includes('days') && parseInt(days) <= 7
              }).length}
            </div>
            <div className="text-sm text-gray-600">Urgent (≤7 days)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {events.filter(e => {
                const days = getDaysRemaining(e.form_fill_last_date).text
                return days.includes('days') && parseInt(days) > 7
              }).length}
            </div>
            <div className="text-sm text-gray-600">Coming Soon</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Calendar
