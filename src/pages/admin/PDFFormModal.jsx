import React, { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
import { FiX, FiUpload, FiLink, FiImage } from 'react-icons/fi'
import toast from 'react-hot-toast'

function PDFFormModal({ pdf, onClose, onSave, topics }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topic: 'quants',
    google_drive_link: '',
    preview_link: '',
    file_size: '',
    is_active: true
  })
  const [loading, setLoading] = useState(false)
  const [selectedTopicImage, setSelectedTopicImage] = useState('')

  useEffect(() => {
    if (pdf) {
      setFormData({
        title: pdf.title || '',
        description: pdf.description || '',
        topic: pdf.topic || 'quants',
        google_drive_link: pdf.google_drive_link || '',
        preview_link: pdf.preview_link || '',
        file_size: pdf.file_size || '',
        is_active: pdf.is_active ?? true
      })
    }
    setSelectedTopicImage(formData.topic)
  }, [pdf])

  useEffect(() => {
    setSelectedTopicImage(formData.topic)
  }, [formData.topic])

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
    if (!formData.topic) {
      toast.error('Topic is required')
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
        file_size: formData.file_size.trim() || null
      }

      if (pdf) {
        // Update existing PDF
        const { error } = await supabase
          .from('pdf_resources')
          .update(dataToSave)
          .eq('id', pdf.id)

        if (error) {
          toast.error('Error updating PDF')
          console.error(error)
        } else {
          toast.success('PDF updated successfully')
          onSave()
        }
      } else {
        // Add new PDF
        const { error } = await supabase
          .from('pdf_resources')
          .insert([{
            ...dataToSave,
            created_by: (await supabase.auth.getUser()).data.user?.id
          }])

        if (error) {
          toast.error('Error adding PDF')
          console.error(error)
        } else {
          toast.success('PDF added successfully')
          onSave()
        }
      }
    } catch (error) {
      toast.error('Error saving PDF')
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
            {pdf ? 'Edit PDF' : 'Add New PDF'}
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
              placeholder="Enter PDF title"
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
              placeholder="Enter PDF description"
            />
          </div>

          {/* Topic Selection with Image Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic *
            </label>
            <div className="flex items-center space-x-4">
              <select
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {topics.map(topic => (
                  <option key={topic} value={topic}>
                    {topic.replace('_', ' ').charAt(0).toUpperCase() + topic.replace('_', ' ').slice(1)}
                  </option>
                ))}
              </select>
              
              {/* Topic Image Preview */}
              <div className="flex items-center space-x-2">
                <FiImage className="text-gray-400" />
                <img 
                  src={`/assets/topics/${selectedTopicImage}.png`}
                  alt={selectedTopicImage}
                  className="w-12 h-12 rounded-lg object-cover border"
                  onError={(e) => {
                    e.target.src = '/assets/topics/other.png'
                  }}
                />
              </div>
            </div>
          </div>

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
              placeholder="e.g., 8 MB"
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
              <span>{pdf ? 'Update PDF' : 'Add PDF'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PDFFormModal
