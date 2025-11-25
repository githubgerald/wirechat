import React from 'react';
import MediaWrapper from '../media/MediaWrapper';
import { makeYouTubeEmbedUrl, extractFirstUrlFromText } from '../../utils/linkUtils';

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
                  {msg.message}
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
                    const firstUrl = extractFirstUrlFromText(msg.message);
                    if (firstUrl) {
                      const embed = makeYouTubeEmbedUrl(firstUrl);
                      if (embed) {
                        return (
                          <div className="youtube-embed-container">
                            <MediaWrapper 
                              mediaType="youtube" 
                              mediaUrl={embed} 
                              alt={msg.message} 
                            />
                          </div>
                        );
                      }
                    }
                    return null;
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