import React, { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'

const ExamCalendar = () => {
  const [examEvents, setExamEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchExamEvents()
  }, [])

  const fetchExamEvents = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('exam_calendar')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching exam events:', error)
    } else {
      setExamEvents(data || [])
    }
    setLoading(false)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const isUpcoming = (dateString) => {
    const examDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time for date comparison
    return examDate >= today
  }

  const getDaysUntilExam = (dateString) => {
    const examDate = new Date(dateString)
    const today = new Date()
    const diffTime = examDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getUpcomingExams = () => {
    const upcoming = []
    examEvents.forEach(event => {
      event.dates.forEach(date => {
        if (isUpcoming(date)) {
          upcoming.push({
            name: event.name,
            date: date,
            daysUntil: getDaysUntilExam(date)
          })
        }
      })
    })
    return upcoming.sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  const upcomingExams = getUpcomingExams()

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-gray-500">Loading exam calendar...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-4">📅 Exam Calendar</h2>
        <p className="text-gray-600">Stay updated with upcoming banking exam dates</p>
      </div>

      {/* Upcoming Exams Section */}
      {upcomingExams.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4 text-red-600">🔥 Upcoming Exams</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingExams.slice(0, 6).map((exam, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg shadow-lg border-l-4 ${
                  exam.daysUntil <= 7 
                    ? 'bg-red-50 border-red-500' 
                    : exam.daysUntil <= 30 
                    ? 'bg-yellow-50 border-yellow-500' 
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <h4 className="font-semibold text-gray-800 mb-2">{exam.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{formatDate(exam.date)}</p>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  exam.daysUntil <= 7 
                    ? 'bg-red-100 text-red-800' 
                    : exam.daysUntil <= 30 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {exam.daysUntil === 0 ? 'Today!' : 
                   exam.daysUntil === 1 ? 'Tomorrow' : 
                   `${exam.daysUntil} days left`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Exams List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-2xl font-bold mb-6">📋 All Scheduled Exams</h3>
        
        {examEvents.length === 0 ? (
          <div className="text-center p-8">
            <div className="text-6xl mb-4">📅</div>
            <h4 className="text-xl font-bold mb-2">No Exams Scheduled</h4>
            <p className="text-gray-600">Check back later for updates on upcoming exam dates.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {examEvents.map((event) => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-xl font-bold text-gray-800">{event.name}</h4>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {event.dates.length} date{event.dates.length > 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {event.dates.sort().map((date, index) => {
                    const upcoming = isUpcoming(date)
                    const daysLeft = getDaysUntilExam(date)
                    
                    return (
                      <div 
                        key={index}
                        className={`p-3 rounded-lg border ${
                          upcoming 
                            ? daysLeft <= 7 
                              ? 'bg-red-50 border-red-200 text-red-800' 
                              : 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-gray-50 border-gray-200 text-gray-500'
                        }`}
                      >
                        <div className="font-medium">{formatDate(date)}</div>
                        {upcoming && (
                          <div className="text-sm">
                            {daysLeft === 0 ? '🔥 Today!' : 
                             daysLeft === 1 ? '⏰ Tomorrow' : 
                             `📆 ${daysLeft} days left`}
                          </div>
                        )}
                        {!upcoming && (
                          <div className="text-sm">✅ Completed</div>
                        )}
                      </div>
                    )
                  })}
                </div>
                
                <div className="mt-4 text-sm text-gray-500">
                  Added: {new Date(event.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statistics */}
      {examEvents.length > 0 && (
        <div className="bg-gray-100 p-6 rounded-lg mt-8">
          <h3 className="text-lg font-bold mb-4">📊 Calendar Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{examEvents.length}</p>
              <p className="text-gray-600 text-sm">Total Exams</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{upcomingExams.length}</p>
              <p className="text-gray-600 text-sm">Upcoming</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {upcomingExams.filter(exam => exam.daysUntil <= 7).length}
              </p>
              <p className="text-gray-600 text-sm">This Week</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {examEvents.reduce((sum, event) => sum + event.dates.length, 0)}
              </p>
              <p className="text-gray-600 text-sm">Total Dates</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExamCalendar
