import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { store } from './store/store';
import SignIn from './pages/SignIn';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EmailCampaigns from './pages/EmailCampaigns';
import EmailTemplates from './pages/EmailTemplates';
import EmailTracking from './pages/EmailTracking';
import Timeline from './pages/Timeline';
import Contacts from './pages/Contacts';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('user');

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route 
            path="/signin" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <SignIn />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} 
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/signin" />} 
          />
          <Route 
            path="/email-campaigns" 
            element={isAuthenticated ? <EmailCampaigns /> : <Navigate to="/signin" />} 
          />
          <Route 
            path="/email-templates" 
            element={isAuthenticated ? <EmailTemplates /> : <Navigate to="/signin" />} 
          />
          <Route 
            path="/email-tracking" 
            element={isAuthenticated ? <EmailTracking /> : <Navigate to="/signin" />} 
          />
          <Route 
            path="/analytics" 
            element={isAuthenticated ? <Timeline /> : <Navigate to="/signin" />} 
          />
          <Route 
            path="/contacts" 
            element={isAuthenticated ? <Contacts /> : <Navigate to="/signin" />} 
          />
          <Route 
            path="/reports" 
            element={isAuthenticated ? <Reports /> : <Navigate to="/signin" />} 
          />
          <Route 
            path="/settings" 
            element={isAuthenticated ? <Settings /> : <Navigate to="/signin" />} 
          />
          <Route 
            path="/" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/signin" />} 
          />
        </Routes>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Provider>
  );
}

export default App;