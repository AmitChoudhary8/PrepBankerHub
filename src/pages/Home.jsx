import React from 'react'
import { Link } from 'react-router-dom'
import { FiDownload, FiBookOpen, FiCalendar, FiMessageSquare } from 'react-icons/fi'

function Home() {
  return (
    <div className="min-h-screen">
      
      {/* Hero Section with Sharp Background Image + CSS Blur */}
      <section className="relative py-20 px-4 text-center text-white overflow-hidden">
        
        {/* Background Image with Blur Effect */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/assets/background.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'blur(3px)',
            transform: 'scale(1.1)' // Prevents white edges when blurred
          }}
        ></div>

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/70 to-green-600/70"></div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight drop-shadow-2xl">
            100% Completely FREE PDFs, PYQs,<br/>
            Practice Sets & More!
          </h1>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto py-16 px-4">
        
        {/* Desktop Layout - 4 columns */}
        <div className="hidden md:grid md:grid-cols-4 gap-6">
          
          {/* Download PDFs */}
          <Link 
            to="/PDFs" 
            className="bg-white rounded-xl p-6 shadow-lg card-hover border border-gray-100 group"
          >
            <div className="text-blue-500 mb-4 group-hover:scale-110 transition-transform duration-200">
              <FiDownload size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Download PDFs</h3>
            <p className="text-gray-600 text-sm">
              Free banking exam study materials including PYQs and practice sets
            </p>
          </Link>

          {/* Current Affairs Magazines */}
          <Link 
            to="/magazine" 
            className="bg-white rounded-xl p-6 shadow-lg card-hover border border-gray-100 group"
          >
            <div className="text-green-500 mb-4 group-hover:scale-110 transition-transform duration-200">
              <FiBookOpen size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Current Affairs Magazines</h3>
            <p className="text-gray-600 text-sm">
              Stay updated with monthly current affairs magazines
            </p>
          </Link>

          {/* Exam Calendars */}
          <Link 
            to="/calendar" 
            className="bg-white rounded-xl p-6 shadow-lg card-hover border border-gray-100 group"
          >
            <div className="text-purple-500 mb-4 group-hover:scale-110 transition-transform duration-200">
              <FiCalendar size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Exam Calendars</h3>
            <p className="text-gray-600 text-sm">
              Never miss important exam dates and notifications
            </p>
          </Link>

          {/* Request Form */}
          <Link 
            to="/request" 
            className="bg-white rounded-xl p-6 shadow-lg card-hover border border-gray-100 group"
          >
            <div className="text-orange-500 mb-4 group-hover:scale-110 transition-transform duration-200">
              <FiMessageSquare size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Request Form</h3>
            <p className="text-gray-600 text-sm">
              Request specific study materials and give suggestions
            </p>
          </Link>
        </div>

        {/* Mobile Layout - Single column */}
        <div className="md:hidden space-y-6">
          
          {/* Download PDFs */}
          <Link 
            to="/PDFs" 
            className="block bg-white rounded-xl p-6 shadow-lg card-hover border border-gray-100"
          >
            <div className="flex items-center space-x-4">
              <div className="text-blue-500">
                <FiDownload size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Download PDFs</h3>
                <p className="text-gray-600 text-sm">Free banking exam study materials</p>
              </div>
            </div>
          </Link>

          {/* Current Affairs Magazines */}
          <Link 
            to="/magazine" 
            className="block bg-white rounded-xl p-6 shadow-lg card-hover border border-gray-100"
          >
            <div className="flex items-center space-x-4">
              <div className="text-green-500">
                <FiBookOpen size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Current Affairs Magazines</h3>
                <p className="text-gray-600 text-sm">Monthly current affairs updates</p>
              </div>
            </div>
          </Link>

          {/* Exam Calendars */}
          <Link 
            to="/calendar" 
            className="block bg-white rounded-xl p-6 shadow-lg card-hover border border-gray-100"
          >
            <div className="flex items-center space-x-4">
              <div className="text-purple-500">
                <FiCalendar size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Exam Calendars</h3>
                <p className="text-gray-600 text-sm">Important exam dates and notifications</p>
              </div>
            </div>
          </Link>

          {/* Request Form */}
          <Link 
            to="/request" 
            className="block bg-white rounded-xl p-6 shadow-lg card-hover border border-gray-100"
          >
            <div className="flex items-center space-x-4">
              <div className="text-orange-500">
                <FiMessageSquare size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Request Form</h3>
                <p className="text-gray-600 text-sm">Request materials and give suggestions</p>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
