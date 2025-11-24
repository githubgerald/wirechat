// src/components/settings/SettingsMenu.jsx
import React, { useState, useCallback } from 'react';
import { useSettings } from '../../context/SettingsContext';
import SettingsSection from './SettingsSection';

const SettingsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('general');

  const sections = [
    { id: 'general', name: 'General' },
    { id: 'privacy', name: 'Privacy' },
    { id: 'notifications', name: 'Notifications' },
    { id: 'chat', name: 'Chat' },
    { id: 'appearance', name: 'Appearance' },
    { id: 'personalization', name: 'Personalization' },
    { id: 'data', name: 'Data & Storage' },
  ];

  // Use useCallback to create stable function references
  const openSettings = React.useCallback(() => {
    console.log('Opening settings');
    setIsOpen(true);
  }, []);

  const closeSettings = React.useCallback(() => {
    console.log('Closing settings');
    setIsOpen(false);
  }, []);

  React.useEffect(() => {
    window.openSettings = openSettings;
    window.closeSettings = closeSettings;
    console.log('Settings menu functions registered');
  }, [openSettings, closeSettings]);

  React.useEffect(() => {
    const wrapper = document.querySelector('.settingsMenuWrapper');
    if (wrapper) {
      if (isOpen) {
        wrapper.classList.add('show');
      } else {
        wrapper.classList.remove('show');
      }
    }
  }, [isOpen]);

  return (
    <div className="settingsMenuWrapper">
      {/* Overlay */}
      <div 
        className="settingsOverlay"
        onClick={closeSettings}
      />
      
      {/* Settings Menu */}
      <div className="settingsMenu">
        {/* Close Button */}
        <button
          onClick={closeSettings}
          className="closeButton"
        >
          ✕
        </button>

        {/* Sidebar */}
        <div className="settingsSidebar">
          <div className="sidebarHeader">
            Settings
          </div>
          
          <div>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`settingsNavButton ${
                  activeSection === section.id ? 'active' : ''
                }`}
              >
                {section.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="settingsContent">
          <SettingsSection section={activeSection} />
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;