import React, { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'

const QuizManager = () => {
  const [quizzes, setQuizzes] = useState([])
  const [categories, setCategories] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState(null)
  
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    description: '',
    time_limit: 30,
    difficulty: 'Medium'
  })

  useEffect(() => {
    fetchQuizzes()
    fetchCategories()
  }, [])

  const fetchQuizzes = async () => {
    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        quiz_categories (name),
        quiz_questions (id)
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching quizzes:', error)
    } else {
      setQuizzes(data || [])
    }
  }

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('quiz_categories')
      .select('*')
    
    if (error) {
      console.error('Error fetching categories:', error)
    } else {
      console.log('Categories loaded:', data)
      setCategories(data || [])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingQuiz) {
        // Update existing quiz
        const { data, error } = await supabase
          .from('quizzes')
          .update(formData)
          .eq('id', editingQuiz.id)
          .select()
          
        if (error) {
          console.error('Update error:', error)
          alert('Error updating quiz: ' + error.message)
        } else {
          alert('✅ Quiz updated successfully!')
          setEditingQuiz(null)
          console.log('Updated data:', data)
        }
      } else {
        // Create new quiz
        const { data, error } = await supabase
          .from('quizzes')
          .insert([formData])
          .select()
          
        if (error) {
          console.error('Insert error:', error)
          alert('Error creating quiz: ' + error.message)
        } else {
          alert('✅ Quiz created successfully!')
          setShowAddForm(false)
          console.log('Inserted data:', data)
        }
      }
      
      // Reset form and refresh data
      setFormData({
        title: '',
        category_id: '',
        description: '',
        time_limit: 30,
        difficulty: 'Medium'
      })
      fetchQuizzes()
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('Unexpected error occurred')
    }
  }

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz)
    setFormData({
      title: quiz.title,
      category_id: quiz.category_id,
      description: quiz.description,
      time_limit: quiz.time_limit,
      difficulty: quiz.difficulty
    })
    setShowAddForm(true)
  }

  const handleDelete = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId)
        
      if (error) {
        alert('Error deleting quiz: ' + error.message)
      } else {
        alert('Quiz deleted successfully!')
        fetchQuizzes()
      }
    }
  }

  const toggleActive = async (quiz) => {
    const { error } = await supabase
      .from('quizzes')
      .update({ is_active: !quiz.is_active })
      .eq('id', quiz.id)
      
    if (!error) {
      fetchQuizzes()
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Quiz Management</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showAddForm ? '❌ Cancel' : '➕ Add New Quiz'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h3 className="text-xl font-bold mb-4">
            {editingQuiz ? 'Edit Quiz' : 'Add New Quiz'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Quiz Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quiz title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Enter quiz description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Time Limit (minutes)</label>
                <input
                  type="number"
                  value={formData.time_limit}
                  onChange={(e) => setFormData({...formData, time_limit: parseInt(e.target.value)})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="5"
                  max="180"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                {editingQuiz ? '✏️ Update Quiz' : '➕ Create Quiz'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingQuiz(null)
                  setFormData({
                    title: '',
                    category_id: '',
                    description: '',
                    time_limit: 30,
                    difficulty: 'Medium'
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

      {/* Quiz List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Questions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {quizzes.map(quiz => (
              <tr key={quiz.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                  <div className="text-sm text-gray-500">{quiz.description}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {quiz.quiz_categories?.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {quiz.quiz_questions?.length || 0} questions
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {quiz.time_limit} min
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleActive(quiz)}
                    className={`px-2 py-1 rounded-full text-xs ${
                      quiz.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {quiz.is_active ? '✅ Active' : '❌ Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button
                    onClick={() => handleEdit(quiz)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(quiz.id)}
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

export default QuizManager
