import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { MdAdd, MdClose } from 'react-icons/md';
import { FaEnvelope } from 'react-icons/fa';
import { AiOutlineEye } from 'react-icons/ai';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';

const EmailTemplates = () => {
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);
  const [templates, setTemplates] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // ✅ Added missing state
  const [selectedTab, setSelectedTab] = useState('All');
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: '',
    subject: '',
    content: '',
    userId: localStorage.getItem('_id'),
  });

  const [viewTemplate, setViewTemplate] = useState(null);
  const [editTemplate, setEditTemplate] = useState(null);
  const [deleteConfirmTemplate, setDeleteConfirmTemplate] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTemplate((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();

    if (!newTemplate.name || !newTemplate.category || !newTemplate.subject || !newTemplate.content) {
      toast.error('Please fill in all required fields!');
      return;
    }

    setIsCreating(true);

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const templateData = {
        name: newTemplate.name,
        category: newTemplate.category,
        subject: newTemplate.subject,
        content: newTemplate.content,
        userId: user._id || 'demo_1761108600339',
      };

      const response = await axios.post('http://localhost:8000/api/templates/create', templateData);

      if (response.status === 201 || response.status === 200) {
        const template = {
          id: response.data.data._id,
          name: response.data.data.name,
          category: response.data.data.category,
          subject: response.data.data.subject,
          content: response.data.data.content,
          preview: response.data.data.preview,
          lastModified: new Date(response.data.data.updatedAt).toISOString().split('T')[0],
          usageCount: response.data.data.usageCount,
          icon: <FaEnvelope />,
        };

        setTemplates([...templates, template]);
        setShowCreateModal(false);
        setNewTemplate({
          name: '',
          category: '',
          subject: '',
          content: '',
          userId: localStorage.getItem('_id'),
        });
        toast.success('Template saved to database successfully!');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error(error.response?.data?.message || 'Network error. Please check your connection and try again.');
    } finally {
      setIsCreating(false);
    }
  };

  // ✅ Fetch templates for logged-in user
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user?._id) {
          setIsLoading(false);
          return;
        }

        const res = await axios.get(`http://localhost:8000/api/templates/user/${user._id}`);
        const fetched = (res.data?.data || []).map((t) => {
          const cleanContent = (t.content || '')
            .replace(/\\n\\n/g, ' ')
            .replace(/\\n/g, ' ')
            .replace(/\n\n/g, ' ')
            .replace(/\n/g, ' ')
            .trim();

          return {
            id: t._id,
            name: t.name,
            category: t.category,
            subject: t.subject,
            content: t.content,
            preview: cleanContent.slice(0, 180),
            lastModified: new Date(t.updatedAt || t.createdAt).toISOString().split('T')[0],
            usageCount: t.usageCount || 0,
            icon: <FaEnvelope />,
          };
        });
        setTemplates(fetched);
      } catch (err) {
        console.error('Fetch templates failed:', err);
        toast.error('Failed to load templates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const normalizedCategory = (c) => (c || '').toLowerCase().replace(/[-_]/g, '');
  const displayTemplates = templates.filter((t) => {
    if (selectedTab === 'All') return true;
    const cat = normalizedCategory(t.category);
    if (selectedTab === 'Job Application') return cat.includes('job');
    if (selectedTab === 'Followups') return cat.includes('follow');
    if (selectedTab === 'Cover Letter') return cat.includes('cover');
    return true;
  });

  const handleUseTemplate = async (template) => {
    try {
      await axios.put(`http://localhost:8000/api/templates/usage/${template.id}`);
    } catch (e) {
      console.warn('Failed to increment usage count:', e.message);
    }

    navigate('/email-campaigns', {
      state: {
        fromTemplate: true,
        templateId: template.id,
        templateName: template.name,
        subject: template.subject,
        content: template.content,
      },
    });
  };

  const handleViewTemplate = (template) => setViewTemplate(template);
  const handleDeleteClick = (template) => setDeleteConfirmTemplate(template);

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmTemplate) return;

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await axios.delete(`http://localhost:8000/api/templates/${deleteConfirmTemplate.id}`, {
        data: { userId: user._id },
      });
      setTemplates((prev) => prev.filter((t) => t.id !== deleteConfirmTemplate.id));
      toast.success('Template deleted successfully');
    } catch (err) {
      toast.error('Failed to delete template');
    } finally {
      setDeleteConfirmTemplate(null);
    }
  };

  const handleEditTemplate = (template) => {
    setEditTemplate(template);
    setNewTemplate({
      name: template.name,
      category: template.category,
      subject: template.subject,
      content: template.content,
      userId: localStorage.getItem('_id'),
    });
    setShowCreateModal(true);
  };

  const handleUpdateTemplate = async (e) => {
    e.preventDefault();
    if (!editTemplate) return;

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await axios.put(`http://localhost:8000/api/templates/${editTemplate.id}`, {
        ...newTemplate,
        userId: user._id,
      });

      setTemplates((prev) =>
        prev.map((t) => (t.id === editTemplate.id ? { ...t, ...response.data.data } : t))
      );

      toast.success('Template updated successfully');
      setShowCreateModal(false);
      setEditTemplate(null);
      setNewTemplate({
        name: '',
        category: '',
        subject: '',
        content: '',
        userId: localStorage.getItem('_id'),
      });
    } catch (err) {
      toast.error('Failed to update template');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
              <p className="text-gray-600 mt-1">Create and manage email templates</p>
            </div>

            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700 relative">
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
                  className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                  title="Logout"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Tabs + Create Button */}
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 overflow-x-auto whitespace-nowrap">
              {['All', 'Job Application', 'Followups', 'Cover Letter'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`cursor-pointer ${
                    selectedTab === tab ? 'bg-blue-800 text-white' : 'text-gray-700 hover:bg-gray-50'
                  } px-3 py-1.5 rounded-md text-sm transition-colors shrink-0`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
            >
              <MdAdd className="w-5 h-5 mr-2" />
              Create New Template
            </button>
          </div>

          {/* ✅ Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
            </div>
          ) : (
            <>
              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow h-full flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 text-blue-800">
                          {template.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{template.name}</h3>
                          <span className="text-xs text-blue-800 font-medium">{template.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 flex-1">
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Subject:</span> {template.subject}
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-3">{template.preview}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>Used {template.usageCount} times</span>
                      <span>Modified {template.lastModified}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-auto">
                      <button
                        onClick={() => handleUseTemplate(template)}
                        className="px-3 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 cursor-pointer flex-1 text-center whitespace-nowrap"
                      >
                        Use Template
                      </button>
                      <button
                        onClick={() => handleViewTemplate(template)}
                        className="p-2 text-blue-800 border border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer"
                        title="View"
                      >
                        <AiOutlineEye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="p-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                        title="Update"
                      >
                        <FiEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(template)}
                        className="p-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 cursor-pointer"
                        title="Delete"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {templates.length === 0 && (
                <div className="text-center py-24">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaEnvelope className="w-12 h-12 text-blue-800" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No Templates Yet</h3>
                  <p className="text-gray-500 mb-6">Create your first email template to get started</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors cursor-pointer"
                  >
                    <MdAdd className="w-5 h-5 mr-2" />
                    Create Your First Template
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default EmailTemplates;
