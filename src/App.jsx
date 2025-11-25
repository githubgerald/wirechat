import React, { useState, useEffect } from 'react';
import { ChatProvider } from './context/ChatContext';
import { SettingsProvider } from './context/SettingsContext';
import Navbar from './components/layout/Navbar';
import TopBar from './components/layout/TopBar';
import ChatsSection from './components/layout/ChatsSection';
import TextSection from './components/layout/TextSection';
import TextInputSection from './components/layout/TextInputSection';
import SettingsMenu from './components/settings/SettingsMenu';
import LoginPage from './components/auth/LoginPage';
import './styles/globals.css';
import ContextMenu from './components/ui/ContextMenu';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const authToken = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');
    
    if (authToken && username) {
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (username, token) => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userSettings');
    localStorage.removeItem('userPermissions');
    localStorage.removeItem('chatSettings'); // Clear cached settings so new user gets fresh settings
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <SettingsProvider>
      <ChatProvider onLogout={handleLogout}>
        <div className="parent">
          <Navbar onLogout={handleLogout} />
          <TopBar />
          <ChatsSection />
          <TextSection />
          <TextInputSection />
          <ContextMenu />
          <SettingsMenu />
        </div>
      </ChatProvider>
    </SettingsProvider>
  );
}

export default App;