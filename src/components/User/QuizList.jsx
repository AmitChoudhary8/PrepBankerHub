import React, { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'

const QuizList = ({ onStartQuiz }) => {
  const [quizzes, setQuizzes] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuizzes()
    fetchCategories()
  }, [selectedCategory])

  const fetchQuizzes = async () => {
    let query = supabase
      .from('quizzes')
      .select(`
        *,
        quiz_categories (name),
        quiz_questions (id)
      `)
      .eq('is_active', true)

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching quizzes:', error)
    } else {
      setQuizzes(data || [])
    }
    setLoading(false)
  }

  const fetchCategories = async () => {
    const { data } = await supabase.from('quiz_categories').select('*')
    setCategories(data || [])
  }

  if (loading) return <p className="text-center p-8">Loading quizzes...</p>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Available Quizzes</h2>
        
        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 border rounded-lg"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map(quiz => (
          <div key={quiz.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2">{quiz.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{quiz.description}</p>
              
              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>📚 {quiz.quiz_categories?.name}</span>
                <span>⏱️ {quiz.time_limit} min</span>
              </div>
              
              <div className="flex justify-between items-center text-sm mb-4">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  quiz.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                  quiz.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {quiz.difficulty}
                </span>
                <span className="text-gray-600">
                  {quiz.quiz_questions?.length || 0} Questions
                </span>
              </div>
            </div>
            
            <button
              onClick={() => onStartQuiz(quiz)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              disabled={!quiz.quiz_questions?.length}
            >
              {quiz.quiz_questions?.length ? 'Start Quiz' : 'No Questions Available'}
            </button>
          </div>
        ))}
      </div>

      {quizzes.length === 0 && (
        <div className="text-center p-12">
          <p className="text-gray-500 text-lg">No quizzes available in this category.</p>
        </div>
      )}
    </div>
  )
}

export default QuizList
