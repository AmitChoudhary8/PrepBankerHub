import React from 'react'
import { FaWhatsapp, FaTelegram, FaInstagram } from 'react-icons/fa'

const Footer = () => {
  const socialLinks = [
    {
      name: 'WhatsApp Channel',
      url: 'https://whatsapp.com/channel/0029VbAiJJH5Ui2OETD17z2Y',
      icon: FaWhatsapp,
      color: 'hover:text-green-500'
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/amit_sihag_08?igsh=cXJ0cDZncjNtczlv',
      icon: FaInstagram,
      color: 'hover:text-pink-500'
    },
    {
      name: 'Telegram',
      url: 'https://t.me/PrepBankerHub',
      icon: FaTelegram,
      color: 'hover:text-blue-500'
    }
  ]

  return (
    <footer className="bg-gray-800 text-white p-4 md:p-6 mt-8 md:mt-12">
      <div className="max-w-6xl mx-auto">
        {/* Social Media Links */}
        <div className="flex justify-center space-x-6 md:space-x-8 mb-4 md:mb-6">
          {socialLinks.map((social, index) => {
            const IconComponent = social.icon
            return (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-gray-300 ${social.color} transition-colors duration-300 transform hover:scale-110`}
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                <IconComponent className="text-2xl md:text-3xl p-1" />
              </a>
            )
          })}
        </div>
        
        {/* Copyright */}
        <div className="text-center border-t border-gray-700 pt-4">
          <p className="text-sm md:text-base text-gray-300">
            &copy; 2025 PrepBankerHub. All resources are completely free!
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
