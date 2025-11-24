import React from 'react';
import { useChat } from '../../hooks/useChat';

const TypingIndicator = () => {
  const { isTyping, typingUser } = useChat();

  if (!isTyping) return null;

  return (
    <div id="typingIndicator" className="typing-indicator show">
      {typingUser || 'Someone'} is typing...
    </div>
  );
};

export default TypingIndicator;