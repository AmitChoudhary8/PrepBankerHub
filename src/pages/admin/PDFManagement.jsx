import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiDownload, 
  FiSearch, 
  FiEye,
  FiCalendar,
  FiFileText 
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import PDFFormModal from './PDFFormModal'

function PDFManagement() {
  const [pdfs, setPdfs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingPdf, setEditingPdf] = useState(null)
  const [filteredPdfs, setFilteredPdfs] = useState([])

  // Topic options
  const topics = [
    'quants', 'english', 'reasoning', 'general_awareness', 
    'prelims', 'mains', 'po', 'clerk', 'insurance', 'other'
  ]

  // Fetch PDFs from database
  const fetchPdfs = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('pdfs')
        .select('*')
        .order('upload_date', { ascending: false })

      if (error) {
        toast.error('Error fetching PDFs')
        console.error(error)
      } else {
        setPdfs(data || [])
        setFilteredPdfs(data || [])
      }
    } catch (error) {
      toast.error('Error loading PDFs')
    } finally {
      setLoading(false)
    }
  }

  // Search filter
  useEffect(() => {
    if (!searchTerm) {
      setFilteredPdfs(pdfs)
    } else {
      const filtered = pdfs.filter(pdf => 
        pdf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pdf.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pdf.topic.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredPdfs(filtered)
    }
  }, [searchTerm, pdfs])

  // Delete PDF
  const handleDelete = async (pdf) => {
    if (!window.confirm(`Are you sure you want to delete "${pdf.title}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('pdfs')
        .delete()
        .eq('id', pdf.id)

      if (error) {
        toast.error('Error deleting PDF')
      } else {
        toast.success('PDF deleted successfully')
        fetchPdfs() // Refresh list
      }
    } catch (error) {
      toast.error('Error deleting PDF')
    }
  }

  // Toggle active status
  const toggleStatus = async (pdf) => {
    try {
      const { error } = await supabase
        .from('pdfs')
        .update({ is_active: !pdf.is_active })
        .eq('id', pdf.id)

      if (error) {
        toast.error('Error updating status')
      } else {
        toast.success(`PDF ${pdf.is_active ? 'deactivated' : 'activated'}`)
        fetchPdfs()
      }
    } catch (error) {
      toast.error('Error updating status')
    }
  }

  useEffect(() => {
    fetchPdfs()
  }, [])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">PDF Management</h1>
          <p className="text-gray-600">Manage downloadable PDF resources</p>
        </div>
        
        <button
          onClick={() => {
            setEditingPdf(null)
            setShowForm(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <FiPlus size={20} />
          <span>Add New PDF</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search PDFs by title, description, or topic..."
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
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <FiFileText className="text-blue-600 mr-3" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Total PDFs</p>
                  <p className="text-2xl font-bold text-gray-800">{pdfs.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <FiEye className="text-green-600 mr-3" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Active PDFs</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {pdfs.filter(pdf => pdf.is_active).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <FiDownload className="text-purple-600 mr-3" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Total Downloads</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {pdfs.reduce((sum, pdf) => sum + (pdf.download_count || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <FiCalendar className="text-orange-600 mr-3" size={24} />
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {pdfs.filter(pdf => {
                      const uploadDate = new Date(pdf.upload_date)
                      const now = new Date()
                      return uploadDate.getMonth() === now.getMonth() && 
                             uploadDate.getFullYear() === now.getFullYear()
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* PDF Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PDF Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Topic
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stats
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
                  {filteredPdfs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        {searchTerm ? 'No PDFs found matching your search.' : 'No PDFs uploaded yet.'}
                      </td>
                    </tr>
                  ) : (
                    filteredPdfs.map((pdf) => (
                      <tr key={pdf.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-start space-x-3">
                            <img 
                              src={`/assets/topics/${pdf.topic}.png`}
                              alt={pdf.topic}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                              onError={(e) => {
                                e.target.src = '/assets/topics/other.png'
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {pdf.title}
                              </p>
                              <p className="text-sm text-gray-500 line-clamp-2">
                                {pdf.description || 'No description'}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDate(pdf.upload_date)}
                              </p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {pdf.topic.replace('_', ' ')}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div>
                            <p className="font-medium">{pdf.file_size || 'Unknown'}</p>
                            <div className="flex space-x-2 mt-1">
                              {pdf.google_drive_link && (
                                <a 
                                  href={pdf.google_drive_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs"
                                >
                                  Drive Link
                                </a>
                              )}
                              {pdf.preview_link && (
                                <a 
                                  href={pdf.preview_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:text-green-800 text-xs"
                                >
                                  Preview
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center space-x-2">
                            <FiDownload size={14} className="text-gray-400" />
                            <span>{pdf.download_count || 0}</span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleStatus(pdf)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              pdf.is_active 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            } transition-colors`}
                          >
                            {pdf.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setEditingPdf(pdf)
                                setShowForm(true)
                              }}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                              title="Edit PDF"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            
                            <button
                              onClick={() => handleDelete(pdf)}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title="Delete PDF"
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

      {/* PDF Form Modal */}
      {showForm && (
        <PDFFormModal
          pdf={editingPdf}
          onClose={() => {
            setShowForm(false)
            setEditingPdf(null)
          }}
          onSave={() => {
            setShowForm(false)
            setEditingPdf(null)
            fetchPdfs()
          }}
          topics={topics}
        />
      )}
    </div>
  )
}

export default PDFManagement
