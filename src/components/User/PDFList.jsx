import React, { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'

const PDFList = () => {
  const [pdfs, setPdfs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchPDFs()
  }, [])

  const fetchPDFs = async () => {
    try {
      const { data, error } = await supabase
        .from('pdfs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPdfs(data || [])
    } catch (error) {
      console.error('Error fetching PDFs:', error)
    }
    setLoading(false)
  }

  const filteredPDFs = pdfs.filter(pdf => {
    const matchesSearch = pdf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pdf.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || pdf.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleDownload = (pdf) => {
    if (pdf.download_url) {
      window.open(pdf.download_url, '_blank')
    } else {
      alert('Download link not available for this PDF')
    }
  }

  const handlePreview = (pdf) => {
    if (pdf.preview_url || pdf.download_url) {
      window.open(pdf.preview_url || pdf.download_url, '_blank')
    } else {
      alert('Preview not available for this PDF')
    }
  }

  if (loading) {
    return (
      <div className="p-2 md:p-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Study Materials</h2>
          
          {/* Mobile Loading Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-4 md:p-6 rounded-lg shadow-lg animate-pulse">
                <div className="h-16 w-16 bg-gray-200 rounded mx-auto mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-2 md:p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Study Materials</h2>
        
        {/* Mobile-Friendly Search & Filter */}
        <div className="bg-white p-3 md:p-4 rounded-lg shadow mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Search Input */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search PDFs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ fontSize: '16px' }} // Prevents zoom on iOS
              />
            </div>
            
            {/* Category Filter - Full width on mobile */}
            <div className="w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto p-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ fontSize: '16px' }}
              >
                <option value="all">All Categories</option>
                <option value="banking">Banking</option>
                <option value="reasoning">Reasoning</option>
                <option value="english">English</option>
                <option value="math">Mathematics</option>
                <option value="gk">General Knowledge</option>
              </select>
            </div>
          </div>
          
          {/* Results Count - Mobile Friendly */}
          <div className="mt-3 text-sm text-gray-600">
            {filteredPDFs.length} PDF{filteredPDFs.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* No PDFs Found */}
        {filteredPDFs.length === 0 && (
          <div className="text-center py-8 md:py-12">
            <div className="text-6xl md:text-8xl mb-4">📄</div>
            <h3 className="text-xl md:text-2xl font-bold mb-2">No PDFs Found</h3>
            <p className="text-gray-600 text-sm md:text-base">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Check back later for new study materials!'}
            </p>
          </div>
        )}

        {/* Mobile-Optimized PDF Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredPDFs.map((pdf) => (
            <div key={pdf.id} className="bg-white p-4 md:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              {/* PDF Header */}
              <div className="text-center mb-3 md:mb-4">
                <div className="text-4xl md:text-6xl text-red-500 mb-2">📄</div>
                <h3 className="text-sm md:text-lg font-bold text-gray-800 line-clamp-2">
                  {pdf.title}
                </h3>
              </div>
              
              {/* PDF Meta Info - Mobile Friendly */}
              <div className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    📚 {pdf.category}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {pdf.file_size ? (pdf.file_size / 1024 / 1024).toFixed(1) + ' MB' : 'N/A'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    📄 {pdf.pages || 'N/A'} pages
                  </span>
                  <span className="text-xs text-gray-500">
                    📅 {new Date(pdf.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                {pdf.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mt-2">
                    {pdf.description}
                  </p>
                )}
              </div>
              
              {/* Mobile-Friendly Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => handleDownload(pdf)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 text-sm md:text-base font-medium transition-colors"
                  style={{ minHeight: '44px' }} // iOS touch target
                >
                  📥 Download PDF
                </button>
                <button
                  onClick={() => handlePreview(pdf)}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 text-sm md:text-base transition-colors"
                  style={{ minHeight: '40px' }}
                >
                  👁️ Preview
                </button>
                
                {/* Bookmark Button (Optional) */}
                <button
                  onClick={() => {
                    const bookmarks = JSON.parse(localStorage.getItem('bookmarked_pdfs') || '[]')
                    const isBookmarked = bookmarks.includes(pdf.id)
                    
                    if (isBookmarked) {
                      const newBookmarks = bookmarks.filter(id => id !== pdf.id)
                      localStorage.setItem('bookmarked_pdfs', JSON.stringify(newBookmarks))
                      alert('Removed from bookmarks')
                    } else {
                      bookmarks.push(pdf.id)
                      localStorage.setItem('bookmarked_pdfs', JSON.stringify(bookmarks))
                      alert('Added to bookmarks')
                    }
                  }}
                  className="w-full bg-yellow-100 text-yellow-800 py-2 px-4 rounded-lg hover:bg-yellow-200 text-sm transition-colors"
                  style={{ minHeight: '40px' }}
                >
                  {JSON.parse(localStorage.getItem('bookmarked_pdfs') || '[]').includes(pdf.id) ? '⭐ Bookmarked' : '☆ Bookmark'}
                </button>
              </div>
              
              {/* Download Stats (Optional) */}
              {pdf.download_count && (
                <div className="mt-3 text-center">
                  <span className="text-xs text-gray-500">
                    📊 {pdf.download_count} downloads
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile-Friendly Load More (if needed) */}
        {filteredPDFs.length > 9 && (
          <div className="mt-6 md:mt-8 text-center">
            <button 
              className="bg-blue-600 text-white px-6 md:px-8 py-3 rounded-lg hover:bg-blue-700 text-sm md:text-base font-medium"
              style={{ minHeight: '44px' }}
            >
              Load More PDFs
            </button>
          </div>
        )}

        {/* Quick Actions Bar - Mobile Only */}
        <div className="fixed bottom-4 left-4 right-4 md:hidden">
          <div className="bg-white rounded-lg shadow-lg p-3 border">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {filteredPDFs.length} PDFs available
              </span>
              <div className="flex space-x-2">
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                >
                  ↑ Top
                </button>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-xs"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PDFList
