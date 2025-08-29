import React, { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'

const QuizManager = () => {
  const [quizzes, setQuizzes] = useState([])
  const [categories, setCategories] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState(null)
  const [showQuestionManager, setShowQuestionManager] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    description: '',
    time_limit: 30,
    difficulty: 'Medium'
  })

  const [questionData, setQuestionData] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    explanation: ''
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
      setCategories(data || [])
    }
  }

  const fetchQuestions = async (quizId) => {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('question_order', { ascending: true })
    
    if (error) {
      console.error('Error fetching questions:', error)
    } else {
      setQuestions(data || [])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingQuiz) {
        const { data, error } = await supabase
          .from('quizzes')
          .update(formData)
          .eq('id', editingQuiz.id)
          .select()
          
        if (error) {
          alert('Error updating quiz: ' + error.message)
        } else {
          alert('✅ Quiz updated successfully!')
          setEditingQuiz(null)
        }
      } else {
        const { data, error } = await supabase
          .from('quizzes')
          .insert([formData])
          .select()
          
        if (error) {
          alert('Error creating quiz: ' + error.message)
        } else {
          alert('✅ Quiz created successfully!')
          setShowAddForm(false)
        }
      }
      
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

  const handleQuestionSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const questionOrder = questions.length + 1
      const { data, error } = await supabase
        .from('quiz_questions')
        .insert([{
          ...questionData,
          quiz_id: selectedQuiz.id,
          question_order: questionOrder
        }])
        .select()
        
      if (error) {
        alert('Error adding question: ' + error.message)
      } else {
        alert('✅ Question added successfully!')
        setQuestionData({
          question_text: '',
          option_a: '',
          option_b: '',
          option_c: '',
          option_d: '',
          correct_answer: 'A',
          explanation: ''
        })
        setShowAddQuestion(false)
        fetchQuestions(selectedQuiz.id)
        fetchQuizzes() // Refresh to update question count
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('Unexpected error occurred')
    }
  }

  const handleManageQuestions = (quiz) => {
    setSelectedQuiz(quiz)
    setShowQuestionManager(true)
    fetchQuestions(quiz.id)
  }

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', questionId)
        
      if (error) {
        alert('Error deleting question: ' + error.message)
      } else {
        alert('Question deleted successfully!')
        fetchQuestions(selectedQuiz.id)
        fetchQuizzes() // Refresh to update question count
      }
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
    if (window.confirm('Are you sure you want to delete this quiz? This will also delete all its questions.')) {
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

  // Question Manager Modal
  if (showQuestionManager) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              Questions for: {selectedQuiz?.title}
            </h2>
            <button
              onClick={() => {
                setShowQuestionManager(false)
                setSelectedQuiz(null)
                setShowAddQuestion(false)
              }}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">Total Questions: {questions.length}</p>
            <button
              onClick={() => setShowAddQuestion(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              ➕ Add New Question
            </button>
          </div>

          {/* Add Question Form */}
          {showAddQuestion && (
            <form onSubmit={handleQuestionSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-bold mb-4">Add New Question</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Question Text</label>
                <textarea
                  value={questionData.question_text}
                  onChange={(e) => setQuestionData({...questionData, question_text: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  rows="3"
                  placeholder="Enter your question here..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Option A</label>
                  <input
                    type="text"
                    value={questionData.option_a}
                    onChange={(e) => setQuestionData({...questionData, option_a: e.target.value})}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Option A"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Option B</label>
                  <input
                    type="text"
                    value={questionData.option_b}
                    onChange={(e) => setQuestionData({...questionData, option_b: e.target.value})}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Option B"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Option C</label>
                  <input
                    type="text"
                    value={questionData.option_c}
                    onChange={(e) => setQuestionData({...questionData, option_c: e.target.value})}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Option C"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Option D</label>
                  <input
                    type="text"
                    value={questionData.option_d}
                    onChange={(e) => setQuestionData({...questionData, option_d: e.target.value})}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Option D"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Correct Answer</label>
                  <select
                    value={questionData.correct_answer}
                    onChange={(e) => setQuestionData({...questionData, correct_answer: e.target.value})}
                    className="w-full p-3 border rounded-lg"
                    required
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Explanation (Optional)</label>
                  <input
                    type="text"
                    value={questionData.explanation}
                    onChange={(e) => setQuestionData({...questionData, explanation: e.target.value})}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Explain the correct answer"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  ✅ Add Question
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddQuestion(false)
                    setQuestionData({
                      question_text: '',
                      option_a: '',
                      option_b: '',
                      option_c: '',
                      option_d: '',
                      correct_answer: 'A',
                      explanation: ''
                    })
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Questions List */}
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">Question {index + 1}</h4>
                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑️ Delete
                  </button>
                </div>
                <p className="mb-3 font-medium">{question.question_text}</p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <p className={`p-2 rounded text-sm ${question.correct_answer === 'A' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                    A) {question.option_a}
                  </p>
                  <p className={`p-2 rounded text-sm ${question.correct_answer === 'B' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                    B) {question.option_b}
                  </p>
                  <p className={`p-2 rounded text-sm ${question.correct_answer === 'C' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                    C) {question.option_c}
                  </p>
                  <p className={`p-2 rounded text-sm ${question.correct_answer === 'D' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                    D) {question.option_d}
                  </p>
                </div>
                <p className="text-sm text-green-700 font-medium">
                  ✅ Correct Answer: Option {question.correct_answer}
                </p>
                {question.explanation && (
                  <p className="text-sm text-gray-600 mt-2">
                    💡 Explanation: {question.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
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

      {/* Add/Edit Quiz Form - Same as before */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h3 className="text-xl font-bold mb-4">
            {editingQuiz ? 'Edit Quiz' : 'Add New Quiz'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Same form fields as before */}
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
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-900">{quiz.quiz_questions?.length || 0} questions</span>
                    <button
                      onClick={() => handleManageQuestions(quiz)}
                      className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700"
                    >
                      📝 Manage
                    </button>
                  </div>
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
