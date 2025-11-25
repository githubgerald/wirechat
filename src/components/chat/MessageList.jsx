import React, { useEffect, useRef, useMemo } from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';

const MessageList = ({ messages = [] }) => {
  const endOfMessagesRef = useRef(null);

  // Group messages from the same user sent within 1 minute of each other
  const groupedMessages = useMemo(() => {
    if (!messages || messages.length === 0) return [];

    const groups = [];
    let currentGroup = null;

    messages.forEach((message, index) => {
      if (!message) return;

      const currentTime = message.timestamp ? new Date(message.timestamp) : null;
      
      // Check if we can add to current group
      if (
        currentGroup &&
        currentGroup.username === message.username &&
        currentTime
      ) {
        // Get the last message in the group
        const lastMessage = currentGroup.messages[currentGroup.messages.length - 1];
        const lastTime = lastMessage.timestamp ? new Date(lastMessage.timestamp) : null;

        // Check if within 1 minute (60000 milliseconds)
        if (lastTime && currentTime - lastTime <= 60000) {
          currentGroup.messages.push(message);
          return;
        }
      }

      // Start a new group
      if (currentGroup) {
        groups.push(currentGroup);
      }
      currentGroup = {
        username: message.username,
        userType: message.userType,
        time: message.time,
        date: message.date,
        messages: [message],
      };
    });

    // Don't forget the last group
    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  }, [messages]);

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
      {groupedMessages.map((group, index) => (
        <Message key={index} messageGroup={group} />
      ))}
      <TypingIndicator />
      <div ref={endOfMessagesRef} />
    </>
  );
};

export default MessageList;