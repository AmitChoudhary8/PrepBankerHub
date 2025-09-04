import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, FiDownload, FiBookOpen, FiCalendar, FiMessageSquare, FiShield,
  FiChevronDown, FiChevronRight, FiX, FiFileText, FiBell, FiEdit, FiHelpCircle
} from 'react-icons/fi';

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState(['study', 'exam', 'support']);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const navigationItems = [
    {
      id: 'home',
      title: 'Home',
      icon: FiHome,
      path: '/',
      single: true
    },
    {
      id: 'study',
      title: 'Study Materials',
      icon: FiBookOpen,
      children: [
        { name: 'Download PDFs', path: '/PDFs', icon: FiDownload },
        { name: 'Current Affairs Magazines', path: '/magazine', icon: FiFileText }
      ]
    },
    {
      id: 'exam',
      title: 'Exam Management',
      icon: FiCalendar,
      children: [
        { name: 'Exam Calendar', path: '/calendar', icon: FiCalendar },
        { name: 'Notifications', path: '/notifications', icon: FiBell }
      ]
    },
    {
      id: 'support',
      title: 'Support',
      icon: FiHelpCircle,
      children: [
        { name: 'Request Form', path: '/request', icon: FiMessageSquare },
        { name: 'Terms & Conditions', path: '/termandconditions', icon: FiShield }
      ]
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLinkClick = () => {
    // Mobile पर sidebar close करें
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:transform-none flex flex-col
      `}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Navigation</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 md:hidden"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navigationItems.map((section) => (
              <li key={section.id}>
                {section.single ? (
                  // Single Link
                  <Link
                    to={section.path}
                    onClick={handleLinkClick}
                    className={`
                      flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isActive(section.path) 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                      }
                    `}
                  >
                    <section.icon size={18} className="mr-3" />
                    {section.title}
                  </Link>
                ) : (
                  // Section with Children
                  <>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                    >
                      <div className="flex items-center">
                        <section.icon size={18} className="mr-3" />
                        {section.title}
                      </div>
                      {expandedSections.includes(section.id) ? (
                        <FiChevronDown size={16} />
                      ) : (
                        <FiChevronRight size={16} />
                      )}
                    </button>
                    
                    {expandedSections.includes(section.id) && (
                      <ul className="ml-6 mt-2 space-y-1">
                        {section.children.map((item) => (
                          <li key={item.path}>
                            <Link
                              to={item.path}
                              onClick={handleLinkClick}
                              className={`
                                flex items-center px-3 py-2 rounded-lg text-sm transition-colors
                                ${isActive(item.path)
                                  ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                                }
                              `}
                            >
                              <item.icon size={16} className="mr-3" />
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}

export default Sidebar;
