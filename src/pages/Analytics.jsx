import { useState } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { MdEmail, MdOpenInNew, MdTrendingUp, MdTrendingDown, MdSchedule } from 'react-icons/md';
import { FaChartLine, FaChartBar, FaChartPie, FaMapMarkerAlt, FaDesktop, FaMobile } from 'react-icons/fa';

const Analytics = ({ activeTab, setActiveTab }) => {
  const currentTab = activeTab || 'analytics';
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);
  
  const [timeRange, setTimeRange] = useState('7days'); // 7days, 30days, 90days, all
  const [viewType, setViewType] = useState('overview'); // overview, campaigns, devices, locations

  // Mock analytics data
  const analyticsData = {
    overview: {
      totalSent: 1247,
      totalDelivered: 1198,
      totalOpened: 856,
      totalClicked: 342,
      totalBounced: 49,
      deliveryRate: 96.1,
      openRate: 71.5,
      clickRate: 28.5,
      bounceRate: 3.9,
      avgOpenTime: '2.3 hours',
      bestSendTime: '10:00 AM - 11:00 AM'
    },
    campaignPerformance: [
      { name: 'Fullstack Developer Applications', sent: 45, opened: 38, clicked: 15, openRate: 84.4 },
      { name: 'React Developer Applications', sent: 32, opened: 28, clicked: 12, openRate: 87.5 },
      { name: 'Node.js Developer Applications', sent: 28, opened: 22, clicked: 8, openRate: 78.6 },
      { name: 'Follow-up Emails', sent: 56, opened: 41, clicked: 18, openRate: 73.2 },
      { name: 'Thank You Emails', sent: 38, opened: 36, clicked: 14, openRate: 94.7 }
    ],
    deviceStats: [
      { device: 'Desktop', count: 485, percentage: 56.6 },
      { device: 'Mobile', count: 298, percentage: 34.8 },
      { device: 'Tablet', count: 73, percentage: 8.5 }
    ],
    locationStats: [
      { location: 'United States', count: 342, percentage: 40.0 },
      { location: 'India', count: 256, percentage: 29.9 },
      { location: 'United Kingdom', count: 128, percentage: 15.0 },
      { location: 'Canada', count: 89, percentage: 10.4 },
      { location: 'Others', count: 41, percentage: 4.8 }
    ],
    weeklyTrend: [
      { day: 'Mon', sent: 45, opened: 32, clicked: 12 },
      { day: 'Tue', sent: 52, opened: 38, clicked: 15 },
      { day: 'Wed', sent: 48, opened: 35, clicked: 14 },
      { day: 'Thu', sent: 58, opened: 42, clicked: 18 },
      { day: 'Fri', sent: 62, opened: 45, clicked: 20 },
      { day: 'Sat', sent: 28, opened: 18, clicked: 7 },
      { day: 'Sun', sent: 22, opened: 15, clicked: 5 }
    ],
    hourlyPerformance: [
      { hour: '9 AM', openRate: 45 },
      { hour: '10 AM', openRate: 72 },
      { hour: '11 AM', openRate: 85 },
      { hour: '12 PM', openRate: 68 },
      { hour: '1 PM', openRate: 52 },
      { hour: '2 PM', openRate: 65 },
      { hour: '3 PM', openRate: 78 },
      { hour: '4 PM', openRate: 70 },
      { hour: '5 PM', openRate: 55 }
    ]
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeTab={currentTab} setActiveTab={setActiveTab} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600 mt-1">View detailed analytics and insights</p>
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
          {/* Time Range Selector */}
          <div className="mb-6 flex flex-wrap gap-3">
            <button
              onClick={() => setTimeRange('7days')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                timeRange === '7days' ? 'bg-blue-800 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeRange('30days')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                timeRange === '30days' ? 'bg-blue-800 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeRange('90days')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                timeRange === '90days' ? 'bg-blue-800 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Last 90 Days
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                timeRange === 'all' ? 'bg-blue-800 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              All Time
            </button>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MdEmail className="w-6 h-6 text-blue-800" />
                </div>
                <MdTrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Sent</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.overview.totalSent}</p>
              <p className="text-sm text-green-600 mt-2">+12% from last period</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <MdOpenInNew className="w-6 h-6 text-green-600" />
                </div>
                <MdTrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Open Rate</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.overview.openRate}%</p>
              <p className="text-sm text-green-600 mt-2">+5% from last period</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FaChartLine className="w-6 h-6 text-purple-600" />
                </div>
                <MdTrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Click Rate</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.overview.clickRate}%</p>
              <p className="text-sm text-green-600 mt-2">+8% from last period</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <MdTrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <MdTrendingDown className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Bounce Rate</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.overview.bounceRate}%</p>
              <p className="text-sm text-green-600 mt-2">-2% from last period</p>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Weekly Trend Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Weekly Email Performance</h3>
                <FaChartBar className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-64">
                <div className="flex items-end justify-between h-full space-x-2">
                  {analyticsData.weeklyTrend.map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex flex-col items-center space-y-1 mb-2">
                        {/* Sent Bar */}
                        <div 
                          className="w-full bg-blue-800 rounded-t"
                          style={{ height: `${(day.sent / 70) * 200}px` }}
                          title={`Sent: ${day.sent}`}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600 font-medium">{day.day}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-center gap-6 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-800 rounded mr-2"></div>
                    <span className="text-gray-600">Emails Sent</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    <span className="text-gray-600">Opened</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                    <span className="text-gray-600">Clicked</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hourly Performance */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Best Time to Send</h3>
                <MdSchedule className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-64">
                <div className="flex items-end justify-between h-full space-x-1">
                  {analyticsData.hourlyPerformance.map((hour, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-gradient-to-t from-blue-800 to-blue-400 rounded-t"
                        style={{ height: `${(hour.openRate / 100) * 200}px` }}
                        title={`${hour.hour}: ${hour.openRate}%`}
                      ></div>
                      <span className="text-xs text-gray-600 mt-2 transform -rotate-45">{hour.hour}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-600">Peak Performance: <span className="font-semibold text-blue-800">11:00 AM (85% open rate)</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Performance Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Campaign Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opened</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicked</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyticsData.campaignPerformance.map((campaign, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{campaign.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{campaign.sent}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{campaign.opened}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{campaign.clicked}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`font-semibold ${
                          campaign.openRate >= 80 ? 'text-green-600' :
                          campaign.openRate >= 60 ? 'text-blue-600' :
                          'text-orange-600'
                        }`}>
                          {campaign.openRate}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              campaign.openRate >= 80 ? 'bg-green-500' :
                              campaign.openRate >= 60 ? 'bg-blue-500' :
                              'bg-orange-500'
                            }`}
                            style={{ width: `${campaign.openRate}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Device & Location Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Device Statistics</h3>
                <FaDesktop className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {analyticsData.deviceStats.map((device, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {device.device === 'Desktop' && <FaDesktop className="w-5 h-5 text-blue-600 mr-2" />}
                        {device.device === 'Mobile' && <FaMobile className="w-5 h-5 text-green-600 mr-2" />}
                        {device.device === 'Tablet' && <FaMobile className="w-5 h-5 text-purple-600 mr-2" />}
                        <span className="text-sm font-medium text-gray-900">{device.device}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{device.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          device.device === 'Desktop' ? 'bg-blue-600' :
                          device.device === 'Mobile' ? 'bg-green-600' :
                          'bg-purple-600'
                        }`}
                        style={{ width: `${device.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{device.count} opens</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Geographic Distribution</h3>
                <FaMapMarkerAlt className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {analyticsData.locationStats.map((location, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="w-4 h-4 text-red-500 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{location.location}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{location.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-blue-800"
                        style={{ width: `${location.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{location.count} opens</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-blue-900">Average Open Time</h4>
                <MdSchedule className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-900">{analyticsData.overview.avgOpenTime}</p>
              <p className="text-sm text-blue-700 mt-2">Time to first open</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-green-900">Delivery Rate</h4>
                <MdEmail className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-900">{analyticsData.overview.deliveryRate}%</p>
              <p className="text-sm text-green-700 mt-2">{analyticsData.overview.totalDelivered} delivered</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-purple-900">Best Send Time</h4>
                <FaChartLine className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-900">{analyticsData.overview.bestSendTime}</p>
              <p className="text-sm text-purple-700 mt-2">Optimal sending window</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
