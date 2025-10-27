import { useState } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import { IoMdNotificationsOutline } from 'react-icons/io';

const Reports = ({ activeTab, setActiveTab }) => {
  // Use passed props or default to reports
  const currentTab = activeTab || 'reports';
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activeTab={currentTab} setActiveTab={setActiveTab} />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-►00">Reports</h1>
                <p className="text-gray-600 mt-1">Generate and view detailed reports</p>
              </div>
              
              {/* User Profile Section */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="text-gray-500 hover:text-gray-700 relative cursor-pointer">
                  <IoMdNotificationsOutline className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
                
                {/* User Profile Dropdown */}
                <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {JSON.parse(localStorage.getItem('user') || '{}').name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">Admin</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {JSON.parse(localStorage.getItem('user') || '{}').name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      localStorage.removeItem('user');
                      window.location.href = '/signin';
                    }}
                    className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                    title="Logout"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Reports Coming Soon</h3>
              <p className="text-gray-500">This feature is under development.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;
