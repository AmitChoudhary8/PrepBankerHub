import React, { useState, useEffect } from 'react'
import { FiDownload, FiEye, FiX, FiCalendar, FiFilter } from 'react-icons/fi'
import { supabase } from '../utils/supabase'
import toast from 'react-hot-toast'

function Magazine({ user }) {
  const [magazines, setMagazines] = useState([])
  const [allMagazines, setAllMagazines] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [availableMonths, setAvailableMonths] = useState([])
  const [availableYears, setAvailableYears] = useState([])
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [selectedMagazine, setSelectedMagazine] = useState(null)

  useEffect(() => {
    loadMagazines()
  }, [])

  useEffect(() => {
    filterMagazines()
  }, [selectedMonth, selectedYear, selectedLanguage, allMagazines])

  const loadMagazines = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('magazines')
        .select('*')
        .eq('is_active', true)
        .order('year', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading magazines:', error)
        toast.error('Failed to load magazines')
        setLoading(false)
        return
      }

      setAllMagazines(data || [])
      setMagazines(data || [])
      
      // Extract unique months, years for filters
      const months = [...new Set(data?.map(m => m.month) || [])]
      const years = [...new Set(data?.map(m => m.year) || [])].sort((a, b) => b - a)
      
      setAvailableMonths(months)
      setAvailableYears(years)
      
      setLoading(false)
    } catch (error) {
      console.error('Error loading magazines:', error)
      toast.error('Failed to load magazines')
      setLoading(false)
    }
  }

  const filterMagazines = () => {
    let filtered = allMagazines

    if (selectedMonth) {
      filtered = filtered.filter(mag => mag.month === selectedMonth)
    }
    
    if (selectedYear) {
      filtered = filtered.filter(mag => mag.year === selectedYear)
    }
    
    if (selectedLanguage) {
      filtered = filtered.filter(mag => mag.language === selectedLanguage)
    }

    setMagazines(filtered)
  }

  const handlePreview = (magazine) => {
    if (!user) {
      toast.error('Please login to preview magazines')
      return
    }
    
    if (!magazine.preview_link) {
      toast.error('Preview not available for this magazine')
      return
    }
    
    setSelectedMagazine(magazine)
    setShowPreviewModal(true)
  }

  const handleDownload = async (magazine) => {
    if (!user) {
      toast.error('Please login to download magazines')
      return
    }

    try {
      // Track download in analytics
      await supabase.from('magazine_downloads').insert([{
        magazine_id: magazine.id,
        user_id: user.id,
        user_agent: navigator.userAgent
      }])
      
      // Increment download count
      await supabase.rpc('increment_magazine_downloads', {
        magazine_id: magazine.id
      })

      // Update local state for immediate UI feedback
      setAllMagazines(prevMags => 
        prevMags.map(m => 
          m.id === magazine.id 
            ? { ...m, download_count: (m.download_count || 0) + 1 }
            : m
        )
      )
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
      toast.success('Download started!')
    }
  }

  const PreviewModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-5/6 flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            <img 
              src={selectedMagazine?.cover_image} 
              alt={selectedMagazine?.title}
              className="w-16 h-20 object-cover rounded"
              onError={(e) => {
                e.target.src = '/assets/magazines/default.png'
              }}
            />
            <div>
              <h3 className="text-lg font-bold text-gray-800">{selectedMagazine?.title}</h3>
              <p className="text-sm text-gray-600">{selectedMagazine?.description}</p>
              <p className="text-xs text-gray-500">
                {selectedMagazine?.month} {selectedMagazine?.year} • {selectedMagazine?.language}
              </p>
              <p className="text-xs text-gray-500">{selectedMagazine?.file_size}</p>
            </div>
          </div>
          <button
            onClick={() => setShowPreviewModal(false)}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* PDF Preview */}
        <div className="flex-1 p-4">
          <iframe
            src={selectedMagazine?.preview_link}
            className="w-full h-full border border-gray-300 rounded"
            title="Magazine Preview"
          />
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex space-x-4">
            <button
              onClick={() => handleDownload(selectedMagazine)}
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center space-x-2"
            >
              <FiDownload size={18} />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Group magazines by month for better display
  const groupedMagazines = []
  const processedPairs = new Set()

  magazines.forEach(magazine => {
    const key = `${magazine.month}-${magazine.year}`
    if (processedPairs.has(key)) return
    
    const englishMag = magazines.find(m => 
      m.month === magazine.month && 
      m.year === magazine.year && 
      m.language === 'English'
    )
    const hindiMag = magazines.find(m => 
      m.month === magazine.month && 
      m.year === magazine.year && 
      m.language === 'Hindi'
    )
    
    if (englishMag || hindiMag) {
      groupedMagazines.push({ 
        english: englishMag, 
        hindi: hindiMag,
        month: magazine.month,
        year: magazine.year
      })
      processedPairs.add(key)
    }
  })

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      
      {/* Page Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Current Affairs Magazines
        </h1>
        <p className="text-gray-600">Monthly current affairs updates for competitive exams</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center">
        {/* Month Filter */}
        <div className="flex items-center space-x-2">
          <FiCalendar className="text-gray-400" />
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="">All Months</option>
            {availableMonths.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div className="flex items-center space-x-2">
          <FiCalendar className="text-gray-400" />
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">All Years</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Language Filter */}
        <div className="flex items-center space-x-2">
          <FiFilter className="text-gray-400" />
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            <option value="">All Languages</option>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
          </select>
        </div>

        {/* Clear Filters */}
        <button
          onClick={() => {
            setSelectedMonth('')
            setSelectedYear('')
            setSelectedLanguage('')
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {/* Magazines Display */}
      {magazines.length > 0 ? (
        <>
          {/* Mobile Layout */}
          <div className="md:hidden space-y-6">
            {groupedMagazines.map((group, index) => (
              <div key={index}>
                <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                  {group.month} {group.year}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {/* English Magazine */}
                  {group.english && (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                      <img 
                        src={group.english.cover_image} 
                        alt={group.english.title}
                        className="w-full h-40 object-cover"
                        onError={(e) => {
                          e.target.src = '/assets/magazines/default.png'
                        }}
                      />
                      <div className="p-3">
                        <h3 className="font-bold text-sm mb-1 line-clamp-1">
                          Current Affairs Magazine
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">{group.month} {group.year} (English)</p>
                        <div className="space-y-2">
                          {group.english.preview_link && (
                            <button
                              onClick={() => handlePreview(group.english)}
                              className="w-full bg-blue-500 text-white py-2 px-3 rounded text-xs font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1"
                            >
                              <FiEye size={12} />
                              <span>Preview</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDownload(group.english)}
                            className="w-full bg-green-500 text-white py-2 px-3 rounded text-xs font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-1"
                          >
                            <FiDownload size={12} />
                            <span>Download</span>
                          </button>
                        </div>
                        {group.english.download_count > 0 && (
                          <p className="text-xs text-gray-500 text-center mt-2">
                            {group.english.download_count} downloads
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Hindi Magazine */}
                  {group.hindi && (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                      <img 
                        src={group.hindi.cover_image} 
                        alt={group.hindi.title}
                        className="w-full h-40 object-cover"
                        onError={(e) => {
                          e.target.src = '/assets/magazines/default.png'
                        }}
                      />
                      <div className="p-3">
                        <h3 className="font-bold text-sm mb-1 line-clamp-1">
                          करेंट अफेयर्स मैगज़ीन
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">{group.month} {group.year} (Hindi)</p>
                        <div className="space-y-2">
                          {group.hindi.preview_link && (
                            <button
                              onClick={() => handlePreview(group.hindi)}
                              className="w-full bg-blue-500 text-white py-2 px-3 rounded text-xs font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1"
                            >
                              <FiEye size={12} />
                              <span>Preview</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDownload(group.hindi)}
                            className="w-full bg-green-500 text-white py-2 px-3 rounded text-xs font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-1"
                          >
                            <FiDownload size={12} />
                            <span>Download</span>
                          </button>
                        </div>
                        {group.hindi.download_count > 0 && (
                          <p className="text-xs text-gray-500 text-center mt-2">
                            {group.hindi.download_count} downloads
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {groupedMagazines.map((group, index) => (
                <React.Fragment key={index}>
                  {/* English Magazine */}
                  {group.english && (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                      <img 
                        src={group.english.cover_image} 
                        alt={group.english.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.src = '/assets/magazines/default.png'
                        }}
                      />
                      <div className="p-4">
                        <div className="text-center mb-3">
                          <h3 className="font-bold text-gray-800 text-sm">
                            Current Affairs Magazine
                          </h3>
                          <p className="text-xs text-gray-500">
                            {group.english.month} {group.english.year} (English)
                          </p>
                          <p className="text-xs text-gray-400">
                            {group.english.file_size}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          {group.english.preview_link && (
                            <button
                              onClick={() => handlePreview(group.english)}
                              className="w-full bg-blue-500 text-white py-2 px-3 rounded font-medium hover:bg-blue-600 transition-colors text-sm flex items-center justify-center space-x-1"
                            >
                              <FiEye size={14} />
                              <span>Preview</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDownload(group.english)}
                            className="w-full bg-green-500 text-white py-2 px-3 rounded font-medium hover:bg-green-600 transition-colors text-sm flex items-center justify-center space-x-1"
                          >
                            <FiDownload size={14} />
                            <span>Download</span>
                          </button>
                        </div>

                        {group.english.download_count > 0 && (
                          <p className="text-xs text-gray-500 text-center mt-2">
                            {group.english.download_count} downloads
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Hindi Magazine */}
                  {group.hindi && (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                      <img 
                        src={group.hindi.cover_image} 
                        alt={group.hindi.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.src = '/assets/magazines/default.png'
                        }}
                      />
                      <div className="p-4">
                        <div className="text-center mb-3">
                          <h3 className="font-bold text-gray-800 text-sm">
                            करेंट अफेयर्स मैगज़ीन
                          </h3>
                          <p className="text-xs text-gray-500">
                            {group.hindi.month} {group.hindi.year} (Hindi)
                          </p>
                          <p className="text-xs text-gray-400">
                            {group.hindi.file_size}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          {group.hindi.preview_link && (
                            <button
                              onClick={() => handlePreview(group.hindi)}
                              className="w-full bg-blue-500 text-white py-2 px-3 rounded font-medium hover:bg-blue-600 transition-colors text-sm flex items-center justify-center space-x-1"
                            >
                              <FiEye size={14} />
                              <span>Preview</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDownload(group.hindi)}
                            className="w-full bg-green-500 text-white py-2 px-3 rounded font-medium hover:bg-green-600 transition-colors text-sm flex items-center justify-center space-x-1"
                          >
                            <FiDownload size={14} />
                            <span>Download</span>
                          </button>
                        </div>

                        {group.hindi.download_count > 0 && (
                          <p className="text-xs text-gray-500 text-center mt-2">
                            {group.hindi.download_count} downloads
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No magazines found matching your criteria</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or check back later</p>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedMagazine && <PreviewModal />}

      {/* Login Prompt for Guests */}
      {!user && (
        <div className="mt-12 bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-green-800 mb-2">
            Login Required
          </h3>
          <p className="text-green-600">
            Please create an account to preview and download magazines
          </p>
        </div>
      )}
    </div>
  )
}

export default Magazine
