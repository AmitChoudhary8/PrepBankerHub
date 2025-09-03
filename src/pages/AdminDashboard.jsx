import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiFileText, FiBook, FiCalendar, FiMessageSquare, FiUsers, FiHome } from 'react-icons/fi';
import toast from 'react-hot-toast';
import PDFManagement from './admin/PDFManagement';
import MagazineManagement from './admin/MagazineManagement';
import ExamCalendarManagement from './admin/ExamCalendarManagement';
import RequestReview from './admin/RequestReview'; // NEW IMPORT

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check admin authentication on mount
  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      navigate('/admin-login');
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    toast.success('Successfully logged out');
    navigate('/');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome },
    { id: 'download-pdf', label: 'Download PDF', subtitle: 'Add & Manage', icon: FiFileText },
    { id: 'magazine', label: 'Magazine', subtitle: 'Add & Manage', icon: FiBook },
    { id: 'calendar', label: 'Exam Calendar & Notifications', subtitle: 'Add & Manage', icon: FiCalendar },
    { id: 'requests', label: 'User Requests & Suggestions', subtitle: 'Reply & Check', icon: FiMessageSquare },
    { id: 'users', label: 'User Management', icon: FiUsers }
  ];

  const renderMobileContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardContent />;
      case 'download-pdf':
        return <PDFManagement />;
      case 'magazine':
        return <MagazineManagement />;
      case 'calendar':
        return <ExamCalendarManagement />;
      case 'requests':
        return <RequestReview />; // CHANGED: Now loads actual RequestReview component
      case 'users':
        return <div className="p-4"><h2 className="text-xl font-bold">User Management</h2></div>;
      default:
        return <DashboardContent />;
    }
  };

  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <div className="flex items-center">
            <img src="/assets/logo.png" alt="PrepBankerHub" className="h-8 w-auto mr-2" />
            <span className="font-bold text-blue-600">Admin Panel</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-600 hover:text-red-600"
          >
            <FiLogOut size={20} />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed lg:relative lg:flex flex-col bg-white shadow-lg z-40 h-screen transition-all duration-300 ${
          sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-64'
        }`}>
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center px-6 py-4 border-b">
            <img src="/assets/logo.png" alt="PrepBankerHub" className="h-8 w-auto mr-2" />
            <span className="font-bold text-blue-600">Admin Panel</span>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false); // Close mobile menu
                }}
                className={`w-full flex items-center px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="mr-3 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  {item.subtitle && (
                    <div className="text-xs text-gray-500 mt-1">{item.subtitle}</div>
                  )}
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between bg-white shadow-sm px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-800">
              {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, Admin</span>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiLogOut className="mr-2" size={16} />
                Logout
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6">
            {/* Mobile: Single Section */}
            <div className="lg:hidden">
              {renderMobileContent()}
            </div>

            {/* Desktop: Grid Layout */}
            <div className="hidden lg:block">
              {activeSection === 'dashboard' ? <DashboardGrid /> : renderMobileContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// Dashboard Grid Component (Desktop)
function DashboardGrid() {
  const sections = [
    { id: 'download-pdf', title: 'Download PDF', subtitle: 'Add & Manage', icon: FiFileText, color: 'bg-blue-500' },
    { id: 'magazine', title: 'Magazine', subtitle: 'Add & Manage', icon: FiBook, color: 'bg-green-500' },
    { id: 'calendar', title: 'Exam Calendar & Notifications', subtitle: 'Add & Manage', icon: FiCalendar, color: 'bg-purple-500' },
    { id: 'requests', title: 'User Requests & Suggestions', subtitle: 'Reply & Check', icon: FiMessageSquare, color: 'bg-orange-500' },
    { id: 'users', title: 'User Management', subtitle: '', icon: FiUsers, color: 'bg-red-500' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl">
      {/* First Row: 2 sections */}
      <DashboardCard section={sections[0]} />
      <DashboardCard section={sections[1]} />
      {/* Second Row: 2 sections */}
      <DashboardCard section={sections[2]} />
      <DashboardCard section={sections[3]} />
      {/* Third Row: 1 section */}
      <div className="md:col-span-2">
        <DashboardCard section={sections[4]} />
      </div>
    </div>
  );
}

// Dashboard Card Component
function DashboardCard({ section }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex items-center mb-4">
        <div className={`p-3 rounded-lg ${section.color} text-white mr-4`}>
          <section.icon size={24} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
          {section.subtitle && (
            <p className="text-sm text-gray-500">{section.subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center text-blue-600 font-medium">
        <span>Manage →</span>
      </div>
    </div>
  );
}

// Dashboard Content Component
function DashboardContent() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-700 mb-2">Download PDF</h3>
          <p className="text-sm text-gray-500">Add & Manage PDF files</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-700 mb-2">Magazine</h3>
          <p className="text-sm text-gray-500">Add & Manage magazines</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-700 mb-2">Calendar & Notifications</h3>
          <p className="text-sm text-gray-500">Add & Manage exam dates</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-700 mb-2">User Requests</h3>
          <p className="text-sm text-gray-500">Reply & Check user suggestions</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-700 mb-2">User Management</h3>
          <p className="text-sm text-gray-500">Manage registered users</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
