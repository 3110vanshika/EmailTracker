import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveTab, setCollapsed } from '../store/sidebarSlice';
import { MdChevronLeft, MdChevronRight, MdContacts, MdEmail, MdHome, MdMarkEmailUnread, MdReport, MdTrackChanges } from "react-icons/md";
import { HiTemplate } from "react-icons/hi";
import { IoAnalyticsSharp, IoSettings } from "react-icons/io5";
import logo from '../assets/logo.png';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = useSelector((state) => state.sidebar.activeTab);
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);
  const dispatch = useDispatch();

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <MdHome />, path: '/dashboard' },
    { id: 'campaigns', name: 'Email Campaigns', icon: <MdEmail />, path: '/email-campaigns' },
    { id: 'tracking', name: 'Email Tracking', icon: <MdTrackChanges />, path: '/email-tracking' },
    { id: 'templates', name: 'Email Templates', icon: <HiTemplate />, path: '/email-templates' },
    { id: 'analytics', name: 'Timeline', icon: <IoAnalyticsSharp />, path: '/analytics' },
    { id: 'contacts', name: 'Contacts', icon: <MdContacts />, path: '/contacts' },
    { id: 'reports', name: 'Reports', icon: <MdReport />, path: '/reports' },
    { id: 'settings', name: 'Settings', icon: <IoSettings />, path: '/settings' }
  ];

  // Update active tab based on current URL
  useEffect(() => {
    const currentPath = location.pathname;
    const currentItem = menuItems.find(item => item.path === currentPath);
    if (currentItem) {
      dispatch(setActiveTab(currentItem.id));
    }
  }, [location.pathname, dispatch]);

  const handleMenuClick = (item) => {
    dispatch(setActiveTab(item.id));
    navigate(item.path);
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen p-5 pt-8 bg-white duration-300 z-30 border-r border-gray-200 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <MdChevronRight className={`border border-blue-800 bg-white text-2xl text-blue-800 rounded-full absolute -right-3 top-9 z-50 cursor-pointer hover:bg-blue-50 transition-colors shadow-md ${!isCollapsed && 'rotate-180'}`} onClick={() => dispatch(setCollapsed(!isCollapsed))} />
      <div className="inline-flex">
        <MdEmail className='text-4xl text-blue-800 cursor-pointer block float-left mr-2' />
        <h1 className={`origin-left font-medium text-2xl cursor-default ${isCollapsed ? 'scale-0' : ''}`}>EmailTracker</h1>
      </div>
      <ul className="mt-12">
        {menuItems.map((ele) => (
          <li
            key={ele.id}
            onClick={() => handleMenuClick(ele)}
            className={`mb-2 relative flex items-center p-2 rounded-md cursor-pointer transition-all duration-200 select-none
        ${activeTab === ele.id 
          ? 'bg-blue-800 text-white' 
          : 'text-gray-700 hover:bg-blue-100 hover:text-blue-800'
        }`}
          >
            <span className="text-xl w-6 min-w-[24px] flex justify-center">{ele.icon}</span>
            <span
              className={`ml-3 text-base font-medium whitespace-nowrap transition-all duration-300 origin-left ${isCollapsed ? 'opacity-0 scale-0 w-0' : 'opacity-100 scale-100'
                }`}
            >
              {ele.name}
            </span>
          </li>
        ))}
      </ul>

    </aside>
  );
};

export default Sidebar;
