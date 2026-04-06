import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuToggle={() => setMobileMenuOpen(o => !o)} />
      <div className="max-w-7xl mx-auto px-4 pt-16">
        <div className="flex gap-6 py-6">
          {/* Left Sidebar */}
          <aside className={`
            fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300
            lg:relative lg:translate-x-0 lg:w-64 lg:shadow-none lg:bg-transparent lg:flex-shrink-0
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <div className="pt-16 lg:pt-0">
              <Sidebar onClose={() => setMobileMenuOpen(false)} />
            </div>
          </aside>

          {/* Overlay */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
              onClick={() => setMobileMenuOpen(false)} />
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>

          {/* Right Sidebar */}
          <aside className="hidden xl:block w-72 flex-shrink-0">
            <RightSidebar />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Layout;
