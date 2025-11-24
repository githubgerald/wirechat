import React, { useEffect, useRef } from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';

const MessageList = ({ messages = [] }) => {
  const endOfMessagesRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <p style={{ color: '#66CCDA', textAlign: 'center' }}>
        No messages yet. Be the first to say something!
      </p>
    );
  }

  return (
    <>
      {messages.map((messageData, index) => {
        // Skip invalid/undefined messages
        if (!messageData) {
          console.warn('Undefined message at index:', index);
          return null;
        }
        return <Message key={index} message={messageData} />;
      })}
      <TypingIndicator />
      <div ref={endOfMessagesRef} />
    </>
  );
};

export default MessageList;