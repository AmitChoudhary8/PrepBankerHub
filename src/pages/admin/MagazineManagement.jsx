import React, { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
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
import MagazineFormModal from './MagazineFormModal'

function MagazineManagement() {
  const [magazines, setMagazines] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingMagazine, setEditingMagazine] = useState(null)
  const [filteredMagazines, setFilteredMagazines] = useState([])

  // Generate cover image path automatically
  const generateCoverImagePath = (month, year, language) => {
    return `/assets/magazines/${month.toLowerCase()}${year}${language.toLowerCase()}.png`
  }

  // Fetch magazines from database
  const fetchMagazines = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('magazines')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Error fetching magazines')
        console.error(error)
      } else {
        setMagazines(data || [])
        setFilteredMagazines(data || [])
      }
    } catch (error) {
      toast.error('Error loading magazines')
    } finally {
      setLoading(false)
    }
  }

  // Search filter
  useEffect(() => {
    if (!searchTerm) {
      setFilteredMagazines(magazines)
    } else {
      const filtered = magazines.filter(magazine => 
        magazine.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        magazine.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
        magazine.year.includes(searchTerm) ||
        magazine.language.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredMagazines(filtered)
    }
  }, [searchTerm, magazines])

  // Delete magazine
  const handleDelete = async (magazine) => {
    if (!window.confirm(`Are you sure you want to delete "${magazine.title}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('magazines')
        .delete()
        .eq('id', magazine.id)

      if (error) {
        toast.error('Error deleting magazine')
      } else {
        toast.success('Magazine deleted successfully')
        fetchMagazines()
      }
    } catch (error) {
      toast.error('Error deleting magazine')
    }
  }

  // Toggle active status
  const toggleStatus = async (magazine) => {
    try {
      const { error } = await supabase
        .from('magazines')
        .update({ is_active: !magazine.is_active })
        .eq('id', magazine.id)

      if (error) {
        toast.error('Error updating status')
      } else {
        toast.success(`Magazine ${magazine.is_active ? 'deactivated' : 'activated'}`)
        fetchMagazines()
      }
    } catch (error) {
      toast.error('Error updating status')
    }
  }

  // Track download with analytics
  const handleDownload = async (magazine) => {
    try {
      // Track download
      await supabase.from('magazine_downloads').insert([{
        magazine_id: magazine.id,
        user_id: (await supabase.auth.getUser()).data.user?.id
      }])
      
      // Increment download count
      await supabase.rpc('increment_magazine_downloads', {
        magazine_id: magazine.id
      })

      // Update local state
      setMagazines(prevMags => 
        prevMags.map(m => 
          m.id === magazine.id 
            ? { ...m, download_count: (m.download_count || 0) + 1 }
            : m
        )
      )
      
      // Open download link
      window.open(magazine.google_drive_link, '_blank')
      toast.success('Download started!')
    } catch (error) {
      console.error('Error tracking download:', error)
      // Still allow download even if tracking fails
      window.open(magazine.google_drive_link, '_blank')
    }
  }

  useEffect(() => {
    fetchMagazines()
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
          <h1 className="text-2xl font-bold text-gray-800">Magazine Management</h1>
          <p className="text-gray-600">Manage monthly current affairs magazines</p>
        </div>
        
        <button
          onClick={() => {
            setEditingMagazine(null)
            setShowForm(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <FiPlus size={20} />
          <span>Add New Magazine</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search magazines by title, month, year, or language..."
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
                  <p className="text-sm text-gray-600">Total Magazines</p>
                  <p className="text-2xl font-bold text-gray-800">{magazines.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <FiEye className="text-green-600 mr-3" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Active Magazines</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {magazines.filter(mag => mag.is_active).length}
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
                    {magazines.reduce((sum, mag) => sum + (mag.download_count || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <FiCalendar className="text-orange-600 mr-3" size={24} />
                <div>
                  <p className="text-sm text-gray-600">This Year</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {magazines.filter(mag => 
                      mag.year === new Date().getFullYear().toString()
                    ).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Magazines Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Magazine Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period & Language
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
                  {filteredMagazines.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        {searchTerm ? 'No magazines found matching your search.' : 'No magazines uploaded yet.'}
                      </td>
                    </tr>
                  ) : (
                    filteredMagazines.map((magazine) => (
                      <tr key={magazine.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-start space-x-3">
                            <img 
                              src={generateCoverImagePath(magazine.month, magazine.year, magazine.language)}
                              alt={`${magazine.month} ${magazine.year} ${magazine.language}`}
                              className="w-12 h-16 rounded object-cover flex-shrink-0"
                              onError={(e) => {
                                e.target.src = '/assets/magazines/default.png'
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {magazine.title}
                              </p>
                              <p className="text-sm text-gray-500 line-clamp-2">
                                {magazine.description || 'No description'}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDate(magazine.created_at)}
                              </p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {magazine.month} {magazine.year}
                            </span>
                            <p className="text-xs text-gray-600">{magazine.language}</p>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div>
                            <p className="font-medium">{magazine.file_size || 'Unknown size'}</p>
                            <div className="flex space-x-2 mt-1">
                              {magazine.google_drive_link && (
                                <a 
                                  href={magazine.google_drive_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs"
                                >
                                  Drive Link
                                </a>
                              )}
                              {magazine.preview_link && (
                                <a 
                                  href={magazine.preview_link}
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
                            <span>{magazine.download_count || 0}</span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleStatus(magazine)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              magazine.is_active 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            } transition-colors`}
                          >
                            {magazine.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleDownload(magazine)}
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                              title="Download Magazine"
                            >
                              <FiDownload size={16} />
                            </button>
                            
                            <button
                              onClick={() => {
                                setEditingMagazine(magazine)
                                setShowForm(true)
                              }}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                              title="Edit Magazine"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            
                            <button
                              onClick={() => handleDelete(magazine)}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title="Delete Magazine"
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

      {/* Magazine Form Modal */}
      {showForm && (
        <MagazineFormModal
          magazine={editingMagazine}
          onClose={() => {
            setShowForm(false)
            setEditingMagazine(null)
          }}
          onSave={() => {
            setShowForm(false)
            setEditingMagazine(null)
            fetchMagazines()
          }}
          generateCoverImagePath={generateCoverImagePath}
        />
      )}
    </div>
  )
}

export default MagazineManagement
