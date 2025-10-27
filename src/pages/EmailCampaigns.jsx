import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { MdAttachFile, MdSend, MdSchedule, MdPreview } from 'react-icons/md';
import { FaUser, FaEnvelope, FaFileAlt, FaPaperclip } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const EmailCampaigns = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);
  
  const [formData, setFormData] = useState({
    campaignName: '',
    recipientEmail: '',
    recipientName: '',
    subject: '',
    jobTitle: '',
    companyName: '',
    coverLetter: '',
    attachments: [],
    scheduleDate: '',
    scheduleTime: ''
  });

  // Load template data from navigate state when component mounts
  useEffect(() => {
    // First check if template data came from navigate state
    if (location.state?.fromTemplate) {
      const { subject, content, templateName } = location.state;
      console.log('Loading template data:', { subject, content, templateName });
      setFormData(prev => ({
        ...prev,
        campaignName: templateName || prev.campaignName,
        subject: subject || prev.subject,
        coverLetter: content || prev.coverLetter
      }));
    } else {
      // Fallback to localStorage for backwards compatibility
      const selectedTemplate = localStorage.getItem('selectedTemplate');
      if (selectedTemplate) {
        try {
          const templateData = JSON.parse(selectedTemplate);
          setFormData(prev => ({
            ...prev,
            subject: templateData.subject || prev.subject,
            coverLetter: templateData.content || prev.coverLetter,
            campaignName: templateData.templateName || prev.campaignName
          }));
          localStorage.removeItem('selectedTemplate');
        } catch (error) {
          console.error('Error loading template:', error);
        }
      }
    }
  }, [location.state]);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [sendMode, setSendMode] = useState('immediate');

  const validateForm = () => {
    const newErrors = {};

    if (!formData.campaignName) {
      newErrors.campaignName = 'Campaign name is required';
    }
    if (!formData.recipientEmail) {
      newErrors.recipientEmail = 'Recipient email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.recipientEmail)) {
      newErrors.recipientEmail = 'Please enter a valid email address';
    }
    if (!formData.recipientName) {
      newErrors.recipientName = 'Recipient name is required';
    }
    if (!formData.subject) {
      newErrors.subject = 'Subject is required';
    }
    if (!formData.jobTitle) {
      newErrors.jobTitle = 'Job title is required';
    }
    if (!formData.companyName) {
      newErrors.companyName = 'Company name is required';
    }
    if (!formData.coverLetter) {
      newErrors.coverLetter = 'Cover letter is required';
    }
    if (sendMode === 'schedule' && (!formData.scheduleDate || !formData.scheduleTime)) {
      newErrors.schedule = 'Schedule date and time are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  // Function to replace template variables in text
  const replaceTemplateVariables = (text) => {
    if (!text) return text;
    
    let processedText = text;
    
    // Replace template variables first
    processedText = processedText
      .replace(/\{recipientName\}/gi, formData.recipientName || 'Hiring Manager')
      .replace(/\{jobTitle\}/gi, formData.jobTitle || '{jobTitle}')
      .replace(/\{companyName\}/gi, formData.companyName || '{companyName}')
      .replace(/\{position\}/gi, formData.jobTitle || '{position}')
      .replace(/\{company\}/gi, formData.companyName || '{company}')
      .replace(/\{your_name\}/gi, JSON.parse(localStorage.getItem('user') || '{}').name || '{your_name}');
    
    // Replace "Dear Hiring Manager" with actual recipient name if present
    if (formData.recipientName && formData.recipientName.trim()) {
      processedText = processedText
        .replace(/Dear Hiring Manager/gi, `Dear ${formData.recipientName}`)
        .replace(/Dear HR Manager/gi, `Dear ${formData.recipientName}`)
        .replace(/Dear HR/gi, `Dear ${formData.recipientName}`)
        .replace(/Hiring Manager/gi, formData.recipientName);
    }
    
    return processedText;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Replace template variables in subject and content
      const processedSubject = replaceTemplateVariables(formData.subject);
      const processedContent = replaceTemplateVariables(formData.coverLetter);

      // Prepare attachments
      const attachments = formData.attachments.map((file) => ({
        filename: file.name,
        content: file // File object will be converted to base64 on server
      }));

      // Send email via API
      const formDataToSend = new FormData();
      formDataToSend.append('to', formData.recipientEmail);
      formDataToSend.append('subject', processedSubject);
      formDataToSend.append('text', processedContent);
      formDataToSend.append('html', processedContent.replace(/\n/g, '<br>'));
      
      // Append files
      formData.attachments.forEach((file) => {
        formDataToSend.append('attachments', file);
      });

      // Get logged-in user's ID
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user._id || 'demo-user';

      const response = await axios.post('https://emailtracker-backend-api.onrender.com/api/email/send', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'user-id': userId
        }
      });

      if (response.data.success) {
        toast.success('Email sent successfully!');
        
        // Reset form
        setFormData({
          campaignName: '',
          recipientEmail: '',
          recipientName: '',
          subject: '',
          jobTitle: '',
          companyName: '',
          coverLetter: '',
          attachments: [],
          scheduleDate: '',
          scheduleTime: ''
        });
      }
      
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(error.response?.data?.message || 'Error sending email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateEmailPreview = () => {
    return `
Subject: ${formData.subject}

Dear ${formData.recipientName},

I hope this email finds you well. I am writing to express my interest in the ${formData.jobTitle} position at ${formData.companyName}.

${formData.coverLetter}

Thank you for considering my application. I look forward to hearing from you.

Best regards,
[Your Name]
    `.trim();
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
                <h1 className="text-2xl font-bold text-gray-900">Email Campaigns</h1>
                <p className="text-gray-600 mt-1">Create and send job application emails to HR</p>
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
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Create New Email Campaign</h2>
            <p className="text-gray-600">Send professional job application emails to HR departments</p>
          </div>

            {/* Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Campaign Details</h3>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Campaign Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    name="campaignName"
                    value={formData.campaignName}
                    onChange={handleChange}
                    placeholder="e.g., Frontend Developer Application"
                    className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-colors ${
                      errors.campaignName ? 'border-red-300 bg-red-50' : ''
                    }`}
                  />
                  {errors.campaignName && (
                    <p className="text-red-500 text-sm mt-1">{errors.campaignName}</p>
                  )}
                </div>

                {/* Recipient Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaEnvelope className="inline w-4 h-4 mr-2" />
                      Recipient Email *
                    </label>
                    <input
                      type="email"
                      name="recipientEmail"
                      value={formData.recipientEmail}
                      onChange={handleChange}
                      placeholder="hr@company.com"
                      className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-colors ${
                        errors.recipientEmail ? 'border-red-300 bg-red-50' : ''
                      }`}
                    />
                    {errors.recipientEmail && (
                      <p className="text-red-500 text-sm mt-1">{errors.recipientEmail}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaUser className="inline w-4 h-4 mr-2" />
                      Recipient Name *
                    </label>
                    <input
                      type="text"
                      name="recipientName"
                      value={formData.recipientName}
                      onChange={handleChange}
                      placeholder="HR Manager"
                      className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-colors ${
                        errors.recipientName ? 'border-red-300 bg-red-50' : ''
                      }`}
                    />
                    {errors.recipientName && (
                      <p className="text-red-500 text-sm mt-1">{errors.recipientName}</p>
                    )}
                  </div>
                </div>

                {/* Job Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaFileAlt className="inline w-4 h-4 mr-2" />
                      Job Title *
                    </label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      placeholder="Frontend Developer"
                      className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-colors ${
                        errors.jobTitle ? 'border-red-300 bg-red-50' : ''
                      }`}
                    />
                    {errors.jobTitle && (
                      <p className="text-red-500 text-sm mt-1">{errors.jobTitle}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="TechCorp Solutions"
                      className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-colors ${
                        errors.companyName ? 'border-red-300 bg-red-50' : ''
                      }`}
                    />
                    {errors.companyName && (
                      <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Job Application - Frontend Developer Position"
                    className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-colors ${
                      errors.subject ? 'border-red-300 bg-red-50' : ''
                    }`}
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
                  )}
                </div>

                {/* Cover Letter */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email Content / Cover Letter *
                    </label>
                    <button
                      type="button"
                      onClick={() => navigate('/email-templates')}
                      className="flex items-center text-sm text-blue-800 hover:text-blue-900 cursor-pointer"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Use Template
                    </button>
                  </div>
                  <textarea
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Write your email content or cover letter here..."
                    className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-colors resize-none ${
                      errors.coverLetter ? 'border-red-300 bg-red-50' : ''
                    }`}
                  />
                  {errors.coverLetter && (
                    <p className="text-red-500 text-sm mt-1">{errors.coverLetter}</p>
                  )}
                </div>

                {/* File Attachments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaPaperclip className="inline w-4 h-4 mr-2" />
                    Attachments (Resume, Portfolio, etc.)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.txt"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <MdAttachFile className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-gray-600">Click to upload files</span>
                      <span className="text-sm text-gray-400">PDF, DOC, DOCX, TXT (Max 10MB each)</span>
                    </label>
                  </div>
                  
                  {/* Display uploaded files */}
                  {formData.attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Send Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Send Options
                  </label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sendMode"
                        value="immediate"
                        checked={sendMode === 'immediate'}
                        onChange={(e) => setSendMode(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Send Immediately</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sendMode"
                        value="schedule"
                        checked={sendMode === 'schedule'}
                        onChange={(e) => setSendMode(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Schedule for Later</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sendMode"
                        value="draft"
                        checked={sendMode === 'draft'}
                        onChange={(e) => setSendMode(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Save as Draft</span>
                    </label>
                  </div>

                  {/* Schedule Options */}
                  {sendMode === 'schedule' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Schedule Date
                        </label>
                        <input
                          type="date"
                          name="scheduleDate"
                          value={formData.scheduleDate}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-colors ${
                            errors.schedule ? 'border-red-300 bg-red-50' : ''
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Schedule Time
                        </label>
                        <input
                          type="time"
                          name="scheduleTime"
                          value={formData.scheduleTime}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-colors ${
                            errors.schedule ? 'border-red-300 bg-red-50' : ''
                          }`}
                        />
                      </div>
                      {errors.schedule && (
                        <p className="text-red-500 text-sm mt-1">{errors.schedule}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <MdPreview className="w-5 h-5 mr-2" />
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Campaign...
                      </>
                    ) : (
                      <>
                        {sendMode === 'schedule' ? (
                          <>
                            <MdSchedule className="w-5 h-5 mr-2" />
                            Schedule Campaign
                          </>
                        ) : sendMode === 'draft' ? (
                          <>
                            <FaFileAlt className="w-5 h-5 mr-2" />
                            Save as Draft
                          </>
                        ) : (
                          <>
                            <MdSend className="w-5 h-5 mr-2" />
                            Send Campaign
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

        {/* Email Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Email Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                {console.log('Preview modal - formData:', formData)}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
                  <div className="mb-4">
                    <span className="text-xs font-semibold text-blue-800 uppercase tracking-wide">To:</span>
                    <p className="text-sm text-gray-900 mt-1">{formData.recipientEmail ? formData.recipientEmail : <span className="text-gray-400 italic">Not specified</span>}</p>
                  </div>
                  <div className="mb-4">
                    <span className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Subject:</span>
                    <p className="text-sm text-gray-900 mt-1">{formData.subject ? replaceTemplateVariables(formData.subject) : <span className="text-gray-400 italic">Not specified</span>}</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 min-h-[200px]">
                  <div className="prose max-w-none">
                    {formData.coverLetter ? (
                      <p className="text-sm text-gray-700 mb-4 whitespace-pre-wrap">{replaceTemplateVariables(formData.coverLetter)}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic text-center py-10">No content added yet. Please fill in the email content above.</p>
                    )}
                  </div>
                </div>
                {formData.attachments.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Attachments:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.attachments.map((file, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {file.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors cursor-pointer"
                >
                  Close Preview
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

export default EmailCampaigns;
