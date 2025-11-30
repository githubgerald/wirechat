import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const ChatContext = createContext();

export const useChat = () => {
  const context = React.useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [currentChatId, setCurrentChatId] = useLocalStorage('currentChatId', null);
  const [messages, setMessages] = useState({});  // Use regular state, not localStorage (prevents quota errors)
  const [channelNames, setChannelNames] = useLocalStorage('channelNames', {});
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  // Use 'username' key (same as LoginPage sets it)
  const [currentUsername, setCurrentUsername] = useLocalStorage('username', 'Guest');
  const [selectedFiles, setSelectedFiles] = useState([]);
  // User profile, settings, and permissions from localStorage
  const [userProfile, setUserProfile] = useLocalStorage('userProfile', {});
  const [userSettings, setUserSettings] = useLocalStorage('userSettings', {});
  const [userPermissions, setUserPermissions] = useLocalStorage('userPermissions', []);
  
  // Add available chats for mobile dropdown
  const [availableChats, setAvailableChats] = useState([1, 2, 3, 4, 5]);

  // Point to Flask server on port 5000
  const API_BASE_URL = "http://localhost:5000/api/v0/chats/";

  const getApiUrl = useCallback(() => {
    if (!currentChatId) return null;
    return `${API_BASE_URL}${currentChatId}`;
  }, [currentChatId]);

  const chatSelect = useCallback((chatId) => {
    setCurrentChatId(chatId);
    // Load messages for the selected chat
    loadMessages(chatId);
  }, [setCurrentChatId]);

  const loadMessages = async (chatId) => {
    try {
      const response = await fetch(`${API_BASE_URL}${chatId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(prev => ({
          ...prev,
          [chatId]: data.messages || []
        }));
        if (data.channel_name) {
          setChannelNames(prev => ({
            ...prev,
            [chatId]: data.channel_name
          }));
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Add user list state
  const [users, setUsers] = useState([]);

  // Function to get unique users from messages
  const updateUserList = useCallback(() => {
    if (!messages[currentChatId]) return;
    
    const uniqueUsers = new Set();
    messages[currentChatId].forEach(msg => {
      if (msg.username && msg.username !== 'Guest') {
        uniqueUsers.add(msg.username);
      }
    });
    
    // Add current user if not already in list
    if (currentUsername && currentUsername !== 'Guest') {
      uniqueUsers.add(currentUsername);
    }
    
    setUsers(Array.from(uniqueUsers).sort());
  }, [messages, currentChatId, currentUsername]);

  // Update user list when messages change
  useEffect(() => {
    updateUserList();
  }, [updateUserList]);

  // Function to handle mentions in message text
  const parseMentions = useCallback((text) => {
    if (!text) return { text, mentions: [] };
    
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]); // username without @
    }
    
    return { text, mentions };
  }, []);


  const sendMessage = async (messageText, userType = 'user', filesArg = null) => {
    if (!currentChatId) {
      alert("Please select a chat room first!");
      return false;
    }

  const hasText = messageText && messageText.trim() !== "";
  const hasFiles = filesArg ? filesArg.length > 0 : selectedFiles.length > 0;

    if (!hasText && !hasFiles) {
      console.warn("No message or files to send");
      return false;
    }

    try {
      // Handle file uploads: send all files in a single message as an array
      if (hasFiles) {
        const filesToSend = filesArg ? filesArg : selectedFiles;
        await sendMessageWithFiles(messageText || "", filesToSend, userType);
        setSelectedFiles([]);
      } else {
        // Send text-only message
        const messageData = {
          username: currentUsername,
          userType: userType,
          message: messageText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toLocaleDateString()
        };

        const response = await fetch(getApiUrl(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(messageData),
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }
      }

      // Reload messages
      await loadMessages(currentChatId);
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Check console for details.");
      return false;
    }
  };

  const sendMessageWithFiles = async (messageText, files, userType = 'user') => {
    // Convert all files to base64 and attach as a media array
    const media = [];
    for (const file of files) {
      let mediaType = null;
      if (file.type.startsWith("image/")) mediaType = 'image';
      else if (file.type.startsWith("video/")) mediaType = 'video';

      const reader = new FileReader();
      const base64Data = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      media.push({
        mediaType,
        mediaUrl: base64Data,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
    }

    const messageData = {
      username: currentUsername,
      userType: userType,
      // message: messageText || (files.length === 1 ? `Shared ${files[0].name}` : `Shared ${files.length} files`),
      media: media,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString()
    };

    const response = await fetch(getApiUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData)
    });

    if (!response.ok) {
      throw new Error('Failed to upload files');
    }
  };

   const sendMessageWithMentions = async (messageText, userType = 'user', filesArg = null) => {
    const { mentions } = parseMentions(messageText);
    
    // If there are mentions, highlight them in the message
    let processedMessage = messageText;
    if (mentions.length > 0) {
      mentions.forEach(username => {
        processedMessage = processedMessage.replace(
          new RegExp(`@${username}`, 'g'),
          `@${username}`
        );
      });
    }

    // Send the message using existing function
    return await sendMessage(processedMessage, userType, filesArg);
  };

  const editMessage = async (uid, fields) => {
    // fields can be { message: 'text' } or any keys to merge into the message
    if (!currentChatId) {
      alert('Select a chat first');
      return false;
    }
    try {
      const payload = { uid, ...fields };
      const response = await fetch(`${API_BASE_URL}${currentChatId}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Failed to edit message');
      await loadMessages(currentChatId);
      return true;
    } catch (err) {
      console.error('Error editing message:', err);
      return false;
    }
  };

  const deleteMessage = async (uid) => {
    if (!currentChatId) {
      alert('Select a chat first');
      return false;
    }
    try {
      const payload = { uid };
      const response = await fetch(`${API_BASE_URL}${currentChatId}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Failed to delete message');
      await loadMessages(currentChatId);
      return true;
    } catch (err) {
      console.error('Error deleting message:', err);
      return false;
    }
  };

  const sendMessageWithFile = async (messageText, file, userType = 'user') => {
    let mediaType = null;
    if (file.type.startsWith("image/")) {
      mediaType = "image";
    } else if (file.type.startsWith("video/")) {
      mediaType = "video";
    }

    // Convert file to base64
    const reader = new FileReader();
    const base64Data = await new Promise((resolve) => {
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

    const messageData = {
      username: currentUsername,
      userType: userType,
      message: messageText || `Shared ${file.name}`,
      mediaType: mediaType,
      mediaUrl: base64Data,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString()
    };

    const response = await fetch(getApiUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messageData),
    });

    if (!response.ok) {
      throw new Error(`Failed to upload ${file.name}`);
    }
  };

  const updateChannelName = async (chatId, newName) => {
    try {
      const response = await fetch(`${API_BASE_URL}${chatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel_name: newName }),
      });

      if (response.ok) {
        const data = await response.json();
        setChannelNames(prev => ({
          ...prev,
          [chatId]: data.channel_name || newName
        }));
        return true;
      }
    } catch (error) {
      console.error("Error updating channel name:", error);
    }
    return false;
  };

  const handleTyping = useCallback((username) => {
    setIsTyping(true);
    setTypingUser(username);
    
    const timeout = setTimeout(() => {
      setIsTyping(false);
      setTypingUser('');
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  const clearChat = (chatId) => {
    setMessages(prev => ({
      ...prev,
      [chatId]: []
    }));
  };

  const value = {
    // State
    users,
    currentChatId,
    messages: messages[currentChatId] || [],
    channelNames,
    isTyping,
    typingUser,
    currentUsername,
    selectedFiles,
    userProfile,
    userSettings,
    userPermissions,
    availableChats, // Add available chats for mobile dropdown
    
    // Actions
    chatSelect,
    sendMessage: sendMessageWithMentions,
    parseMentions,
    updateUserList,
    editMessage,
    deleteMessage,
    updateChannelName,
    handleTyping,
    clearChat,
    setSelectedFiles,
    setCurrentUsername,
    setUserProfile,
    setUserSettings,
    setUserPermissions,
    loadMessages: () => loadMessages(currentChatId)
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};