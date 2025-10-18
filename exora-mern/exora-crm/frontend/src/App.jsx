import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { validateToken } from './services/api';
import SetupWizard from './pages/Setup/SetupWizard';
import Dashboard from './pages/Dashboard/Dashboard';
import Contacts from './pages/Contacts/Contacts';
import ContactDetail from './pages/Contacts/ContactDetail';
import Pipeline from './pages/Pipeline/Pipeline';
import Calendar from './pages/Calendar/Calendar';
import Inbox from './pages/Inbox/Inbox';
import AutomationHistory from './pages/AutomationHistory/AutomationHistory';
import Settings from './pages/Settings/Settings';
import Layout from './components/Layout/Layout';
import './App.css';

const queryClient = new QueryClient();

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    console.log('[CRM] Initializing authentication...');
    
    // Check for token in URL (from Exora redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const setupFlag = urlParams.get('setup');

    console.log('[CRM] Token in URL:', token ? 'YES' : 'NO');
    console.log('[CRM] Setup flag:', setupFlag);

    if (token) {
      try {
        console.log('[CRM] Validating token from URL...');
        const userData = await validateToken(token);
        console.log('[CRM] Token validation successful:', userData);
        
        localStorage.setItem('crm_token', token);
        setUser(userData);
        setAuthenticated(true);

        if (setupFlag === 'true' || userData.status === 'pending_setup') {
          console.log('[CRM] User needs setup, showing wizard');
          setNeedsSetup(true);
        }

        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('[CRM] Token validation FAILED:', error);
        console.error('[CRM] Error details:', error.response?.data || error.message);
        alert(`CRM Authentication Failed: ${error.response?.data?.error || error.message}\n\nYou will be redirected to login.`);
        redirectToExora();
      }
    } else {
      console.log('[CRM] No token in URL, checking localStorage...');
      
      // Check for stored token
      const storedToken = localStorage.getItem('crm_token');
      if (storedToken) {
        console.log('[CRM] Found stored token, validating...');
        try {
          const userData = await validateToken(storedToken);
          console.log('[CRM] Stored token validation successful:', userData);
          
          setUser(userData);
          setAuthenticated(true);

          if (userData.status === 'pending_setup') {
            console.log('[CRM] User needs setup, showing wizard');
            setNeedsSetup(true);
          }
        } catch (error) {
          console.error('[CRM] Stored token validation failed:', error);
          console.log('[CRM] Clearing invalid token and redirecting...');
          localStorage.removeItem('crm_token');
          redirectToExora();
        }
      } else {
        console.log('[CRM] No token found, redirecting to Exora auth...');
        redirectToExora();
      }
    }

    setLoading(false);
  };

  const redirectToExora = () => {
    // Redirect to main Exora dashboard (user is already logged in on Exora)
    // Use environment variable for flexibility (production vs development)
    const exoraUrl = import.meta.env.VITE_EXORA_URL || 
                     (window.location.hostname === 'localhost' 
                       ? 'http://localhost:3000' 
                       : 'https://exora.solutions');
    
    console.log('[CRM] Redirecting back to Exora dashboard:', `${exoraUrl}/dashboard`);
    window.location.href = `${exoraUrl}/dashboard`;
  };

  const handleSetupComplete = () => {
    setNeedsSetup(false);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading CRM...</p>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  if (needsSetup) {
    return <SetupWizard onComplete={handleSetupComplete} user={user} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout user={user}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/contacts/:id" element={<ContactDetail />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/automation-history" element={<AutomationHistory />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

