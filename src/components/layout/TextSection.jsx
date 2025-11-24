import React from 'react';
import { useChat } from '../../context/ChatContext';
import MessageList from '../chat/MessageList';

const TextSection = () => {
  const { messages } = useChat();

  return (
    <div className="textSection">
      <div className="scrollable">
        <MessageList messages={messages} />
      </div>
    </div>
  );
};

export default TextSection;