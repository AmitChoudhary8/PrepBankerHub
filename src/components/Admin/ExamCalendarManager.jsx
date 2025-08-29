import React, { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'

const ExamCalendarManager = () => {
  const [exams, setExams] = useState([])
  const [currentExam, setCurrentExam] = useState({
    name: '',
    dates: []
  })
  const [newDate, setNewDate] = useState('')
  const [editingExam, setEditingExam] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('exam_calendar')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching exams:', error)
    } else {
      setExams(data || [])
    }
    setLoading(false)
  }

  const handleExamNameChange = (e) => {
    setCurrentExam({ ...currentExam, name: e.target.value })
  }

  const addDate = () => {
    if (newDate && !currentExam.dates.includes(newDate)) {
      setCurrentExam({
        ...currentExam,
        dates: [...currentExam.dates, newDate]
      })
      setNewDate('')
    }
  }

  const removeDate = (dateToRemove) => {
    setCurrentExam({
      ...currentExam,
      dates: currentExam.dates.filter(date => date !== dateToRemove)
    })
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addDate()
    }
  }

  const saveExam = async () => {
    if (!currentExam.name.trim()) {
      alert('Please enter exam name')
      return
    }
    
    if (currentExam.dates.length === 0) {
      alert('Please add at least one exam date')
      return
    }

    setLoading(true)

    try {
      if (editingExam) {
        // Update existing exam
        const { error } = await supabase
          .from('exam_calendar')
          .update({
            name: currentExam.name.trim(),
            dates: currentExam.dates,
            updated_at: new Date()
          })
          .eq('id', editingExam.id)

        if (error) {
          alert('Error updating exam: ' + error.message)
        } else {
          alert('✅ Exam updated successfully!')
          resetForm()
        }
      } else {
        // Add new exam
        const { error } = await supabase
          .from('exam_calendar')
          .insert([{
            name: currentExam.name.trim(),
            dates: currentExam.dates
          }])

        if (error) {
          alert('Error adding exam: ' + error.message)
        } else {
          alert('✅ Exam added successfully!')
          resetForm()
        }
      }
      
      fetchExams()
    } catch (error) {
      alert('Unexpected error: ' + error.message)
    }
    
    setLoading(false)
  }

  const startEditing = (exam) => {
    setEditingExam(exam)
    setCurrentExam({
      name: exam.name,
      dates: [...exam.dates] // Create a copy
    })
  }

  const deleteExam = async (examId) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      const { error } = await supabase
        .from('exam_calendar')
        .delete()
        .eq('id', examId)

      if (error) {
        alert('Error deleting exam: ' + error.message)
      } else {
        alert('Exam deleted successfully!')
        fetchExams()
      }
    }
  }

  const resetForm = () => {
    setCurrentExam({ name: '', dates: [] })
    setNewDate('')
    setEditingExam(null)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">📅 Exam Calendar Management</h2>
        {editingExam && (
          <button
            onClick={resetForm}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Cancel Edit
          </button>
        )}
      </div>

      {/* Add/Edit Exam Form */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-xl font-bold mb-4">
          {editingExam ? '✏️ Edit Exam' : '➕ Add New Exam'}
        </h3>

        {/* Exam Name Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Exam Name</label>
          <input
            type="text"
            value={currentExam.name}
            onChange={handleExamNameChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., SBI PO Mains 2025"
            disabled={loading}
          />
        </div>

        {/* Add Date Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Add Exam Date</label>
          <div className="flex gap-3">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              onClick={addDate}
              disabled={!newDate || loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Add Date
            </button>
          </div>
        </div>

        {/* Added Dates Display */}
        {currentExam.dates.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">Added Dates:</label>
            <div className="flex flex-wrap gap-2">
              {currentExam.dates.sort().map((date) => (
                <div
                  key={date}
                  className="flex items-center bg-blue-100 text-blue-800 px-3 py-2 rounded-full"
                >
                  <span className="mr-2">{formatDate(date)}</span>
                  <button
                    onClick={() => removeDate(date)}
                    className="text-blue-600 hover:text-blue-800 font-bold"
                    disabled={loading}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={saveExam}
            disabled={loading || !currentExam.name.trim() || currentExam.dates.length === 0}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Saving...' : editingExam ? '✏️ Update Exam' : '📅 Publish Exam'}
          </button>
          
          {!editingExam && currentExam.name && (
            <button
              onClick={resetForm}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
            >
              Clear Form
            </button>
          )}
        </div>
      </div>

      {/* Existing Exams List */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4">📋 Published Exams</h3>
        
        {loading ? (
          <div className="text-center p-8">
            <p className="text-gray-500">Loading exams...</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-gray-500">No exams added yet. Add your first exam above!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      {exam.name}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {exam.dates.sort().map((date) => (
                        <span
                          key={date}
                          className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          📅 {formatDate(date)}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Added: {new Date(exam.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => startEditing(exam)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 text-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deleteExam(exam.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      {exams.length > 0 && (
        <div className="bg-gray-100 p-4 rounded-lg mt-6 text-center">
          <p className="text-gray-700">
            📊 Total Exams: <strong>{exams.length}</strong> | 
            Total Exam Dates: <strong>{exams.reduce((sum, exam) => sum + exam.dates.length, 0)}</strong>
          </p>
        </div>
      )}
    </div>
  )
}

export default ExamCalendarManager
