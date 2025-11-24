import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { useSettings } from '../../context/SettingsContext';
import { searchGiphy, formatGiphyResults, createGiphyMessage } from '../../utils/giphyUtils';

const TextInputSection = () => {
  const [activeMode, setActiveMode] = useState('chat');
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]); // Add this line
  const msgBoxRef = useRef(null);
  const { sendMessage } = useChat();
  const { settings } = useSettings();

  const handleSend = async () => {
    if (message.trim() || selectedFiles.length > 0) {
      await sendMessage(message.trim());
      setMessage('');
      setSelectedFiles([]); // Clear files after send
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

  // Expose a global insertMention function so the profile popup can insert @mentions
  React.useEffect(() => {
    window.insertMention = (username) => {
      if (!username) return;
      setMessage((prev) => {
        const next = `${prev}${prev && !prev.endsWith(' ') ? ' ' : ''}@${username} `;
        return next;
      });
      // focus the message box if available
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
          type="checkbox" 
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
          type="checkbox" 
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

  const ChatMode = ({ message, onMessageChange, onSend, onKeyPress, selectedFiles, setSelectedFiles, msgBoxRef }) => {
  const [charCount, setCharCount] = useState(0);
  const textareaRef = msgBoxRef || useRef(null);

  React.useEffect(() => {
    setCharCount(message ? message.length : 0);
  }, [message]);

  const handleMessageChange = (e) => {
    const value = e.target.value;
    onMessageChange(value);
    setCharCount(value.length);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  return (
    <div id="chatMode">
      <label htmlFor="fileUpload" className="fileUploadButton"></label>
      <input 
        className="fileUpload" 
        id="fileUpload" 
        type="file" 
        multiple 
        accept="image/*,video/*"
        onChange={handleFileSelect}
      />

      <textarea 
        className="inputBox" 
        id="msgBox" 
        name="messagebox" 
        placeholder="Send a message"
        maxLength="140"
        value={message}
        onChange={handleMessageChange}
        ref={textareaRef}
        onKeyPress={onKeyPress}
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
      // Scroll right/left based on wheel direction
      // Using a much larger multiplier (5x) for responsive scrolling
      giphyResultsRef.current.scrollLeft += e.deltaY * 5;
    }
  };

  useEffect(() => {
    const container = giphyResultsRef.current;
    if (!container) return;

    // Add non-passive event listener to allow preventDefault
    container.addEventListener('wheel', handleMouseWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleMouseWheel);
    };
  }, []);

  const handleGiphySearch = async (query) => {
    setSearchQuery(query);

    // Clear previous timeout
    if (giphySearchTimeout) {
      clearTimeout(giphySearchTimeout);
    }

    if (!query.trim()) {
      setGiphyResults([]);
      return;
    }

    // Debounce: wait 500ms after user stops typing
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

      // Clear search and reload messages
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