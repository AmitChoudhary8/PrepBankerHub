import React from 'react'
import { FaInstagram, FaTelegramPlane, FaWhatsapp, FaEnvelope } from 'react-icons/fa'

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
          
          {/* Left Side - Founder Info */}
          <div className="text-center md:text-left">
            <p className="text-gray-700 font-medium">Founded by Amit Choudhary</p>
          </div>

          {/* Right Side - Social Media Icons */}
          <div className="flex space-x-6">
            <a 
              href="https://www.instagram.com/amit_sihag_08" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-pink-600 transition-colors duration-200"
              aria-label="Follow us on Instagram"
            >
              <FaInstagram size={24} />
            </a>
            <a 
              href="https://t.me/PrepBankerHub" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-500 transition-colors duration-200"
              aria-label="Join our Telegram channel"
            >
              <FaTelegramPlane size={24} />
            </a>
            <a 
              href="https://whatsapp.com/channel/0029VbAiJJH5Ui2OETD17z2Y" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-green-600 transition-colors duration-200"
              aria-label="Contact us on WhatsApp"
            >
              <FaWhatsapp size={24} />
            </a>
            <a 
              href="mailto:info.amitsihag@gmail.com" 
              className="text-gray-600 hover:text-red-600 transition-colors duration-200"
              aria-label="Send us an Email"
            >
              <FaEnvelope size={24} />
            </a>
          </div>
        </div>

        {/* About Website Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">About Website</h3>
            <p className="text-gray-600 text-sm max-w-3xl mx-auto mb-4">
              PrepBankerHub is your comprehensive platform for free banking exam preparation materials. 
              Get access to PDFs, practice sets, current affairs magazines, exam calendars, and more - 
              all designed to help you succeed in SBI PO, IBPS, RRB, and Insurance exams.
            </p>
            <p className="text-gray-500 text-xs">
              &copy; {new Date().getFullYear()} PrepBankerHub. All rights reserved. | 
              <span className="ml-1">
                All content is already available on the internet; we do not own it.
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
