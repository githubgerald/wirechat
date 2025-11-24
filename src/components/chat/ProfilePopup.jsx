import React from 'react';

const ProfilePopup = ({ position, onClose, profile = { username: 'Unknown', userType: 'others' } }) => {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const roleColors = {
    user: '#DD8E32',
    admin: '#467592',
    others: '#13801D',
    mention: '#3a3af8'
  };

  const roleLabels = {
    user: 'User',
    admin: 'Admin',
    others: 'Member',
    mention: 'Mentioned'
  };

  const roleColor = roleColors[profile.userType] || roleColors.others;
  const roleLabel = roleLabels[profile.userType] || roleLabels.others;

  const handleMention = () => {
    if (window.insertMention) {
      window.insertMention(profile.username);
    } else {
      console.log('Mention user (fallback):', profile.username);
    }
    onClose();
  };

  const handleViewProfile = () => {
    console.log('View profile for:', profile.username);
    onClose();
  };

  // Use pfp filename directly as URL via /user_pfp/
  let pfpUrl = '';
  if (profile && profile.profile && profile.profile.pfp) {
    pfpUrl = `/user_pfp/${profile.profile.pfp}`;
  } else if (profile && profile.pfp) {
    pfpUrl = `/user_pfp/${profile.pfp}`;
  } else {
    // Fallback: use default icon
    pfpUrl = '/src/assets/images/icon.webp';
  }

  // Bio can be in profile.profile.bio or profile.bio
  const bio = (profile && profile.profile && profile.profile.bio) || (profile && profile.bio) || '';
  
  // Username should be at profile.username
  const displayUsername = profile?.username || 'Unknown';

  return (
    <div className="popupOverlay" onClick={handleOverlayClick}>
      <div 
        className="profilePopup" 
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
      >
        <button className="closePopup" onClick={onClose}>×</button>
        
        <div className="profileHeader">
          <div className="profilePicture" style={{ backgroundColor: roleColor }}>
            <div
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '12px',
                backgroundImage: `url(${pfpUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                margin: '0 auto'
              }}
            />
          </div>
          <div className="profileInfo">
            <div className="profileName">{displayUsername}</div>
            <div className="profileRole" style={{ color: roleColor }}>{roleLabel}</div>
          </div>
        </div>
        
        <div className="profileDetails">
          {bio && (
            <div className="profileRow">
              <span className="label">Bio:</span>
              <span className="value">{bio}</span>
            </div>
          )}
          <div className="profileRow">
            <span className="label">Permissions:</span>
            <span className="value">{(profile.permissions && profile.permissions.length) || 0}</span>
          </div>
        </div>
        
        <div className="profileActions">
          <button onClick={handleMention}>Mention</button>
          <button onClick={handleViewProfile}>Profile</button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePopup;