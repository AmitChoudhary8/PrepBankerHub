import React, { useState, useEffect } from 'react'
import { FiDownload, FiEye, FiX } from 'react-icons/fi'
import { supabase } from '../utils/supabase'
import toast from 'react-hot-toast'

function Magazine({ user }) {
  const [magazines, setMagazines] = useState([])
  const [allMagazines, setAllMagazines] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [availableMonths, setAvailableMonths] = useState([])
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [selectedMagazine, setSelectedMagazine] = useState(null)

  // Sample magazine data with year-based image naming
  const sampleMagazines = [
    {
      id: 1,
      title: 'Current Affairs Magazine - September 2025 (English)',
      description: 'Comprehensive current affairs compilation for banking exams',
      month: 'September',
      year: '2025',
      language: 'English',
      cover_image: '/assets/magazines/september2025english.png',
      google_drive_link: 'https://drive.google.com/file/d/sample1/view',
      preview_link: 'https://drive.google.com/file/d/sample1/preview',
      file_size: '12 MB'
    },
    {
      id: 2,
      title: 'Current Affairs Magazine - September 2025 (Hindi)', 
      description: 'संपूर्ण करेंट अफेयर्स सितंबर 2025 बैंकिंग परीक्षाओं के लिए',
      month: 'September',
      year: '2025',
      language: 'Hindi',
      cover_image: '/assets/magazines/september2025hindi.png',
      google_drive_link: 'https://drive.google.com/file/d/sample2/view',
      preview_link: 'https://drive.google.com/file/d/sample2/preview',
      file_size: '12 MB'
    },
    {
      id: 3,
      title: 'Current Affairs Magazine - August 2025 (English)',
      description: 'Complete August 2025 current affairs for competitive exams',
      month: 'August',
      year: '2025', 
      language: 'English',
      cover_image: '/assets/magazines/august2025english.png',
      google_drive_link: 'https://drive.google.com/file/d/sample3/view',
      preview_link: 'https://drive.google.com/file/d/sample3/preview',
      file_size: '11 MB'
    },
    {
      id: 4,
      title: 'Current Affairs Magazine - August 2025 (Hindi)',
      description: 'संपूर्ण करेंट अफेयर्स अगस्त 2025 प्रतियोगी परीक्षाओं के लिए',
      month: 'August', 
      year: '2025',
      language: 'Hindi',
      cover_image: '/assets/magazines/august2025hindi.png',
      google_drive_link: 'https://drive.google.com/file/d/sample4/view',
      preview_link: 'https://drive.google.com/file/d/sample4/preview',
      file_size: '11 MB'
    },
    {
      id: 5,
      title: 'Current Affairs Magazine - July 2025 (English)',
      description: 'Complete July 2025 current affairs compilation',
      month: 'July',
      year: '2025',
      language: 'English', 
      cover_image: '/assets/magazines/july2025english.png',
      google_drive_link: 'https://drive.google.com/file/d/sample5/view',
      preview_link: 'https://drive.google.com/file/d/sample5/preview',
      file_size: '10 MB'
    },
    {
      id: 6,
      title: 'Current Affairs Magazine - July 2025 (Hindi)',
      description: 'संपूर्ण करेंट अफेयर्स जुलाई 2025',
      month: 'July',
      year: '2025',
      language: 'Hindi',
      cover_image: '/assets/magazines/july2025hindi.png', 
      google_drive_link: 'https://drive.google.com/file/d/sample6/view',
      preview_link: 'https://drive.google.com/file/d/sample6/preview',
      file_size: '10 MB'
    }
  ]

  useEffect(() => {
    loadMagazines()
  }, [])

  useEffect(() => {
    if (selectedMonth) {
      const filtered = allMagazines.filter(mag => `${mag.month} ${mag.year}` === selectedMonth)
      setMagazines(filtered)
    } else {
      // Show latest month magazines by default
      setMagazines(allMagazines.slice(0, 2))
    }
  }, [selectedMonth, allMagazines])

  const loadMagazines = async () => {
    try {
      // Using sample data - later replace with Supabase query
      setAllMagazines(sampleMagazines)
      
      // Extract unique months and sort by latest first
      const months = [...new Set(sampleMagazines.map(m => `${m.month} ${m.year}`))]
      setAvailableMonths(months)
      
      // Set latest month magazines by default
      setMagazines(sampleMagazines.slice(0, 2))
      setLoading(false)
    } catch (error) {
      console.error('Error loading magazines:', error)
      toast.error('Failed to load magazines')
      setLoading(false)
    }
  }

  const handlePreview = (magazine) => {
    if (!user) {
      toast.error('Please login to preview magazines')
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
      // Track download
      window.open(magazine.google_drive_link, '_blank')
      toast.success('Download started!')
    } catch (error) {
      toast.error('Download failed')
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
            />
            <div>
              <h3 className="text-lg font-bold text-gray-800">{selectedMagazine?.title}</h3>
              <p className="text-sm text-gray-600">{selectedMagazine?.description}</p>
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
              onClick={() => handlePreview(selectedMagazine)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <FiEye size={18} />
              <span>Preview</span>
            </button>
            <button
              onClick={() => handleDownload(selectedMagazine)}
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center space-x-2"
            >
              <FiDownload size={18} />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    )
  }

  // Group magazines by month for desktop view
  const groupedMagazines = []
  for (let i = 0; i < allMagazines.length; i += 2) {
    const englishMag = allMagazines.find(m => m.language === 'English' && m.month === allMagazines[i].month && m.year === allMagazines[i].year)
    const hindiMag = allMagazines.find(m => m.language === 'Hindi' && m.month === allMagazines[i].month && m.year === allMagazines[i].year)
    
    if (englishMag && hindiMag && !groupedMagazines.find(g => g.english.month === englishMag.month && g.english.year === englishMag.year)) {
      groupedMagazines.push({ english: englishMag, hindi: hindiMag })
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      
      {/* Page Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Current Affairs Magazines
        </h1>
      </div>

      {/* Month Selection Dropdown */}
      <div className="flex justify-center mb-8">
        <select
          className="px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="">All Months (Latest First)</option>
          {availableMonths.map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-6">
        {selectedMonth ? (
          // Show specific month magazines
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              {selectedMonth}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {magazines.map(magazine => (
                <div key={magazine.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                  <img 
                    src={magazine.cover_image} 
                    alt={magazine.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-3">
                    <h3 className="font-bold text-sm mb-1 line-clamp-1">{magazine.title}</h3>
                    <p className="text-gray-600 text-xs mb-2 line-clamp-2">{magazine.description}</p>
                    <button
                      onClick={() => handlePreview(magazine)}
                      className="w-full bg-blue-500 text-white py-2 px-3 rounded text-xs font-medium hover:bg-blue-600 transition-colors"
                    >
                      <FiDownload size={14} className="inline mr-1" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Show all magazines grouped by month
          <div className="space-y-8">
            {groupedMagazines.map((group, index) => (
              <div key={index}>
                <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                  {group.english.month} {group.english.year}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {/* English Magazine */}
                  <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <img 
                      src={group.english.cover_image} 
                      alt={group.english.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-3">
                      <h3 className="font-bold text-sm mb-1 line-clamp-1">{group.english.title}</h3>
                      <p className="text-gray-600 text-xs mb-2 line-clamp-2">{group.english.description}</p>
                      <button
                        onClick={() => handlePreview(group.english)}
                        className="w-full bg-blue-500 text-white py-2 px-3 rounded text-xs font-medium hover:bg-blue-600 transition-colors"
                      >
                        <FiDownload size={14} className="inline mr-1" />
                        Download
                      </button>
                    </div>
                  </div>

                  {/* Hindi Magazine */}
                  <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <img 
                      src={group.hindi.cover_image} 
                      alt={group.hindi.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-3">
                      <h3 className="font-bold text-sm mb-1 line-clamp-1">{group.hindi.title}</h3>
                      <p className="text-gray-600 text-xs mb-2 line-clamp-2">{group.hindi.description}</p>
                      <button
                        onClick={() => handlePreview(group.hindi)}
                        className="w-full bg-blue-500 text-white py-2 px-3 rounded text-xs font-medium hover:bg-blue-600 transition-colors"
                      >
                        <FiDownload size={14} className="inline mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Layout - 4 magazines per row */}
      <div className="hidden md:block">
        <div className="grid grid-cols-4 gap-6">
          {groupedMagazines.map((group, index) => (
            <React.Fragment key={index}>
              {/* English Magazine */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden card-hover">
                <img 
                  src={group.english.cover_image} 
                  alt={group.english.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="text-center mb-2">
                    <h3 className="font-bold text-gray-800 text-sm">
                      {group.english.month} {group.english.year}
                    </h3>
                    <p className="text-xs text-gray-500">(English)</p>
                  </div>
                  <h4 className="font-bold text-sm mb-2 line-clamp-2">{group.english.title}</h4>
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">{group.english.description}</p>
                  <button
                    onClick={() => handlePreview(group.english)}
                    className="w-full bg-blue-500 text-white py-2 px-3 rounded font-medium hover:bg-blue-600 transition-colors text-sm"
                  >
                    Download
                  </button>
                </div>
              </div>

              {/* Hindi Magazine */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden card-hover">
                <img 
                  src={group.hindi.cover_image} 
                  alt={group.hindi.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="text-center mb-2">
                    <h3 className="font-bold text-gray-800 text-sm">
                      {group.hindi.month} {group.hindi.year}
                    </h3>
                    <p className="text-xs text-gray-500">(Hindi)</p>
                  </div>
                  <h4 className="font-bold text-sm mb-2 line-clamp-2">{group.hindi.title}</h4>
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">{group.hindi.description}</p>
                  <button
                    onClick={() => handlePreview(group.hindi)}
                    className="w-full bg-blue-500 text-white py-2 px-3 rounded font-medium hover:bg-blue-600 transition-colors text-sm"
                  >
                    Download
                  </button>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

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
