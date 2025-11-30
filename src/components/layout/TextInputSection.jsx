import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { useSettings } from '../../context/SettingsContext';
import { searchGiphy, formatGiphyResults, createGiphyMessage } from '../../utils/giphyUtils';
import FilePreview from '../media/FilePreview';
import MentionSuggestions from '../chat/MentionSuggestions';

const TextInputSection = () => {
  const [activeMode, setActiveMode] = useState('chat');
  const [message, setMessage] = useState('');
  const msgBoxRef = useRef(null);
  const { sendMessage, selectedFiles, setSelectedFiles } = useChat();
  const { settings } = useSettings();

  const handleSend = async () => {
    if (message.trim() || selectedFiles.length > 0) {
      await sendMessage(message.trim());
      setMessage('');
      setSelectedFiles([]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (settings.enterToSend) {
        e.preventDefault();
        handleSend();
      }
    }
  };

  const switchMode = (mode) => {
    setActiveMode(mode);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  React.useEffect(() => {
    window.insertMention = (username) => {
      if (!username) return;
      setMessage((prev) => {
        const next = `${prev}${prev && !prev.endsWith(' ') ? ' ' : ''}@${username} `;
        return next;
      });
      try {
        if (msgBoxRef && msgBoxRef.current) {
          msgBoxRef.current.focus();
        }
      } catch (e) {
        // ignore
      }
    };

    return () => {
      try {
        delete window.insertMention;
      } catch (e) {}
    };
  }, [msgBoxRef]);

  return (
    <div className="textInputSection">
      <MessageButtonsWrapper activeMode={activeMode} onModeChange={switchMode} />
      
      {activeMode === 'chat' ? (
        <ChatMode 
          message={message}
          onMessageChange={setMessage}
          onSend={handleSend}
          onKeyPress={handleKeyPress}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          onRemoveFile={handleRemoveFile}
          msgBoxRef={msgBoxRef}
        />
      ) : (
        <ShareMode />
      )}
    </div>
  );
};

const MessageButtonsWrapper = ({ activeMode, onModeChange }) => {
  return (
    <div className="messageButtonsWrapper">
      <div className="chatButtonWrapper">
        <input 
          id="chatBtn" 
          name="chatButton" 
          type="radio" 
          checked={activeMode === 'chat'}
          onChange={() => onModeChange('chat')}
        />
        <label htmlFor="chatBtn">
          <span>Chat</span>
        </label>
      </div>
      <div className="shareButtonWrapper">
        <input 
          id="shareBtn" 
          name="shareButton" 
          type="radio" 
          checked={activeMode === 'share'}
          onChange={() => onModeChange('share')}
        />
        <label htmlFor="shareBtn">
          <span>Share</span>
        </label>
      </div>
    </div>
  );
};

const ChatMode = ({ message, onMessageChange, onSend, onKeyPress, selectedFiles, setSelectedFiles, onRemoveFile, msgBoxRef }) => {
  const [charCount, setCharCount] = useState(0);
  const [mentionSuggestions, setMentionSuggestions] = useState({
    visible: false,
    position: { x: 0, y: 0 },
    searchTerm: ''
  });
  const textareaRef = msgBoxRef || useRef(null);
  const fileInputRef = useRef(null);
  const { users } = useChat();

  React.useEffect(() => {
    setCharCount(message ? message.length : 0);
  }, [message]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleMessageChange = (e) => {
    const value = e.target.value;
    onMessageChange(value);
    setCharCount(value.length);
    
    // Handle mention suggestions
    handleMentionDetection(value, e.target);
  };

  const handleMentionDetection = (text, textarea) => {
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPosition);
    
    // Find the last @ symbol before cursor
    const lastAtPos = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtPos !== -1) {
      // Check if @ is not part of a word (preceded by space or start of string)
      const charBeforeAt = textBeforeCursor[lastAtPos - 1];
      if (!charBeforeAt || charBeforeAt === ' ' || charBeforeAt === '\n') {
        const textAfterAt = textBeforeCursor.substring(lastAtPos + 1);
        // Check if there's no space after @ (meaning we're typing a username)
        if (!textAfterAt.includes(' ')) {
          // Calculate position for suggestions
          const textareaRect = textarea.getBoundingClientRect();
          const textBeforeMention = textBeforeCursor.substring(0, lastAtPos);
          
          // Create a temporary span to measure text width
          const tempSpan = document.createElement('span');
          tempSpan.style.font = getComputedStyle(textarea).font;
          tempSpan.style.visibility = 'hidden';
          tempSpan.style.whiteSpace = 'pre-wrap';
          tempSpan.textContent = textBeforeMention;
          document.body.appendChild(tempSpan);
          
          const textWidth = tempSpan.offsetWidth;
          document.body.removeChild(tempSpan);
          
          setMentionSuggestions({
            visible: true,
            position: {
              x: textareaRect.left + textWidth + 20, // Add some padding
              y: textareaRect.top - 200 // Position above cursor
            },
            searchTerm: textAfterAt
          });
          return;
        }
      }
    }
    
    // Hide suggestions if conditions aren't met
    setMentionSuggestions(prev => ({ ...prev, visible: false }));
  };

  const handleMentionSelect = (username) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const currentText = message;
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = currentText.substring(0, cursorPosition);
    
    // Find the last @ position
    const lastAtPos = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtPos !== -1) {
      // Replace from @ to current cursor position with @username
      const newText = 
        currentText.substring(0, lastAtPos) + 
        `@${username} ` + 
        currentText.substring(cursorPosition);
      
      onMessageChange(newText);
      
      // Focus and set cursor after the mention
      setTimeout(() => {
        const newCursorPos = lastAtPos + username.length + 2; // @ + username + space
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
    
    setMentionSuggestions({ visible: false, position: { x: 0, y: 0 }, searchTerm: '' });
  };

  const handleKeyDown = (e) => {
    // Close mention suggestions on escape
    if (e.key === 'Escape' && mentionSuggestions.visible) {
      setMentionSuggestions(prev => ({ ...prev, visible: false }));
      e.preventDefault();
      return;
    }
    
    onKeyPress(e);
  };

  // Fixed: Remove the label click handler, only use button to trigger input
  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div id="chatMode" style={{ position: 'relative' }}>
      <FilePreview files={selectedFiles} onRemove={onRemoveFile} />
      
      {/* Fixed: Changed from label to div to prevent double prompt */}
      <div 
        className="fileUploadButton"
        onClick={handleFileButtonClick}
        role="button"
        tabIndex={0}
        aria-label="Upload file"
      />
      <input 
        className="fileUpload" 
        id="fileUpload" 
        type="file" 
        multiple 
        accept="image/*,video/*"
        onChange={handleFileSelect}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />

      <textarea 
        className="inputBox" 
        id="msgBox" 
        name="messagebox" 
        placeholder="Send a message - use @ to mention users"
        maxLength="140"
        value={message}
        onChange={handleMessageChange}
        onKeyDown={handleKeyDown}
        ref={textareaRef}
      />

      <MentionSuggestions
        visible={mentionSuggestions.visible}
        position={mentionSuggestions.position}
        searchTerm={mentionSuggestions.searchTerm}
        onSelect={handleMentionSelect}
        onClose={() => setMentionSuggestions(prev => ({ ...prev, visible: false }))}
      />

      <button className="button" id="txtSend" onClick={onSend}>
        Send
      </button>

      <div className="countWrapper">
        <p className="charCount">
          <span id="char">{charCount}</span>/140
        </p>
      </div>
    </div>
  );
};

const ShareMode = () => {
  const { sendMessage, currentUsername, loadMessages } = useChat();
  const [giphyResults, setGiphyResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [giphySearchTimeout, setGiphySearchTimeout] = useState(null);
  const giphyResultsRef = useRef(null);

  const handleMouseWheel = (e) => {
    if (giphyResultsRef.current) {
      e.preventDefault();
      giphyResultsRef.current.scrollLeft += e.deltaY * 5;
    }
  };

  useEffect(() => {
    const container = giphyResultsRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleMouseWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleMouseWheel);
    };
  }, []);

  const handleGiphySearch = async (query) => {
    setSearchQuery(query);

    if (giphySearchTimeout) {
      clearTimeout(giphySearchTimeout);
    }

    if (!query.trim()) {
      setGiphyResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      console.log("🔍 Searching Giphy for:", query);

      try {
        const gifs = await searchGiphy(query);
        const formatted = formatGiphyResults(gifs);
        setGiphyResults(formatted);
      } catch (error) {
        console.error("❌ Error searching Giphy:", error);
        setGiphyResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    setGiphySearchTimeout(timeout);
  };

  const handleSendGif = async (gif) => {
    console.log("📤 Sending Giphy:", gif.originalUrl);

    const messageData = createGiphyMessage(gif.originalUrl, gif.title, currentUsername);

    try {
      const response = await fetch("http://localhost:5000/api/v0/chats/" + "1234", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error("Failed to send GIF");
      }

      console.log("✅ GIF sent!");

      setSearchQuery("");
      setGiphyResults([]);
      await loadMessages();
    } catch (error) {
      console.error("❌ Error sending GIF:", error);
      alert("Failed to send GIF");
    }
  };

  return (
    <div id="shareMode">
      <div className="giphyContainer">
        <div className="giphySearchBox">
          <input 
            type="text" 
            id="giphySearch" 
            placeholder="Search GIFs" 
            className="giphySearchInput"
            value={searchQuery}
            onChange={(e) => handleGiphySearch(e.target.value)}
          />
        </div>
        <div id="giphyResults" className="giphyResults" ref={giphyResultsRef}>
          {giphyResults.map((gif) => (
            <div
              key={gif.id}
              className="giphy-result"
              onClick={() => handleSendGif(gif)}
              title={`Send: ${gif.title}`}
            >
              <img 
                src={gif.thumbUrl}
                alt={gif.title}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TextInputSection;