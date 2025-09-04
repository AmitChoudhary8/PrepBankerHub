import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

function Layout({ children, user, setUser, setShowAuthModal }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar 
        user={user} 
        setUser={setUser}
        setShowAuthModal={setShowAuthModal}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />

        {/* Main Content */}
        <main className="flex-1 md:ml-0">
          {children}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Layout;
