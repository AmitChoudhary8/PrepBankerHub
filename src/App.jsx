import React, { useState } from 'react'
import './App.css'

function App() {
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">PrepBankerHub</h1>
            <span className="text-blue-200">🏦</span>
          </div>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors"
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4">
            Welcome to PrepBankerHub
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Complete Banking Exam Preparation Platform
          </p>
          
          {/* Free Banner */}
          <div className="mt-6 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
            <h3 className="text-2xl font-bold">
              👉 All Resources on this Website are 100% Free
            </h3>
            <p className="mt-2">Access PDFs, Quizzes, and Study Materials</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-bold mb-2">📚 Practice Quizzes</h3>
            <p className="text-gray-600 dark:text-gray-300">Test your knowledge with interactive quizzes</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-bold mb-2">📄 PDF Downloads</h3>
            <p className="text-gray-600 dark:text-gray-300">Download study materials and notes</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-bold mb-2">📅 Exam Calendar</h3>
            <p className="text-gray-600 dark:text-gray-300">Track important exam dates</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 mt-12">
        <div className="text-center">
          <p>&copy; 2025 PrepBankerHub. All resources are completely free!</p>
        </div>
      </footer>
    </div>
  )
}

export default App
