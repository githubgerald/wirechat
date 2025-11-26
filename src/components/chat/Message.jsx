import React from 'react';
import MediaWrapper from '../media/MediaWrapper';
import { makeYouTubeEmbedUrl, extractFirstUrlFromText } from '../../utils/linkUtils';

// Function to detect URLs and convert them to clickable links
const renderTextWithLinks = (text) => {
  if (!text) return text;

  // URL regex pattern
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Split text by URLs and map to elements
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      // It's a URL - make it a clickable link
      return (
        <a 
          key={index}
          href={part} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            color: 'var(--colour-primary)',
            textDecoration: 'underline',
            wordBreak: 'break-all'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    // It's regular text
    return part;
  });
};

// Function to handle mentions
const renderTextWithMentions = (text) => {
  if (!text) return text;

  // Mention regex pattern
  const mentionRegex = /(@\w+)/g;
  
  const parts = text.split(mentionRegex);
  
  return parts.map((part, index) => {
    if (part.match(mentionRegex)) {
      // It's a mention
      const username = part.substring(1); // Remove @
      return (
        <span 
          key={index}
          className="message-mention"
          style={{ 
            color: 'var(--colour-mention)',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
          onClick={(e) => {
            e.stopPropagation();
            // Optional: Add click handler for mentions
            if (window.showProfilePopup) {
              const rect = e.currentTarget.getBoundingClientRect();
              window.showProfilePopup(username, 'user', {
                x: rect.left,
                y: rect.bottom + 10
              });
            }
          }}
          title={`Mention: ${part}`}
        >
          {part}
        </span>
      );
    }
    return part;
  });
};

// Combined function for both links and mentions
const renderFormattedText = (text) => {
  if (!text) return text;
  
  // First, split by URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urlParts = text.split(urlRegex);
  
  return urlParts.map((part, index) => {
    if (part.match(urlRegex)) {
      // It's a URL - render as link
      return (
        <a 
          key={index}
          href={part} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            color: 'var(--colour-primary)',
            textDecoration: 'underline',
            wordBreak: 'break-all'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    } else {
      // It's text that might contain mentions - render mentions
      const mentionRegex = /(@\w+)/g;
      const mentionParts = part.split(mentionRegex);
      
      return mentionParts.map((subPart, subIndex) => {
        if (subPart.match(mentionRegex)) {
          // It's a mention
          const username = subPart.substring(1);
          return (
            <span 
              key={`${index}-${subIndex}`}
              className="message-mention"
              style={{ 
                color: 'var(--colour-mention)',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (window.showProfilePopup) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  window.showProfilePopup(username, 'user', {
                    x: rect.left,
                    y: rect.bottom + 10
                  });
                }
              }}
              title={`Mention: ${subPart}`}
            >
              {subPart}
            </span>
          );
        }
        return subPart;
      });
    }
  });
};

const Message = ({ message, messageGroup }) => {
  // Handle both single messages and grouped messages
  const isGrouped = !!messageGroup;
  const messages = isGrouped ? messageGroup.messages : [message];
  
  if (!isGrouped && !message) {
    console.warn('Message component received undefined message:', message);
    return null;
  }

  if (isGrouped && !messageGroup) {
    console.warn('Message component received undefined messageGroup:', messageGroup);
    return null;
  }

  // Get group info
  const {
    username = 'Unknown',
    userType = 'others',
    time = '',
    date = '',
  } = isGrouped ? messageGroup : message;

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
        {messages.map((msg, index) => {
          const onContext = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const position = { x: e.clientX, y: e.clientY };
            if (window.showMessageContextMenu) {
              window.showMessageContextMenu(msg, position);
            }
          };

            return (
            <div key={index} onContextMenu={onContext} className="message-context-area" style={{ cursor: 'context-menu' }}>
              {msg.deleted ? (
                <em style={{ color: 'var(--colour-text-primary, #888)' }}>[deleted]</em>
              ) : (
                <>
                  {/* Render message text with clickable links and mentions */}
                  {msg.message && (
                    <div className="message-text">
                      {renderFormattedText(msg.message)}
                    </div>
                  )}
                  
                  {msg.mediaType && msg.mediaUrl && (
                    <MediaWrapper mediaType={msg.mediaType} mediaUrl={msg.mediaUrl} alt={msg.message} />
                  )}
                  
                  {/* If the message contains multiple media items (array), render as a grid */}
                  {Array.isArray(msg.media) && msg.media.length > 0 && (
                    (() => {
                      const count = msg.media.length;
                      const cols = count <= 2 ? count : Math.min(4, count);
                      return (
                        <div className="multi-media-grid" style={{ ['--cols']: cols }}>
                          {msg.media.map((m, mi) => (
                            <div key={mi} className="multi-media-item">
                              <MediaWrapper mediaType={m.mediaType} mediaUrl={m.mediaUrl} alt={m.fileName || msg.message} />
                            </div>
                          ))}
                        </div>
                      );
                    })()
                  )}
                  
                  {/* If the message text contains a YouTube link, embed it automatically */}
                  {!msg.mediaType && msg.message && (() => {
                    const firstUrl = extractFirstUrlFromText(msg.message) || msg.message;
                    const embed = makeYouTubeEmbedUrl(firstUrl);
                    return embed ? <MediaWrapper mediaType="youtube" mediaUrl={embed} alt={msg.message} /> : null;
                  })()}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Message;