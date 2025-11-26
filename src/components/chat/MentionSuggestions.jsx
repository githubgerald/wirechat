// src/components/chat/MentionSuggestions.jsx
import React from 'react';
import { useChat } from '../../context/ChatContext';

const MentionSuggestions = ({ 
  visible, 
  position, 
  searchTerm, 
  onSelect, 
  onClose 
}) => {
  const { users, currentUsername } = useChat();

  if (!visible || !searchTerm) return null;

  const filteredUsers = users.filter(user => 
    user.toLowerCase().includes(searchTerm.toLowerCase()) && 
    user !== currentUsername // Don't suggest current user
  );

  const handleClick = (username) => {
    onSelect(username);
  };

  return (
    <div 
      className="mention-suggestions"
    >
      <div className="mention-suggestions-list">
        {filteredUsers.length === 0 ? (
          <div className="mention-suggestion-item no-results">
            No users found
          </div>
        ) : (
          filteredUsers.map((user, index) => (
            <div
              key={user}
              className="mention-suggestion-item"
              onClick={() => handleClick(user)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--colour-primary-low-opacity)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span className="mention-username">@{user}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MentionSuggestions;