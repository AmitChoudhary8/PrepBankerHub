import React, { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'

const PDFManager = () => {
  const [pdfs, setPdfs] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPdf, setEditingPdf] = useState(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    google_drive_url: '',
    direct_download_url: '',
    category: '',
    exam_type: '',
    file_size: ''
  })

  useEffect(() => {
    fetchPDFs()
  }, [])

  const fetchPDFs = async () => {
    const { data, error } = await supabase
      .from('pdfs')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching PDFs:', error)
    } else {
      setPdfs(data || [])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Convert Google Drive share URL to direct download URL
      const directUrl = formData.google_drive_url.includes('/file/d/') 
        ? formData.google_drive_url.replace('/view?usp=sharing', '').replace('https://drive.google.com/file/d/', 'https://drive.google.com/uc?id=') + '&export=download'
        : formData.direct_download_url

      const pdfData = {
        ...formData,
        direct_download_url: directUrl
      }
      
      if (editingPdf) {
        const { data, error } = await supabase
          .from('pdfs')
          .update(pdfData)
          .eq('id', editingPdf.id)
          .select()
          
        if (error) {
          console.error('Update error:', error)
          alert('Error updating PDF: ' + error.message)
        } else {
          alert('✅ PDF updated successfully!')
          setEditingPdf(null)
          console.log('Updated data:', data)
        }
      } else {
        const { data, error } = await supabase
          .from('pdfs')
          .insert([pdfData])
          .select()
          
        if (error) {
          console.error('Insert error:', error)
          alert('Error adding PDF: ' + error.message)
        } else {
          alert('✅ PDF added successfully!')
          setShowAddForm(false)
          console.log('Inserted data:', data)
        }
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        google_drive_url: '',
        direct_download_url: '',
        category: '',
        exam_type: '',
        file_size: ''
      })
      fetchPDFs()
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('Unexpected error occurred')
    }
  }

  const handleDelete = async (pdfId) => {
    if (window.confirm('Are you sure you want to delete this PDF?')) {
      const { error } = await supabase
        .from('pdfs')
        .delete()
        .eq('id', pdfId)
        
      if (error) {
        alert('Error deleting PDF: ' + error.message)
      } else {
        alert('PDF deleted successfully!')
        fetchPDFs()
      }
    }
  }

  const toggleActive = async (pdf) => {
    const { error } = await supabase
      .from('pdfs')
      .update({ is_active: !pdf.is_active })
      .eq('id', pdf.id)
      
    if (!error) {
      fetchPDFs()
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">PDF Management</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          {showAddForm ? '❌ Cancel' : '📄 Add New PDF'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h3 className="text-xl font-bold mb-4">
            {editingPdf ? 'Edit PDF' : 'Add New PDF'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">PDF Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Enter PDF title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                rows="3"
                placeholder="Enter PDF description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Google Drive Share URL</label>
              <input
                type="url"
                value={formData.google_drive_url}
                onChange={(e) => setFormData({...formData, google_drive_url: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="https://drive.google.com/file/d/FILE_ID/view?usp=sharing"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                📌 Upload PDF to Google Drive and paste the shareable link here
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Study Material">Study Material</option>
                  <option value="Practice Sets">Practice Sets</option>
                  <option value="Previous Papers">Previous Papers</option>
                  <option value="Current Affairs">Current Affairs</option>
                  <option value="Mock Tests">Mock Tests</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Exam Type</label>
                <select
                  value={formData.exam_type}
                  onChange={(e) => setFormData({...formData, exam_type: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Exam Type</option>
                  <option value="SBI PO">SBI PO</option>
                  <option value="IBPS PO">IBPS PO</option>
                  <option value="RRB PO">RRB PO</option>
                  <option value="SBI Clerk">SBI Clerk</option>
                  <option value="IBPS Clerk">IBPS Clerk</option>
                  <option value="All Banking Exams">All Banking Exams</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">File Size (e.g., 2.5 MB)</label>
              <input
                type="text"
                value={formData.file_size}
                onChange={(e) => setFormData({...formData, file_size: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 2.5 MB"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                {editingPdf ? '✏️ Update PDF' : '📄 Add PDF'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingPdf(null)
                  setFormData({
                    title: '',
                    description: '',
                    google_drive_url: '',
                    direct_download_url: '',
                    category: '',
                    exam_type: '',
                    file_size: ''
                  })
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PDF List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Downloads</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pdfs.map(pdf => (
              <tr key={pdf.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{pdf.title}</div>
                  <div className="text-sm text-gray-500">{pdf.description}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{pdf.category}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{pdf.exam_type}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{pdf.file_size}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{pdf.download_count}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleActive(pdf)}
                    className={`px-2 py-1 rounded-full text-xs ${
                      pdf.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {pdf.is_active ? '✅ Active' : '❌ Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <a
                    href={pdf.direct_download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    👁️ Preview
                  </a>
                  <button
                    onClick={() => {
                      setEditingPdf(pdf)
                      setFormData(pdf)
                      setShowAddForm(true)
                    }}
                    className="text-green-600 hover:text-green-800"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(pdf.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PDFManager
