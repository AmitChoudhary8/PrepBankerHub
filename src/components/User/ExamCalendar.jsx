import React, { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'

const ExamCalendar = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('exam_calendar')
        .select('*')
        .order('exam_date', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching exam events:', error)
    }
    setLoading(false)
  }

  const filteredEvents = events.filter(event => {
    if (selectedCategory === 'all') return true
    return event.category === selectedCategory
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTimeUntilExam = (examDate) => {
    const now = new Date()
    const exam = new Date(examDate)
    const timeDiff = exam.getTime() - now.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
    
    if (daysDiff < 0) return 'Past'
    if (daysDiff === 0) return 'Today'
    if (daysDiff === 1) return 'Tomorrow'
    return `${daysDiff} days left`
  }

  const getStatusColor = (examDate) => {
    const now = new Date()
    const exam = new Date(examDate)
    const timeDiff = exam.getTime() - now.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
    
    if (daysDiff < 0) return 'bg-gray-100 text-gray-600'
    if (daysDiff <= 7) return 'bg-red-100 text-red-700'
    if (daysDiff <= 30) return 'bg-yellow-100 text-yellow-700'
    return 'bg-green-100 text-green-700'
  }

  if (loading) {
    return (
      <div className="p-2 md:p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">📅 Exam Calendar</h2>
          
          {/* Loading Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4 md:p-6 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="space-y-2 flex-1">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-8 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-2 md:p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">📅 Exam Calendar</h2>
        
        {/* Mobile-Friendly Filter */}
        <div className="bg-white p-3 md:p-4 rounded-lg shadow mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <label className="text-sm font-medium">Filter by Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto p-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{ fontSize: '16px' }}
            >
              <option value="all">All Exams</option>
              <option value="banking">Banking</option>
              <option value="ssc">SSC</option>
              <option value="railway">Railway</option>
              <option value="upsc">UPSC</option>
            </select>
          </div>
          
          <div className="mt-3 text-sm text-gray-600">
            {filteredEvents.length} exam{filteredEvents.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* No Events Found */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <div className="text-6xl md:text-8xl mb-4">📅</div>
            <h3 className="text-xl md:text-2xl font-bold mb-2">No Exams Found</h3>
            <p className="text-gray-600 text-sm md:text-base">
              {selectedCategory !== 'all' 
                ? 'Try selecting a different category' 
                : 'Check back later for upcoming exams!'}
            </p>
          </div>
        ) : (
          /* Mobile-Optimized Events List */
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0">
                  {/* Event Info */}
                  <div className="flex-1 pr-0 sm:pr-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg md:text-xl font-semibold text-gray-800 flex-1">
                        {event.exam_name || event.title}
                      </h3>
                      {event.category && (
                        <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-xs font-medium">
                          {event.category}
                        </span>
                      )}
                    </div>
                    
                    {event.description && (
                      <p className="text-sm md:text-base text-gray-600 mb-3">
                        {event.description}
                      </p>
                    )}
                    
                    <div className="text-sm text-gray-500 space-y-1">
                      <div className="flex items-center">
                        🗓️ <span className="ml-1">{formatDate(event.exam_date)}</span>
                      </div>
                      
                      {event.registration_deadline && (
                        <div className="flex items-center">
                          📝 <span className="ml-1">Registration: {formatDate(event.registration_deadline)}</span>
                        </div>
                      )}
                      
                      {event.application_fee && (
                        <div className="flex items-center">
                          💰 <span className="ml-1">Fee: ₹{event.application_fee}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Status Badge & Actions */}
                  <div className="flex flex-col items-start sm:items-end space-y-2">
                    <span className={`px-3 py-2 rounded-lg text-sm font-medium ${getStatusColor(event.exam_date)}`}>
                      {getTimeUntilExam(event.exam_date)}
                    </span>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      {event.registration_link && (
                        <button
                          onClick={() => window.open(event.registration_link, '_blank')}
                          className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-xs"
                          style={{ minHeight: '36px' }}
                        >
                          Apply Now
                        </button>
                      )}
                      
                      {event.notification_url && (
                        <button
                          onClick={() => window.open(event.notification_url, '_blank')}
                          className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-xs"
                          style={{ minHeight: '36px' }}
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Additional Info Bar - Mobile Optimized */}
                {(event.total_posts || event.age_limit || event.qualification) && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-600">
                      {event.total_posts && (
                        <div>👥 {event.total_posts} posts</div>
                      )}
                      {event.age_limit && (
                        <div>🎂 Age: {event.age_limit}</div>
                      )}
                      {event.qualification && (
                        <div>🎓 {event.qualification}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions - Mobile Only */}
        <div className="fixed bottom-4 left-4 right-4 sm:hidden">
          <div className="bg-white rounded-lg shadow-lg p-3 border">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {filteredEvents.length} exams
              </span>
              <div className="flex space-x-2">
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                >
                  ↑ Top
                </button>
                <button 
                  onClick={() => setSelectedCategory('all')}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-xs"
                >
                  All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExamCalendar
