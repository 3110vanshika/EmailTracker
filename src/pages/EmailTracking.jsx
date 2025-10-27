import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { MdEmail, MdOpenInNew, MdSchedule, MdCheckCircle, MdCancel, MdVisibility } from 'react-icons/md';
import { FaMapMarkerAlt, FaDesktop, FaClock } from 'react-icons/fa';
import axios from 'axios';

const EmailTracking = () => {
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);
  
  // State for sent emails
  const [sentEmails, setSentEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch sent emails from API
  const fetchSentEmails = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user._id || 'demo-user';
      
      const response = await axios.get(`https://emailtracker-backend-api.onrender.com/api/email/user/${userId}`);
      
      if (response.data.success) {
        // Transform API data to match component structure
        const emails = response.data.data.map(email => ({
          id: email._id,
          campaignName: email.campaignName,
          recipient: email.recipient,
          recipientName: email.recipientName,
          subject: email.subject,
          sentDate: new Date(email.sentDate).toLocaleString('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          }),
          status: email.status,
          opens: email.opens || 0,
          lastOpened: email.lastOpened ? new Date(email.lastOpened).toLocaleString('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          }) : null,
          delivered: email.delivered,
          clicked: email.clicked,
          clicks: email.clicks || 0,
          location: email.location,
          device: email.device,
          ipAddress: email.ipAddress,
          openHistory: email.openHistory || []
        }));
        
        setSentEmails(emails);
      }
    } catch (error) {
      console.error('Error fetching sent emails:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentEmails();
    
    // Real-time updates every 5 seconds
    const interval = setInterval(() => {
      fetchSentEmails();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const [selectedEmail, setSelectedEmail] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, opened, delivered, bounced

  const getStatusBadge = (status) => {
    switch(status) {
      case 'opened':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <MdCheckCircle className="w-4 h-4 mr-1" />
            Opened
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <MdEmail className="w-4 h-4 mr-1" />
            Delivered
          </span>
        );
      case 'bounced':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <MdCancel className="w-4 h-4 mr-1" />
            Bounced
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Pending
          </span>
        );
    }
  };

  const filteredEmails = filterStatus === 'all' 
    ? sentEmails 
    : sentEmails.filter(email => email.status === filterStatus);

  // Calculate stats
  const stats = {
    totalSent: sentEmails.length,
    delivered: sentEmails.filter(e => e.delivered).length,
    opened: sentEmails.filter(e => e.status === 'opened').length,
    bounced: sentEmails.filter(e => e.status === 'bounced').length,
    openRate: ((sentEmails.filter(e => e.status === 'opened').length / sentEmails.length) * 100).toFixed(1)
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Email Tracking</h1>
                <p className="text-gray-600 mt-1">Track your sent emails and see who opened them</p>
              </div>
              
              {/* User Profile Section */}
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

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sent</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSent}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MdEmail className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MdCheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Opened</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.opened}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <MdOpenInNew className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.openRate}%</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <MdVisibility className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bounced</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.bounced}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <MdCancel className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="mb-6 flex flex-wrap gap-3">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-blue-800 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              All Emails
            </button>
            <button
              onClick={() => setFilterStatus('opened')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                filterStatus === 'opened'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Opened
            </button>
            <button
              onClick={() => setFilterStatus('delivered')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                filterStatus === 'delivered'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Delivered
            </button>
            <button
              onClick={() => setFilterStatus('bounced')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                filterStatus === 'bounced'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Bounced
            </button>
          </div>

          {/* Email List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Sent Emails</h3>
              </div>
              <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opens</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Opened</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmails.map((email, index) => (
                    <tr key={email.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{email.campaignName}</p>
                          <p className="text-xs text-gray-500">{email.subject}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{email.recipientName}</p>
                          <p className="text-xs text-gray-500">{email.recipient}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {email.sentDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(email.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {email.opens > 0 ? (
                          <span className="flex items-center">
                            <MdVisibility className="w-4 h-4 mr-1 text-green-500" />
                            {email.opens}
                          </span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {email.lastOpened || 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedEmail(email)}
                          className="text-blue-800 hover:text-blue-900 font-medium cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}

          {/* Email Details Modal */}
          {selectedEmail && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Email Tracking Details</h3>
                  <button
                    onClick={() => setSelectedEmail(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Campaign Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">{selectedEmail.campaignName}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Recipient:</p>
                      <p className="font-medium text-gray-900">{selectedEmail.recipientName}</p>
                      <p className="text-gray-500">{selectedEmail.recipient}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Sent Date:</p>
                      <p className="font-medium text-gray-900">{selectedEmail.sentDate}</p>
                    </div>
                  </div>
                </div>

                {/* Tracking Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Delivery Status</p>
                    <p className="text-lg font-bold text-blue-600">
                      {selectedEmail.delivered ? 'Delivered' : 'Failed'}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total Opens</p>
                    <p className="text-lg font-bold text-green-600">{selectedEmail.opens}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Clicks</p>
                    <p className="text-lg font-bold text-purple-600">{selectedEmail.clicks}</p>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <p className="text-lg font-bold text-indigo-600 capitalize">{selectedEmail.status}</p>
                  </div>
                </div>

                {/* Device & Location Info */}
                {selectedEmail.device && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-3">Last Open Details</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-start">
                        <FaDesktop className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                        <div>
                          <p className="text-gray-600">Device</p>
                          <p className="font-medium text-gray-900">{selectedEmail.device}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <FaMapMarkerAlt className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                        <div>
                          <p className="text-gray-600">Location</p>
                          <p className="font-medium text-gray-900">{selectedEmail.location}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <FaClock className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                        <div>
                          <p className="text-gray-600">Last Opened</p>
                          <p className="font-medium text-gray-900">{selectedEmail.lastOpened}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Open History */}
                {selectedEmail.openHistory && selectedEmail.openHistory.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3">Open History</h5>
                    <div className="space-y-3">
                      {selectedEmail.openHistory.map((history, index) => (
                        <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <MdOpenInNew className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{history.time}</p>
                            <p className="text-xs text-gray-600">{history.device} • {history.location}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Opens Message */}
                {selectedEmail.opens === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MdEmail className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">This email hasn't been opened yet.</p>
                    <p className="text-sm text-gray-500 mt-1">We'll notify you when the recipient opens it.</p>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedEmail(null)}
                    className="px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default EmailTracking;

