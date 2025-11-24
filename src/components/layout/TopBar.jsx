import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import ProfilePopup from '../chat/ProfilePopup';

const TopBar = () => {
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [selectedProfile, setSelectedProfile] = useState({ username: '', userType: '' });
  const [profileDetail, setProfileDetail] = useState(null);
  const profileRef = useRef(null);
  // Get both username and profile from context
  const { currentChatId, channelNames, currentUsername, userProfile: myProfile } = useChat();

  // Expose profile popup globally so messages can trigger it
  React.useEffect(() => {
    window.showProfilePopup = (username, userType, position) => {
      setSelectedProfile({ username, userType });
      if (position) {
        setPopupPosition(position);
      } else {
        // Fallback to center if no position provided
        setPopupPosition({ x: window.innerWidth / 2 - 125, y: window.innerHeight / 2 - 100 });
      }
      setShowProfilePopup(true);
    };
    return () => {
      delete window.showProfilePopup;
    };
  }, []);

  // When selectedProfile changes, fetch detailed info from backend
  useEffect(() => {
    const username = selectedProfile.username;
    if (!username) {
      setProfileDetail(null);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/v0/users/${encodeURIComponent(username)}`);
        const data = await res.json();
        if (res.ok && data && data.success) {
          setProfileDetail({
            username: data.username,
            profile: data.profile || {},
            settings: data.settings || {},
            permissions: data.permissions || []
          });
        } else {
          setProfileDetail({ username, profile: {} });
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setProfileDetail({ username, profile: {} });
      }
    };

    fetchProfile();
  }, [selectedProfile.username]);

  const handleProfileClick = (e) => {
    const rect = profileRef.current.getBoundingClientRect();
    setPopupPosition({
      x: rect.left,
      y: rect.bottom + 10
    });
    // Show current user's profile info - use currentUsername (from localStorage)
    if (currentUsername) {
      setSelectedProfile({ username: currentUsername, userType: 'user' });
    }
    setShowProfilePopup(!showProfilePopup);
  };

  const handleSettingsClick = () => {
    // Call the global settings opener set by SettingsMenu
    if (window.openSettings) {
      window.openSettings();
    } else {
      console.warn('Settings menu not initialized');
    }
  };

  const handleChannelNameSubmit = (e) => {
    e.preventDefault();
    // Channel name change logic would go here
    console.log('Channel name changed');
  };

  return (
    <div className="topBar">
      <div className="topBarProfile">
        <label
          ref={profileRef}
          htmlFor="pfpBtn"
          className="pfpImage"
          onClick={handleProfileClick}
          title={currentUsername || 'Profile'}
        >
          {
            (() => {
              // Use pfp filename from profile
              let pfpUrl = '';
              if (myProfile && myProfile.pfp) {
                // Build the URL to user_pfp folder
                pfpUrl = `/user_pfp/${myProfile.pfp}`;
              } else {
                // Fallback: use default icon
                pfpUrl = '/src/assets/images/icon.webp';
              }

              return (
                <img
                  src={pfpUrl}
                  alt={currentUsername || 'Profile'}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 50,
                    objectFit: 'cover',
                    display: 'inline-block'
                  }}
                  onError={(e) => {
                    // If image fails to load, use fallback
                    e.target.src = '/src/assets/images/icon.webp';
                  }}
                />
              );
            })()
          }
        </label>
        <input className="pfp" id="pfpBtn" type="button" />
        
        <label 
          onClick={handleSettingsClick}
          htmlFor="settingsBtn" 
          className="settingsImage"
        ></label>
        <input className="settings" id="settingsBtn" type="button" />
      </div>
      
      <div className="topBarChannel">
        <form onSubmit={handleChannelNameSubmit}>
          <input type="submit" id="channelSubmit" style={{ display: 'none' }} />
          <input 
            className="channelText" 
            id="channelName" 
            type="text" 
            placeholder="Channel Name"
            value={currentChatId && channelNames[currentChatId] ? channelNames[currentChatId] : 'Select a chat'}
            readOnly
          />
        </form>
      </div>
      
      <div className="topBarTime">
        <TimeDisplay />
      </div>

      {showProfilePopup && (
        <ProfilePopup 
          position={popupPosition}
          profile={profileDetail || selectedProfile}
          onClose={() => setShowProfilePopup(false)}
        />
      )}
    </div>
  );
};

const TimeDisplay = () => {
  const [currentTime, setCurrentTime] = useState('');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return <span id="timeTxt">{currentTime}</span>;
};

export default TopBar;