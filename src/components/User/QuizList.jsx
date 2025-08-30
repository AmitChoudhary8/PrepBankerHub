import React, { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
import ShareButton from '../ShareButton'

const QuizList = ({ onStartQuiz }) => {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setQuizzes(data || [])
    } catch (error) {
      console.error('Error fetching quizzes:', error)
    }
    setLoading(false)
  }

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || quiz.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="p-2 md:p-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">📚 Available Quizzes</h2>
          
          {/* Mobile Loading Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-4 md:p-6 rounded-lg shadow-lg animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
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
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">📚 Available Quizzes</h2>
        
        {/* Mobile-Friendly Search & Filter */}
        <div className="bg-white p-3 md:p-4 rounded-lg shadow mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Search Input */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Search quizzes..."
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
            {filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? 'es' : ''} found
          </div>
        </div>

        {/* No Quizzes Found */}
        {filteredQuizzes.length === 0 && (
          <div className="text-center py-8 md:py-12">
            <div className="text-6xl md:text-8xl mb-4">📚</div>
            <h3 className="text-xl md:text-2xl font-bold mb-2">No Quizzes Found</h3>
            <p className="text-gray-600 text-sm md:text-base">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Check back later for new quizzes!'}
            </p>
          </div>
        )}

        {/* Mobile-Optimized Quiz Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white p-4 md:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              {/* Quiz Header with Share Button */}
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 line-clamp-2 flex-1 pr-2">
                    {quiz.title}
                  </h3>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <ShareButton 
                      itemType="quiz" 
                      itemId={quiz.id} 
                      itemTitle={quiz.title}
                    />
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-xs font-medium">
                      {quiz.category}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm md:text-base text-gray-600 line-clamp-3 mb-3">
                  {quiz.description || 'Test your knowledge with this quiz'}
                </p>
              </div>

              {/* Quiz Stats - Mobile Friendly */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs md:text-sm text-gray-500">
                  <span className="flex items-center">
                    ❓ {quiz.questions?.length || 0} Questions
                  </span>
                  <span className="flex items-center">
                    ⏱️ {quiz.time_limit || 30} min
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs md:text-sm text-gray-500">
                  <span className="flex items-center">
                    📊 {quiz.difficulty || 'Medium'}
                  </span>
                  <span className="flex items-center">
                    📅 {new Date(quiz.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Progress Bar (if quiz has been attempted) */}
              {quiz.progress && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">Progress</span>
                    <span className="text-xs text-gray-600">{quiz.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all" 
                      style={{ width: `${quiz.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Action Buttons - Mobile Optimized */}
              <div className="space-y-2">
                <button
                  onClick={() => onStartQuiz(quiz)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm md:text-base"
                  style={{ minHeight: '44px' }} // iOS touch target
                >
                  {quiz.progress ? '📝 Continue Quiz' : '🚀 Start Quiz'}
                </button>
                
                {/* Preview Button - Optional */}
                <button
                  onClick={() => {
                    alert(`Quiz: ${quiz.title}\n\nQuestions: ${quiz.questions?.length || 0}\nTime Limit: ${quiz.time_limit || 30} minutes\nDifficulty: ${quiz.difficulty || 'Medium'}\n\n${quiz.description || 'No description available'}`)
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  style={{ minHeight: '40px' }}
                >
                  👁️ Preview Info
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile-Friendly Pagination (if needed) */}
        {filteredQuizzes.length > 9 && (
          <div className="mt-6 md:mt-8 text-center">
            <button className="bg-blue-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-blue-700 text-sm md:text-base">
              Load More Quizzes
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuizList
