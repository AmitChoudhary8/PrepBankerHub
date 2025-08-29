import React, { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'

const QuizPlayer = ({ quiz, user, onComplete }) => {
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [timeTaken, setTimeTaken] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [loading, setLoading] = useState(true)
  const [quizStartTime, setQuizStartTime] = useState(null)

  useEffect(() => {
    fetchQuestions()
  }, [])

  useEffect(() => {
    // Timer for quiz time limit
    if (timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
        setTimeTaken(prev => prev + 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !showResult && questions.length > 0) {
      // Time's up! Submit automatically
      handleSubmit()
    }
  }, [timeLeft, showResult, questions.length])

  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quiz.id)
      .order('question_order', { ascending: true })

    if (error) {
      console.error('Error fetching questions:', error)
    } else {
      setQuestions(data || [])
      setTimeLeft(quiz.time_limit * 60) // Convert minutes to seconds
      setQuizStartTime(new Date())
    }
    setLoading(false)
  }

  const handleSelectAnswer = (answer) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIndex]: answer
    })
  }

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleSubmit = async () => {
    // Calculate score
    let correctCount = 0
    const answers = []

    questions.forEach((question, index) => {
      const userAnswer = selectedAnswers[index]
      const isCorrect = userAnswer === question.correct_answer
      if (isCorrect) correctCount++

      answers.push({
        question_id: question.id,
        selected_answer: userAnswer,
        is_correct: isCorrect
      })
    })

    const finalScore = Math.round((correctCount / questions.length) * 100)
    const finalTimeTaken = Math.round((new Date() - quizStartTime) / 1000 / 60) // in minutes

    try {
      // Save quiz attempt
      const { data: attemptData, error: attemptError } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          quiz_id: quiz.id,
          score: finalScore,
          total_questions: questions.length,
          time_taken: finalTimeTaken,
          completed_at: new Date()
        })
        .select()

      if (attemptError) {
        console.error('Error saving attempt:', attemptError)
        return
      }

      // Save individual answers
      const answersToSave = answers.map(answer => ({
        ...answer,
        attempt_id: attemptData[0].id
      }))

      const { error: answersError } = await supabase
        .from('quiz_answers')
        .insert(answersToSave)

      if (answersError) {
        console.error('Error saving answers:', answersError)
      }

      // Get ranking
      const { data: rankingData } = await supabase
        .from('quiz_attempts')
        .select('score')
        .eq('quiz_id', quiz.id)
        .order('score', { ascending: false })

      let rank = 1
      if (rankingData) {
        rank = rankingData.findIndex(attempt => attempt.score <= finalScore) + 1
        if (rank === 0) rank = rankingData.length + 1
      }

      setShowResult({
        score: finalScore,
        correctAnswers: correctCount,
        totalQuestions: questions.length,
        timeTaken: finalTimeTaken,
        rank: rank,
        totalAttempts: rankingData?.length || 1
      })

    } catch (error) {
      console.error('Error submitting quiz:', error)
    }
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return <div className="text-center p-8">Loading quiz...</div>
  }

  if (showResult) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-6">🎉 Quiz Complete!</h2>
          
          {/* Score Circle */}
          <div className="mb-6">
            <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full text-4xl font-bold ${
              showResult.score >= 80 ? 'bg-green-100 text-green-800' :
              showResult.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {showResult.score}%
            </div>
          </div>

          {/* Results Details */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{showResult.correctAnswers}</p>
              <p className="text-gray-600">Correct Answers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{showResult.timeTaken}</p>
              <p className="text-gray-600">Minutes Taken</p>
            </div>
          </div>

          {/* Ranking */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg mb-6">
            <h3 className="text-xl font-bold mb-2">🏆 Your Ranking</h3>
            <p className="text-lg">
              Rank #{showResult.rank} out of {showResult.totalAttempts} attempts
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Take Again
            </button>
            <button
              onClick={onComplete}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Quiz Header */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{quiz.title}</h2>
            <p className="text-gray-600">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-blue-600'}`}>
              ⏰ {formatTime(timeLeft)}
            </div>
            <p className="text-sm text-gray-600">Time Remaining</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{width: `${((currentIndex + 1) / questions.length) * 100}%`}}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-xl font-semibold mb-6">{currentQuestion.question_text}</h3>
        
        <div className="space-y-3">
          {['A', 'B', 'C', 'D'].map(option => (
            <label 
              key={option}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                selectedAnswers[currentIndex] === option 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="answer"
                value={option}
                checked={selectedAnswers[currentIndex] === option}
                onChange={() => handleSelectAnswer(option)}
                className="mr-3"
              />
              <span className="font-medium mr-3">{option}.</span>
              <span>{currentQuestion[`option_${option.toLowerCase()}`]}</span>
            </label>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <button
            onClick={handleNext}
            disabled={!selectedAnswers[currentIndex]}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentIndex + 1 === questions.length ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default QuizPlayer
