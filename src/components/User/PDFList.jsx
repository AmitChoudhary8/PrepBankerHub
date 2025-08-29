import React, { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'

const PDFList = () => {
  const [pdfs, setPdfs] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedExamType, setSelectedExamType] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPDFs()
    fetchCategories()
  }, [selectedCategory, selectedExamType, searchTerm])

  const fetchPDFs = async () => {
    let query = supabase
      .from('pdfs')
      .select('*')
      .eq('is_active', true)

    if (selectedCategory) {
      query = query.eq('category', selectedCategory)
    }
    
    if (selectedExamType) {
      query = query.eq('exam_type', selectedExamType)
    }

    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching PDFs:', error)
    } else {
      setPdfs(data || [])
    }
    setLoading(false)
  }

  const fetchCategories = async () => {
    // Get unique categories and exam types from existing PDFs
    const { data } = await supabase
      .from('pdfs')
      .select('category, exam_type')
      .eq('is_active', true)

    if (data) {
      const uniqueCategories = [...new Set(data.map(pdf => pdf.category).filter(Boolean))]
      const uniqueExamTypes = [...new Set(data.map(pdf => pdf.exam_type).filter(Boolean))]
      
      setCategories({
        categories: uniqueCategories,
        examTypes: uniqueExamTypes
      })
    }
  }

  const handleDownload = async (pdf) => {
    try {
      // Update download count
      const { error } = await supabase
        .from('pdfs')
        .update({ download_count: pdf.download_count + 1 })
        .eq('id', pdf.id)

      if (error) {
        console.error('Error updating download count:', error)
      }

      // Open PDF in new tab
      window.open(pdf.direct_download_url || pdf.google_drive_url, '_blank')
      
      // Refresh PDF list to show updated download count
      fetchPDFs()
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Error downloading PDF. Please try again.')
    }
  }

  const resetFilters = () => {
    setSelectedCategory('')
    setSelectedExamType('')
    setSearchTerm('')
  }

  if (loading) {
    return <div className="text-center p-8">Loading PDFs...</div>
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-6">📄 PDF Downloads</h2>
        
        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2">Search PDFs</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or description..."
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.categories?.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Exam Type Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Exam Type</label>
              <select
                value={selectedExamType}
                onChange={(e) => setSelectedExamType(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Exam Types</option>
                {categories.examTypes?.map(examType => (
                  <option key={examType} value={examType}>{examType}</option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600"
              >
                🔄 Reset Filters
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Found {pdfs.length} PDF{pdfs.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* PDF Grid */}
        {pdfs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pdfs.map(pdf => (
              <div key={pdf.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-2 line-clamp-2">{pdf.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">{pdf.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {pdf.category && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        📚 {pdf.category}
                      </span>
                    )}
                    {pdf.exam_type && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        🎯 {pdf.exam_type}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <span>📊 {pdf.file_size || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <span>⬇️ {pdf.download_count || 0} downloads</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownload(pdf)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    📥 Download PDF
                  </button>
                  
                  {pdf.google_drive_url && (
                    <button
                      onClick={() => window.open(pdf.google_drive_url, '_blank')}
                      className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      👁️ Preview
                    </button>
                  )}
                </div>
                
                <div className="text-xs text-gray-400 mt-3">
                  Added: {new Date(pdf.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-12">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-bold mb-2">No PDFs Found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or check back later for new uploads.</p>
          </div>
        )}
      </div>

      {/* Statistics Section */}
      {pdfs.length > 0 && (
        <div className="bg-gray-100 p-6 rounded-lg">
          <h3 className="text-lg font-bold mb-4">📊 Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{pdfs.length}</p>
              <p className="text-gray-600 text-sm">Total PDFs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{categories.categories?.length || 0}</p>
              <p className="text-gray-600 text-sm">Categories</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{categories.examTypes?.length || 0}</p>
              <p className="text-gray-600 text-sm">Exam Types</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {pdfs.reduce((sum, pdf) => sum + (pdf.download_count || 0), 0)}
              </p>
              <p className="text-gray-600 text-sm">Total Downloads</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PDFList
