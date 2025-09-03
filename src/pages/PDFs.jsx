import React, { useState, useEffect } from 'react'
import { FiSearch, FiDownload, FiEye, FiX } from 'react-icons/fi'
import { supabase } from '../utils/supabase'
import toast from 'react-hot-toast'

function PDFs({ user }) {
  const [pdfs, setPdfs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('All')
  const [filteredPdfs, setFilteredPdfs] = useState([])
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [selectedPdf, setSelectedPdf] = useState(null)

  // Topics for filtering (exactly as per your requirement)
  const topics = [
    'All',
    'Quants',
    'English', 
    'Reasoning',
    'General Awareness',
    'Prelims',
    'Mains',
    'PO',
    'Clerk',
    'Insurance',
    'Other'
  ]

  useEffect(() => {
    loadPdfs()
  }, [])

  useEffect(() => {
    filterPdfs()
  }, [searchTerm, selectedTopic, pdfs])

  const loadPdfs = async () => {
    try {
      const { data, error } = await supabase
        .from('pdf_resources')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading PDFs:', error)
        toast.error('Failed to load PDFs')
      } else {
        setPdfs(data || [])
      }
      setLoading(false)
    } catch (error) {
      console.error('Error loading PDFs:', error)
      toast.error('Failed to load PDFs')
      setLoading(false)
    }
  }

  const filterPdfs = () => {
    let filtered = pdfs

    // Topic filter
    if (selectedTopic !== 'All') {
      const topicMapping = {
        'Quants': 'quants',
        'English': 'english',
        'Reasoning': 'reasoning',
        'General Awareness': 'general_awareness',
        'Prelims': 'prelims',
        'Mains': 'mains',
        'PO': 'po',
        'Clerk': 'clerk',
        'Insurance': 'insurance',
        'Other': 'other'
      }
      filtered = filtered.filter(pdf => pdf.topic === topicMapping[selectedTopic])
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(pdf => 
        pdf.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredPdfs(filtered)
  }

  const getTopicImage = (topic) => {
    // Images will be stored at /assets/topics/{topic}.png
    return `/assets/topics/${topic}.png`
  }

  const handlePreview = (pdf) => {
    if (!user) {
      toast.error('Please login to preview PDFs')
      return
    }
    setSelectedPdf(pdf)
    setShowPreviewModal(true)
  }

  const handleDownload = async (pdf) => {
    if (!user) {
      toast.error('Please login to download PDFs')
      return
    }

    try {
      // 1. Track download in analytics table
      await supabase.from('download_analytics').insert([{
        pdf_id: pdf.id,
        user_id: user.id,
        user_agent: navigator.userAgent
      }])
      
      // 2. Increment download count using database function
      await supabase.rpc('increment_pdf_downloads', {
        pdf_uuid: pdf.id
      })

      // 3. Update local state
      setPdfs(prevPdfs => 
        prevPdfs.map(p => 
          p.id === pdf.id 
            ? { ...p, download_count: (p.download_count || 0) + 1 }
            : p
        )
      )
      
      // 4. Open Google Drive download link
      window.open(pdf.google_drive_link, '_blank')
      toast.success('Download started!')
    } catch (error) {
      console.error('Error tracking download:', error)
      // Still allow download even if tracking fails
      window.open(pdf.google_drive_link, '_blank')
      toast.success('Download started!')
    }
  }

  const PreviewModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-5/6 flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{selectedPdf?.title}</h3>
            <p className="text-sm text-gray-600">{selectedPdf?.description}</p>
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
            src={selectedPdf?.preview_link}
            className="w-full h-full border border-gray-300 rounded"
            title="PDF Preview"
          />
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={() => handleDownload(selectedPdf)}
            className="bg-gradient-primary text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
          >
            <FiDownload size={18} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      
      {/* Page Header */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
        Download PDFs
      </h1>

      {/* Search Bar */}
      <div className="relative mb-6">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search study materials..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Desktop Sidebar - Topics */}
        <div className="hidden lg:block w-64">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-bold text-gray-800 mb-4">Filter By Topic</h3>
            <div className="space-y-2">
              {topics.map(topic => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedTopic === topic
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          
          {/* Mobile Topics Slider */}
          <div className="lg:hidden mb-6">
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {topics.map(topic => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full font-medium transition-colors ${
                    selectedTopic === topic
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* PDFs Grid */}
          {filteredPdfs.length > 0 ? (
            <>
              {/* Desktop Grid - 4 columns */}
              <div className="hidden md:grid md:grid-cols-4 gap-4">
                {filteredPdfs.map(pdf => (
                  <div key={pdf.id} className="bg-white rounded-lg shadow-sm border p-4 card-hover">
                    <img 
                      src={getTopicImage(pdf.topic)}
                      alt={pdf.topic}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-bold text-gray-800 mb-2 text-sm line-clamp-2">
                      {pdf.title}
                    </h3>
                    <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                      {pdf.description}
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={() => handlePreview(pdf)}
                        className="w-full bg-blue-500 text-white py-2 px-3 rounded text-xs font-medium hover:bg-blue-600 transition-colors"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleDownload(pdf)}
                        className="w-full bg-green-500 text-white py-2 px-3 rounded text-xs font-medium hover:bg-green-600 transition-colors"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile List */}
              <div className="md:hidden space-y-4">
                {filteredPdfs.map(pdf => (
                  <div key={pdf.id} className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex space-x-4">
                      <img 
                        src={getTopicImage(pdf.topic)}
                        alt={pdf.topic}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 mb-1 text-sm">
                          {pdf.title}
                        </h3>
                        <p className="text-gray-600 text-xs mb-2">
                          {pdf.description}
                        </p>
                        <div className="text-xs text-gray-500 mb-3">
                          {pdf.file_size}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handlePreview(pdf)}
                            className="flex-1 bg-blue-500 text-white py-2 px-3 rounded text-xs font-medium hover:bg-blue-600 transition-colors"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => handleDownload(pdf)}
                            className="bg-green-500 text-white py-2 px-4 rounded text-xs font-medium hover:bg-green-600 transition-colors"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No PDFs found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && selectedPdf && <PreviewModal />}

      {/* Login Prompt */}
      {!user && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-blue-800 mb-2">
            Login Required
          </h3>
          <p className="text-blue-600">
            Please login to preview and download study materials
          </p>
        </div>
      )}
    </div>
  )
}

export default PDFs
