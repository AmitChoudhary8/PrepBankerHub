import React, { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
import { FiX, FiPlus, FiMinus, FiCalendar } from 'react-icons/fi'
import toast from 'react-hot-toast'

function ExamCalendarFormModal({ event, onClose, onSave }) {
  const [formData, setFormData] = useState({
    exam_name: '',
    description: '',
    form_fill_last_date: '',
    prelims_exam_dates: [''], // Array for multiple dates
    mains_exam_dates: [''],   // Array for multiple dates
    notification_url: '',
    is_active: true
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (event) {
      // Parse dates from JSON if they exist
      let prelimsDates = ['']
      let mainsDates = ['']

      if (event.prelims_exam_date) {
        try {
          prelimsDates = Array.isArray(event.prelims_exam_date) 
            ? event.prelims_exam_date 
            : JSON.parse(event.prelims_exam_date)
        } catch (e) {
          prelimsDates = [event.prelims_exam_date]
        }
      }

      if (event.mains_exam_date) {
        try {
          mainsDates = Array.isArray(event.mains_exam_date) 
            ? event.mains_exam_date 
            : JSON.parse(event.mains_exam_date)
        } catch (e) {
          mainsDates = [event.mains_exam_date]
        }
      }

      setFormData({
        exam_name: event.exam_name || '',
        description: event.description || '',
        form_fill_last_date: event.form_fill_last_date || '',
        prelims_exam_dates: prelimsDates,
        mains_exam_dates: mainsDates,
        notification_url: event.notification_url || '',
        is_active: event.is_active ?? true
      })
    }
  }, [event])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Prelims Date Functions
  const addPrelimsDate = () => {
    setFormData(prev => ({
      ...prev,
      prelims_exam_dates: [...prev.prelims_exam_dates, '']
    }))
  }

  const removePrelimsDate = (index) => {
    if (formData.prelims_exam_dates.length > 1) {
      setFormData(prev => ({
        ...prev,
        prelims_exam_dates: prev.prelims_exam_dates.filter((_, i) => i !== index)
      }))
    }
  }

  const updatePrelimsDate = (index, value) => {
    setFormData(prev => ({
      ...prev,
      prelims_exam_dates: prev.prelims_exam_dates.map((date, i) => 
        i === index ? value : date
      )
    }))
  }

  // Mains Date Functions
  const addMainsDate = () => {
    setFormData(prev => ({
      ...prev,
      mains_exam_dates: [...prev.mains_exam_dates, '']
    }))
  }

  const removeMainsDate = (index) => {
    if (formData.mains_exam_dates.length > 1) {
      setFormData(prev => ({
        ...prev,
        mains_exam_dates: prev.mains_exam_dates.filter((_, i) => i !== index)
      }))
    }
  }

  const updateMainsDate = (index, value) => {
    setFormData(prev => ({
      ...prev,
      mains_exam_dates: prev.mains_exam_dates.map((date, i) => 
        i === index ? value : date
      )
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validation
      if (!formData.exam_name.trim()) {
        toast.error('Exam name is required')
        setLoading(false)
        return
      }

      if (!formData.form_fill_last_date) {
        toast.error('Form fill last date is required')
        setLoading(false)
        return
      }

      // Filter out empty dates
      const validPrelimsDate = formData.prelims_exam_dates.filter(date => date.trim() !== '')
      const validMainsDate = formData.mains_exam_dates.filter(date => date.trim() !== '')
      
      if (validPrelimsDate.length === 0) {
        toast.error('At least one prelims exam date is required')
        setLoading(false)
        return
      }

      if (validMainsDate.length === 0) {
        toast.error('At least one mains exam date is required')
        setLoading(false)
        return
      }

      // Prepare data for database
      const dataToSave = {
        exam_name: formData.exam_name.trim(),
        description: formData.description.trim() || null,
        form_fill_last_date: formData.form_fill_last_date,
        prelims_exam_date: validPrelimsDate, // Store as array
        mains_exam_date: validMainsDate,     // Store as array
        notification_url: formData.notification_url.trim() || null,
        is_active: formData.is_active
      }

      let error
      if (event) {
        // Update existing event
        const { error: updateError } = await supabase
          .from('calendar_events')
          .update(dataToSave)
          .eq('id', event.id)
        error = updateError
      } else {
        // Create new event
        const { error: insertError } = await supabase
          .from('calendar_events')
          .insert([dataToSave])
        error = insertError
      }

      if (error) {
        console.error('Database error:', error)
        toast.error('Error saving event')
      } else {
        toast.success(event ? 'Event updated successfully' : 'Event published successfully')
        onSave()
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Error saving event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {event ? 'Edit Exam Event' : 'Add New Exam Event'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
            disabled={loading}
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Exam Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exam Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.exam_name}
              onChange={(e) => handleInputChange('exam_name', e.target.value)}
              placeholder="e.g., IBPS PO 2024"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description about the exam..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Form Fill Last Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Form Fill Last Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.form_fill_last_date}
              onChange={(e) => handleInputChange('form_fill_last_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          {/* Prelims Exam Dates - Multiple */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prelims Exam Dates <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {formData.prelims_exam_dates.map((date, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 flex-1">
                    <FiCalendar className="text-gray-400" size={16} />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => updatePrelimsDate(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                      required={index === 0} // First date is required
                    />
                  </div>
                  
                  {formData.prelims_exam_dates.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePrelimsDate(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                      disabled={loading}
                    >
                      <FiMinus size={16} />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={addPrelimsDate}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                disabled={loading}
              >
                <FiPlus size={16} />
                <span>Add another prelims date</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              You can add multiple dates for prelims exam (e.g., 22, 23, 24 August)
            </p>
          </div>

          {/* Mains Exam Dates - Multiple */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mains Exam Dates <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {formData.mains_exam_dates.map((date, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 flex-1">
                    <FiCalendar className="text-gray-400" size={16} />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => updateMainsDate(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                      required={index === 0} // First date is required
                    />
                  </div>
                  
                  {formData.mains_exam_dates.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMainsDate(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                      disabled={loading}
                    >
                      <FiMinus size={16} />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={addMainsDate}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                disabled={loading}
              >
                <FiPlus size={16} />
                <span>Add another mains date</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              You can add multiple dates for mains exam
            </p>
          </div>

          {/* Notification URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification URL
            </label>
            <input
              type="url"
              value={formData.notification_url}
              onChange={(e) => handleInputChange('notification_url', e.target.value)}
              placeholder="https://example.com/notification"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Link to official notification
            </p>
          </div>

          {/* Is Active */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="rounded border-gray-300 focus:ring-blue-500"
                disabled={loading}
              />
              <span className="text-sm font-medium text-gray-700">
                Active (visible to users)
              </span>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
              <span>{event ? 'Update' : 'Publish'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ExamCalendarFormModal
