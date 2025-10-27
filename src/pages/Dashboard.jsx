import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { MdEmail, MdOpenInNew, MdSchedule } from 'react-icons/md';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    emailsSent: 0,
    emailsOpened: 0,
    openRate: 0,
    delivered: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentEmails, setRecentEmails] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [dailyStats, setDailyStats] = useState([]);

  // Fetch real-time data from API
  const fetchDashboardData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user._id || 'demo-user';
      
      console.log('Fetching data for userId:', userId);
      const response = await axios.get(`https://emailtracker-backend-api.onrender.com/api/email/user/${userId}`);
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        const emails = response.data.data || [];
        console.log('Emails fetched:', emails.length);
        
        // Calculate stats
        const totalEmails = emails.length;
        const openedEmails = emails.filter(e => e.status === 'opened').length;
        const deliveredEmails = emails.filter(e => e.delivered).length;
        const openRate = totalEmails > 0 ? ((openedEmails / totalEmails) * 100).toFixed(1) : 0;
        
        setStats({
          emailsSent: totalEmails,
          emailsOpened: openedEmails,
          openRate: parseFloat(openRate),
          delivered: deliveredEmails
        });
        
        console.log('Stats updated:', {
          emailsSent: totalEmails,
          emailsOpened: openedEmails,
          openRate: parseFloat(openRate),
          delivered: deliveredEmails
        });

        // Get recent emails (last 5)
        const recent = emails
          .sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate))
          .slice(0, 5);
        setRecentEmails(recent);

        // Status distribution for pie chart
        const statusCount = emails.reduce((acc, email) => {
          acc[email.status] = (acc[email.status] || 0) + 1;
          return acc;
        }, {});
        
        const statusData = [
          { name: 'Delivered', value: statusCount['delivered'] || 0, color: '#3B82F6' },
          { name: 'Opened', value: statusCount['opened'] || 0, color: '#10B981' },
          { name: 'Pending', value: statusCount['pending'] || 0, color: '#6B7280' },
          { name: 'Bounced', value: statusCount['bounced'] || 0, color: '#EF4444' }
        ];
        setStatusDistribution(statusData);

        // Daily stats for last 7 days
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const dayEmails = emails.filter(e => {
            const emailDate = new Date(e.sentDate).toISOString().split('T')[0];
            return emailDate === dateStr;
          });
          
          last7Days.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            sent: dayEmails.length,
            opened: dayEmails.filter(e => e.status === 'opened').length,
            delivered: dayEmails.filter(e => e.delivered).length
          });
        }
        setDailyStats(last7Days);
      } else {
        console.log('API returned success: false');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchDashboardData();
    
    // Real-time updates every 10 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);



  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Real-time email tracking and analytics</p>
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
                    <div className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center">
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
          <div>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Emails Sent */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Emails Sent</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.emailsSent}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MdEmail className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Emails Opened */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Emails Opened</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.emailsOpened}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <MdOpenInNew className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                {/* Open Rate */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Open Rate</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.openRate}%</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Delivered */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Delivered</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.delivered}</p>
                    </div>
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <MdSchedule className="w-6 h-6 text-indigo-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Daily Stats Line Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">7-Day Email Activity</h3>
                    <p className="text-sm text-gray-600 mt-1">Send and open trends</p>
                  </div>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
                    </div>
                  ) : dailyStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dailyStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="sent" stroke="#3B82F6" name="Sent" strokeWidth={2} />
                        <Line type="monotone" dataKey="opened" stroke="#10B981" name="Opened" strokeWidth={2} />
                        <Line type="monotone" dataKey="delivered" stroke="#6366F1" name="Delivered" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-12">
                      <MdEmail className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">No data available</p>
                    </div>
                  )}
                </div>

                {/* Status Distribution Pie Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Email Status Distribution</h3>
                    <p className="text-sm text-gray-600 mt-1">Current email status breakdown</p>
                  </div>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
                    </div>
                  ) : statusDistribution.some(s => s.value > 0) ? (
                    <div>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={statusDistribution.filter(s => s.value > 0)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {statusDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-4 flex flex-wrap justify-center gap-4">
                        {statusDistribution.filter(s => s.value > 0).map((status, index) => (
                          <div key={index} className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: status.color }}></div>
                            <span className="text-sm text-gray-600">{status.name}: {status.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MdEmail className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">No emails sent yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Emails */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Emails</h3>
                  <p className="text-sm text-gray-600 mt-1">Latest email activity</p>
                </div>
                
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
                  </div>
                ) : recentEmails.length > 0 ? (
                  <div className="p-6">
                    <div className="space-y-4">
                      {recentEmails.map((email) => (
                        <div key={email._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-400 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              email.status === 'opened' ? 'bg-green-100' :
                              email.status === 'delivered' ? 'bg-blue-100' :
                              'bg-gray-100'
                            }`}>
                              <MdEmail className={`w-6 h-6 ${
                                email.status === 'opened' ? 'text-green-600' :
                                email.status === 'delivered' ? 'text-blue-600' :
                                'text-gray-600'
                              }`} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{email.subject}</p>
                              <p className="text-xs text-gray-600 mt-1">{email.recipient}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(email.sentDate).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {email.status === 'opened' && (
                              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                Opened
                              </span>
                            )}
                            {email.status === 'delivered' && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                Delivered
                              </span>
                            )}
                            {email.status === 'pending' && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">
                                Pending
                              </span>
                            )}
                            {email.opens > 0 && (
                              <p className="text-xs text-green-600 mt-2">
                                <MdOpenInNew className="inline w-3 h-3 mr-1" />
                                {email.opens} open{email.opens > 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MdEmail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No emails sent yet</p>
                    <p className="text-sm text-gray-500 mt-1">Start by creating an email campaign</p>
                  </div>
                )}
              </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
