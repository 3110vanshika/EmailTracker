import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { MdEmail, MdOpenInNew, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { FaCalendarAlt } from 'react-icons/fa';
import axios from 'axios';

const Timeline = ({ activeTab, setActiveTab }) => {
  const currentTab = activeTab || 'timeline';
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timelineEmails, setTimelineEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarView, setCalendarView] = useState('month'); // month, week

  // Get all days in the current month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get the first day of the week (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days in the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  // Fetch emails for the current month
  const fetchTimelineEmails = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user._id || 'demo-user';
      
      const response = await axios.get(`https://emailtracker-backend-api.onrender.com/api/email/user/${userId}`);
      
      if (response.data.success) {
        const emails = response.data.data;
        
        // Group emails by date
        const emailsByDate = emails.map(email => ({
          ...email,
          sentDate: new Date(email.sentDate)
        }));
        
        setTimelineEmails(emailsByDate);
      }
    } catch (error) {
      console.error('Error fetching timeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimelineEmails();
    
    // Real-time updates every 10 seconds
    const interval = setInterval(() => {
      fetchTimelineEmails();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Navigate to previous month
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Get emails for a specific date
  const getEmailsForDate = (date) => {
    if (!date) return [];
    
    return timelineEmails.filter(email => {
      const emailDate = new Date(email.sentDate);
      return emailDate.toDateString() === date.toDateString();
    });
  };

  // Get email count for a date
  const getEmailCount = (date) => {
    return getEmailsForDate(date).length;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'opened':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Opened</span>;
      case 'delivered':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Delivered</span>;
      case 'bounced':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Bounced</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Pending</span>;
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daysInMonth = getDaysInMonth(currentDate);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedEmails = selectedDate ? getEmailsForDate(selectedDate) : [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeTab={currentTab} setActiveTab={setActiveTab} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Email Timeline</h1>
                <p className="text-gray-600 mt-1">Calendar view of your email activity</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="text-gray-500 hover:text-gray-700 relative cursor-pointer">
                  <IoMdNotificationsOutline className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
                
                <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {JSON.parse(localStorage.getItem('user') || '{}').name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">Admin</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {JSON.parse(localStorage.getItem('user') || '{}').name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  </div>
                  
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

        <main className="flex-1 p-6 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar View */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={previousMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MdChevronLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <button
                      onClick={nextMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MdChevronRight className="w-6 h-6 text-gray-600" />
                    </button>
                  </div>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors text-sm font-medium"
                  >
                    Today
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {/* Day Headers */}
                  {dayNames.map(day => (
                    <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {daysInMonth.map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${index}`} className="h-24"></div>;
                    }
                    
                    const emailCount = getEmailCount(date);
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                    
                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedDate(date)}
                        className={`h-24 border rounded-lg p-2 cursor-pointer transition-all hover:shadow-md ${
                          isToday ? 'bg-blue-50 border-blue-500 border-2' : 'border-gray-200 hover:border-blue-400'
                        } ${isSelected ? 'bg-blue-100 border-blue-800 border-2' : ''}`}
                      >
                        <div className="flex flex-col h-full">
                          <span className={`text-sm font-semibold ${isToday ? 'text-blue-800' : 'text-gray-900'}`}>
                            {date.getDate()}
                          </span>
                          {emailCount > 0 && (
                            <div className="mt-auto flex flex-col space-y-1">
                              <div className="flex items-center space-x-1">
                                <MdEmail className={`w-3 h-3 ${isToday ? 'text-blue-800' : 'text-gray-600'}`} />
                                <span className="text-xs font-medium text-gray-700">{emailCount}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-800 rounded"></div>
                    <span className="text-sm text-gray-600">Today</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-100 rounded"></div>
                    <span className="text-sm text-gray-600">Selected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MdEmail className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Email Count</span>
                  </div>
                </div>
              </div>

              {/* Email List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Email Details</h3>
                  <FaCalendarAlt className="w-5 h-5 text-gray-400" />
                </div>
                
                {selectedDate ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    
                    {selectedEmails.length > 0 ? (
                      <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
                        {selectedEmails.map((email) => (
                          <div key={email._id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900 text-sm">{email.subject}</p>
                                <p className="text-xs text-gray-600 mt-1">{email.recipient}</p>
                              </div>
                              {getStatusBadge(email.status)}
                            </div>
                            
                            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                              <div className="flex items-center space-x-2">
                                <MdOpenInNew className="w-4 h-4" />
                                <span>{email.opens || 0} opens</span>
                              </div>
                              <span>{new Date(email.sentDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MdEmail className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">No emails on this date</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaCalendarAlt className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">Select a date to view emails</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Timeline;

