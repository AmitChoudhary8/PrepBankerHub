import React, { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
import { FiX, FiUpload, FiLink, FiImage, FiCalendar } from 'react-icons/fi'
import toast from 'react-hot-toast'

function MagazineFormModal({ magazine, onClose, onSave, generateCoverImagePath }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    month: '',
    year: new Date().getFullYear().toString(),
    language: 'English',
    google_drive_link: '',
    preview_link: '',
    file_size: '',
    is_active: true
  })
  const [loading, setLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState('')

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const languages = ['English', 'Hindi']
  
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)

  useEffect(() => {
    if (magazine) {
      setFormData({
        title: magazine.title || '',
        description: magazine.description || '',
        month: magazine.month || '',
        year: magazine.year || '',
        language: magazine.language || 'English',
        google_drive_link: magazine.google_drive_link || '',
        preview_link: magazine.preview_link || '',
        file_size: magazine.file_size || '',
        is_active: magazine.is_active ?? true
      })
    }
  }, [magazine])

  useEffect(() => {
    // Auto-generate preview image path when month, year, or language changes
    if (formData.month && formData.year && formData.language) {
      const imagePath = generateCoverImagePath(formData.month, formData.year, formData.language)
      setPreviewImage(imagePath)
    }
  }, [formData.month, formData.year, formData.language, generateCoverImagePath])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return false
    }
    if (!formData.month) {
      toast.error('Month is required')
      return false
    }
    if (!formData.year) {
      toast.error('Year is required')
      return false
    }
    if (!formData.language) {
      toast.error('Language is required')
      return false
    }
    if (!formData.google_drive_link.trim()) {
      toast.error('Google Drive link is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const dataToSave = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        google_drive_link: formData.google_drive_link.trim(),
        preview_link: formData.preview_link.trim() || null,
        file_size: formData.file_size.trim() || null,
        cover_image: generateCoverImagePath(formData.month, formData.year, formData.language)
      }

      if (magazine) {
        // Update existing magazine
        const { error } = await supabase
          .from('magazines')
          .update(dataToSave)
          .eq('id', magazine.id)

        if (error) {
          toast.error('Error updating magazine')
          console.error(error)
        } else {
          toast.success('Magazine updated successfully')
          onSave()
        }
      } else {
        // Add new magazine
        const { error } = await supabase
          .from('magazines')
          .insert([{
            ...dataToSave,
            created_by: (await supabase.auth.getUser()).data.user?.id
          }])

        if (error) {
          toast.error('Error adding magazine')
          console.error(error)
        } else {
          toast.success('Magazine added successfully')
          onSave()
        }
      }
    } catch (error) {
      toast.error('Error saving magazine')
      console.error(error)
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
            {magazine ? 'Edit Magazine' : 'Add New Magazine'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Current Affairs Magazine"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of the magazine"
            />
          </div>

          {/* Month, Year, Language Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Month */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month *
              </label>
              <select
                name="month"
                value={formData.month}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Month</option>
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year *
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {years.map(year => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language *
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cover Image Preview */}
          {previewImage && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image Preview
              </label>
              <div className="flex items-center space-x-4">
                <img 
                  src={previewImage}
                  alt="Magazine Cover Preview"
                  className="w-20 h-28 rounded-lg object-cover border"
                  onError={(e) => {
                    e.target.src = '/assets/magazines/default.png'
                  }}
                />
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Auto-generated path:</p>
                  <p className="text-xs text-gray-500 mt-1">{previewImage}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Make sure this image exists in the public folder!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Google Drive Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Drive Link *
            </label>
            <div className="relative">
              <FiLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="url"
                name="google_drive_link"
                value={formData.google_drive_link}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://drive.google.com/file/d/..."
                required
              />
            </div>
          </div>

          {/* Preview Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview Link (Optional)
            </label>
            <div className="relative">
              <FiLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="url"
                name="preview_link"
                value={formData.preview_link}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://drive.google.com/file/d/.../preview"
              />
            </div>
          </div>

          {/* File Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Size (Optional)
            </label>
            <input
              type="text"
              name="file_size"
              value={formData.file_size}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 15 MB"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
              Active (visible to users)
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{magazine ? 'Update Magazine' : 'Add Magazine'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MagazineFormModal
