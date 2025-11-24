import React from 'react';
import MediaWrapper from '../media/MediaWrapper';

const Message = ({ message }) => {
  if (!message) {
    console.warn('Message component received undefined message:', message);
    return null;
  }

  const {
    username = 'Unknown',
    userType = 'others',
    message: text = '',
    time = '',
    date = '',
    mediaType,
    mediaUrl,
  } = message;

  const styleMap = {
    user: { id: 'userStyling' },
    admin: { id: 'adminStyling' },
    others: { id: 'othersStyling' },
    mention: { id: 'mentionStyling' },
  };

  const styling = styleMap[userType] || styleMap.others;

  const handleUsernameClick = (e) => {
    e.preventDefault();
    // Get the click position
    const rect = e.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left,
      y: rect.bottom + 10
    };
    // Trigger profile popup with username details and position
    if (window.showProfilePopup) {
      window.showProfilePopup(username, userType, position);
    }
  };

  return (
    <div className="pythonScript">
      <span
        className="userName"
        id={styling.id}
        onClick={handleUsernameClick}
        style={{ cursor: 'pointer' }}
        title={`View ${username}'s profile`}
      >
        {username}
      </span>

      <span className="gapBetween">-</span>

      <div className="timeSent">
        <span className="daySent">{time}</span>
        {date && <span className="daySent">{date}</span>}
      </div>

      <div className="messageStyling">
        {text}
        {mediaType && mediaUrl && (
          <MediaWrapper mediaType={mediaType} mediaUrl={mediaUrl} alt={text} />
        )}
      </div>
    </div>
  );
};

export default Message;