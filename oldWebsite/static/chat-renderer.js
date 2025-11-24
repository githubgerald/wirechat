// ==========================================
// GLOBAL STATE
// ==========================================

let currentChatId = null;
let channelNames = {}; // Store channel names
const API_BASE_URL = "/api/v0/chats/";

// Username prompt
let currentUsername = prompt("Enter your username:") || "Guest";

function getCurrentUsername() {
  return currentUsername || "Guest";
}

// ==========================================
// ROOM MANAGEMENT
// ==========================================

/**
 * Highlight the selected room button
 */
function highlightSelectedRoom(chatId) {
  // Remove 'active-chat' class from all buttons
  const allButtons = document.querySelectorAll(".chatsSection .button");
  allButtons.forEach((btn) => {
    btn.classList.remove("active-chat");
  });

  // Add 'active-chat' class to selected button
  const selectedButton = document.querySelector(
    `.chatsSection .button[data-chat-id="${chatId}"]`
  );
  if (selectedButton) {
    selectedButton.classList.add("active-chat");
  }
}

/**
 * Switch to a different chat room
 */
function chatSelect(chatId) {
  console.log("📍 Switching to room:", chatId);

  currentChatId = chatId;

  highlightSelectedRoom(chatId);

  // Show channel name in top bar
  const channelInput = document.getElementById("channelName");
  if (channelInput) {
    channelInput.placeholder = channelNames[chatId] || `Room ${chatId}`;
  }

  loadAndRenderMessages();
}

// ==========================================
// CHANNEL NAME MANAGEMENT
// ==========================================

/**
 * Handle channel name change from form
 */
async function channelNameChanger(event) {
  event.preventDefault();

  const channelInput = document.getElementById("channelName");
  const newName = channelInput.value.trim();

  if (!currentChatId) {
    alert("Select a room first!");
    return false;
  }

  if (newName === "") {
    return false;
  }

  console.log("💾 Saving channel name:", newName, "for room:", currentChatId);

  // Save to server
  try {
    const apiUrl = getApiUrl();
    console.log("📤 POST to:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel_name: newName }),
    });

    console.log("📥 Response status:", response.status);

    if (!response.ok) {
      throw new Error("Failed to save channel name");
    }

    const data = await response.json();
    console.log("📥 Response data:", data);

    const savedName = data.channel_name;

    console.log("✅ Channel name saved on server:", savedName);

    // Save in memory
    channelNames[currentChatId] = savedName;

    // Update the button
    const button = document.querySelector(`[data-chat-id="${currentChatId}"]`);
    if (button) {
      button.value = savedName;
      console.log("✅ Button updated to:", savedName);
    }

    // Clear input and update placeholder
    channelInput.value = "";
    channelInput.placeholder = savedName;

    console.log("✅ Renamed room", currentChatId, "to:", savedName);
  } catch (error) {
    console.error("❌ Error saving channel name:", error);
    alert("Failed to save channel name: " + error.message);
  }

  return false;
}

// ==========================================
// CHAT/SHARE MODE SWITCHING
// ==========================================

/**
 * Switch between Chat and Share modes
 */
function switchMode(mode) {
  const chatMode = document.getElementById("chatMode");
  const shareMode = document.getElementById("shareMode");

  if (mode === "chat") {
    chatMode.style.display = "block";
    shareMode.style.display = "none";
    console.log("📝 Switched to Chat mode");
  } else if (mode === "share") {
    chatMode.style.display = "none";
    shareMode.style.display = "block";
    console.log("🎁 Switched to Share mode");
  }
}

// ==========================================
// API FUNCTIONS
// ==========================================

/**
 * Get the API URL for the current chat
 */
function getApiUrl() {
  if (!currentChatId) {
    console.error("❌ No chat room selected!");
    return null;
  }
  const url = `${API_BASE_URL}${currentChatId}`;
  return url;
}

// ==========================================
// GIPHY INTEGRATION
// Add this to chat-renderer.js
// ==========================================

// Get your API key from: https://developers.giphy.com/
const GIPHY_API_KEY = "AYPLoWDr3kEAp9wA4YacrZCWFDY0pjy3"; // You need to get this from Giphy
let giphySearchTimeout = null;

/**
 * Search Giphy API
 */
async function searchGiphy(query) {
  if (!query || query.trim() === "") {
    return [];
  }

  const url = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(
    query
  )}&limit=20&rating=g`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("❌ Error searching Giphy:", error);
    return [];
  }
}

/**
 * Handle Giphy search input
 */
function handleGiphySearch(event) {
  const query = event.target.value;

  // Debounce: wait 500ms after user stops typing
  clearTimeout(giphySearchTimeout);

  giphySearchTimeout = setTimeout(async () => {
    console.log("🔍 Searching Giphy for:", query);

    const resultsContainer = document.getElementById("giphyResults");
    resultsContainer.innerHTML = '<p style="color: #66CCDA;">Searching...</p>';

    const gifs = await searchGiphy(query);
    displayGiphyResults(gifs);
  }, 500);
}

/**
 * Display Giphy results
 */
function displayGiphyResults(gifs) {
  const resultsContainer = document.getElementById("giphyResults");

  if (gifs.length === 0) {
    resultsContainer.innerHTML = '<p style="color: #66CCDA;">No GIFs found</p>';
    return;
  }

  resultsContainer.innerHTML = "";

  gifs.forEach((gif) => {
    const gifElement = document.createElement("div");
    gifElement.className = "giphy-result";
    gifElement.innerHTML = `
      <img 
        src="${gif.images.fixed_height_small.url}" 
        alt="${gif.title}"
        data-gif-url="${gif.images.original.url}"
      />
    `;

    // Click to send GIF
    gifElement.addEventListener("click", () => {
      sendGiphy(gif.images.original.url, gif.title);
    });

    resultsContainer.appendChild(gifElement);
  });

  console.log("✅ Displayed", gifs.length, "GIFs");
}

/**
 * Send a Giphy GIF as a message
 */
async function sendGiphy(gifUrl, title) {
  console.log("📤 Sending Giphy:", gifUrl);

  const messageData = {
    username: getCurrentUsername(),
    userType: "user",
    message: title || "Sent a GIF",
    mediaType: "image",
    mediaUrl: gifUrl, // Store the Giphy URL directly
    time: getCurrentTime(),
    date: getCurrentDate(),
  };

  try {
    const response = await fetch(getApiUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messageData),
    });

    if (!response.ok) {
      throw new Error("Failed to send GIF");
    }

    console.log("✅ GIF sent!");

    // Clear search and reload messages
    document.getElementById("giphySearch").value = "";
    document.getElementById("giphyResults").innerHTML =
      '<p style="color: #66CCDA;">Type to search GIFs...</p>';
    await loadAndRenderMessages();
  } catch (error) {
    console.error("❌ Error sending GIF:", error);
    alert("Failed to send GIF");
  }
}

// ==========================================
// MESSAGE RENDERING
// ==========================================

/**
 * Create HTML for a single message
 */
function createMessageHTML(messageData) {
  const { username, userType, message, time, date, mediaType, mediaUrl } =
    messageData;

  const styleMap = {
    user: "userStyling",
    admin: "adminStyling",
    others: "othersStyling",
    mention: "mentionStyling",
  };

  const stylingId = styleMap[userType] || "othersStyling";

  // Create media HTML if media exists
  let mediaHTML = "";
  if (mediaType && mediaUrl) {
    if (mediaType === "image") {
      mediaHTML = `
        <div class="media-wrapper" data-media-type="image">
          <div class="media-container">
            <img src="${mediaUrl}" alt="Shared image" class="media-content">
            <div class="grain-overlay"></div>
          </div>
        </div>
      `;
    } else if (mediaType === "video") {
      mediaHTML = `
        <div class="media-wrapper" data-media-type="video">
          <div class="media-container">
            <div class="target">
              <video class="media-content" loop muted>
                <source src="${mediaUrl}" type="video/mp4">
              </video>
              <div class="video-controls">
                <div class="visualizer-container">
                  <canvas class="audio-visualizer" width="100" height="40"></canvas>
                </div>
                <div class="volume-container">
                  <button class="volume-button"></button>
                  <div class="volume-indicator">50</div>
                </div>
              </div>
              <div class="grain-overlay"></div>
            </div>
          </div>
        </div>
      `;
    }
  }

  return `
    <div class="pythonScript">
      <span class="userName" id="${userType}" onclick="showProfilePopup('${username}', '${userType}', event)">
        <span id="${stylingId}">[${username}]</span>
      </span>
      <span class="gapBetween">-</span>
      <span class="timeSent">${time}
        ${date ? `<span class="daySent">${date}</span>` : ""}
      </span>
      <p class="messageStyling">
        ${message}
        ${mediaHTML}
      </p>
    </div>
  `;
}

/**
 * Fetch messages from server for current room
 */
async function fetchMessages() {
  const apiUrl = getApiUrl();
  if (!apiUrl) {
    return [];
  }

  console.log("📥 Fetching messages from:", apiUrl);

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Received messages:", data.messages?.length || 0);

    // Save the channel name from server
    if (data.channel_name) {
      channelNames[currentChatId] = data.channel_name;
      console.log("📝 Channel name:", data.channel_name);
    }

    return data.messages || [];
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    return [];
  }
}

/**
 * Render all messages to the page
 */
function renderMessages(messages) {
  console.log("🎨 Rendering", messages.length, "messages");

  const chatContainer = document.querySelector(".textSection .scrollable");

  if (!chatContainer) {
    console.error("❌ Chat container not found!");
    return;
  }

  // Show loading state
  chatContainer.innerHTML =
    '<p style="color: #66CCDA; text-align: center;">Loading messages...</p>';

  // If no messages, show empty state
  if (messages.length === 0) {
    chatContainer.innerHTML =
      '<p style="color: #66CCDA; text-align: center;">No messages yet. Be the first to say something!</p>';
    console.log("📭 No messages in this room");
    return;
  }

  // Clear and add messages
  chatContainer.innerHTML = "";
  messages.forEach((messageData, index) => {
    const messageHTML = createMessageHTML(messageData);
    chatContainer.innerHTML += messageHTML;
  });

  console.log("✅ Messages rendered");

  // Initialize media wrappers
  initializeMediaWrappers();

  // Scroll to bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

/**
 * Initialize media elements (videos/images)
 */
function initializeMediaWrappers() {
  if (typeof MediaWrapper === "undefined") {
    console.warn("⚠️ MediaWrapper class not found - media may not work");
    return;
  }

  const mediaWrappers = document.querySelectorAll(".media-wrapper");
  console.log("🎬 Initializing", mediaWrappers.length, "media elements");
  mediaWrappers.forEach((wrapper) => {
    new MediaWrapper(wrapper);
  });
}

// ==========================================
// FILE UPLOAD HANDLING
// ==========================================

let selectedFiles = []; // Store selected files

/**
 * Handle file selection
 */
function handleFileSelect(event) {
  console.log("🎯 handleFileSelect called!");
  console.log("Event:", event);
  console.log("Files:", event.target.files);

  const files = Array.from(event.target.files);
  selectedFiles = files;

  console.log("📁 Files selected:", files.length);
  files.forEach((file) => {
    console.log(`  - ${file.name} (${file.type}, ${file.size} bytes)`);
  });

  // Show preview or filename near the input
  displayFilePreview(files);
}

/**
 * Display preview of selected files
 */
function displayFilePreview(files) {
  const messageBox = document.getElementById("msgBox");
  if (files.length > 0) {
    const fileNames = files.map((f) => f.name).join(", ");
    messageBox.placeholder = `📎 ${fileNames}`;
  }
}

/**
 * Clear selected files
 */
function clearSelectedFiles() {
  selectedFiles = [];
  const fileInput = document.getElementById("fileUpload");
  if (fileInput) {
    fileInput.value = "";
  }
  const messageBox = document.getElementById("msgBox");
  if (messageBox) {
    messageBox.placeholder = "Send a message";
  }
}

// ==========================================
// FLOATING PROFILE POPUP
// ==========================================

let currentProfilePopup = null;

function showProfilePopup(username, userType, clickEvent) {
  closeProfilePopup();

  console.log("👤 Showing profile for:", username);

  // Stop the click from propagating
  clickEvent.stopPropagation();

  // Get mouse click position
  const mouseX = clickEvent.clientX;
  const mouseY = clickEvent.clientY;

  // Create overlay
  const overlay = document.createElement("div");
  overlay.className = "popupOverlay";
  overlay.addEventListener("click", closeProfilePopup);

  // Create popup
  const popup = document.createElement("div");
  popup.className = "profilePopup";

  // Get role color based on userType
  const roleColors = {
    user: "#DD8E32",
    admin: "#467592",
    others: "#13801D",
    mention: "#3a3af8",
  };

  const roleNames = {
    user: "User",
    admin: "Admin",
    others: "Member",
    mention: "Mentioned",
  };

  // Build popup HTML
  popup.innerHTML = `
    <button class="closePopup" onclick="closeProfilePopup()">×</button>
    
    <div class="profileHeader">
      <div class="profilePicture" style="background: ${
        roleColors[userType] || "#66CCDA"
      }">
        ${username.charAt(0).toUpperCase()}
      </div>
      <div class="profileInfo">
        <div class="profileName">${username}</div>
        <div class="profileRole" style="color: ${roleColors[userType]}">${
    roleNames[userType]
  }</div>
      </div>
    </div>
    
    <div class="profileDetails">
      <div class="profileRow">
        <span class="label">Status:</span>
        <span class="value">Online</span>
      </div>
      <div class="profileRow">
        <span class="label">Messages:</span>
        <span class="value">${getMessageCount(username)}</span>
      </div>
      <div class="profileRow">
        <span class="label">Joined:</span>
        <span class="value">Today</span>
      </div>
    </div>
    
    <div class="profileActions">
      <button onclick="mentionUser('${username}')">Mention</button>
      <button onclick="viewProfile('${username}')">Profile</button>
    </div>
  `;

  // Add to page first (so we can measure it)
  document.body.appendChild(overlay);
  document.body.appendChild(popup);

  // Get popup dimensions
  const popupRect = popup.getBoundingClientRect();
  const popupWidth = popupRect.width;
  const popupHeight = popupRect.height;

  // Calculate position (right and slightly down from click)
  let left = mouseX + 10;
  let top = mouseY;

  // Keep popup on screen (adjust if too close to edge)
  if (left + popupWidth > window.innerWidth) {
    left = mouseX - popupWidth - 10; // Show on left side instead
  }

  if (top + popupHeight > window.innerHeight) {
    top = window.innerHeight - popupHeight - 10; // Keep at bottom
  }

  // Apply position
  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;

  currentProfilePopup = { popup, overlay };
}

function closeProfilePopup() {
  if (currentProfilePopup) {
    currentProfilePopup.popup.remove();
    currentProfilePopup.overlay.remove();
    currentProfilePopup = null;
  }
}

function getMessageCount(username) {
  const messages = document.querySelectorAll(".userName");
  let count = 0;
  messages.forEach((msg) => {
    if (msg.textContent.includes(username)) {
      count++;
    }
  });
  return count;
}

function mentionUser(username) {
  const messageBox = document.getElementById("msgBox");
  if (messageBox) {
    messageBox.value = `@${username} `;
    messageBox.focus();
  }
  closeProfilePopup();
}

function viewProfile(username) {
  alert(`Full profile view for ${username} coming soon!`);
  closeProfilePopup();
}

// ==========================================
// SENDING MESSAGES (Updated for files)
// ==========================================

/**
 * Send a new message to current room (with file support)
 */
async function sendMessage(messageText, currentUser = "user") {
  const apiUrl = getApiUrl();
  if (!apiUrl) {
    alert("Please select a chat room first!");
    return false;
  }

  // Check if we have message text or files
  const hasText = messageText && messageText.trim() !== "";
  const hasFiles = selectedFiles.length > 0;

  if (!hasText && !hasFiles) {
    console.warn("⚠️ No message or files to send");
    return false;
  }

  console.log("📤 Sending to room", currentChatId);

  try {
    // If we have files, upload them first
    if (hasFiles) {
      for (const file of selectedFiles) {
        await sendMessageWithFile(messageText || "", file, currentUser);
      }
      clearSelectedFiles();
      await loadAndRenderMessages();
      return true;
    }

    // Otherwise, send text-only message
    const messageData = {
      username: getCurrentUsername(),
      userType: currentUser,
      message: messageText,
      mediaType: null,
      mediaUrl: null,
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messageData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("✅ Message sent successfully");
    await loadAndRenderMessages();
    return true;
  } catch (error) {
    console.error("❌ Error sending message:", error);
    alert("Failed to send message. Check console for details.");
    return false;
  }
}

/**
 * Send a message with an attached file
 */
async function sendMessageWithFile(messageText, file, currentUser = "user") {
  console.log("📤 Uploading file:", file.name);

  // Determine media type
  let mediaType = null;
  if (file.type.startsWith("image/")) {
    mediaType = "image";
  } else if (file.type.startsWith("video/")) {
    mediaType = "video";
  }

  // Convert file to base64
  const base64Data = await fileToBase64(file);

  // Create message with file
  const messageData = {
    username: getCurrentUsername(),
    userType: currentUser,
    message: messageText || `Shared ${file.name}`,
    mediaType: mediaType,
    mediaUrl: base64Data, // Store base64 in JSON
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  };

  const response = await fetch(getApiUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(messageData),
  });

  if (!response.ok) {
    throw new Error(`Failed to upload ${file.name}`);
  }

  console.log("✅ File uploaded:", file.name);
}

/**
 * Convert file to base64
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function getCurrentDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Main function to load and display messages for current room
 */
async function loadAndRenderMessages() {
  if (!currentChatId) {
    console.log("📭 No room selected yet");
    const chatContainer = document.querySelector(".textSection .scrollable");
    if (chatContainer) {
      chatContainer.innerHTML =
        '<p style="color: #66CCDA; text-align: center;">Select a chat room to begin</p>';
    }
    return;
  }

  console.log("🔄 Loading messages for room:", currentChatId);
  const messages = await fetchMessages();
  renderMessages(messages);
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("🎬 DOM loaded - Initializing chat system");

  const buttonsWithData = document.querySelectorAll(
    ".chatsSection .button[data-chat-id]"
  );
  console.log("🔍 Found buttons with data-chat-id:", buttonsWithData.length);

  // Set up room selection buttons
  buttonsWithData.forEach((button, index) => {
    const chatId = button.dataset.chatId;
    console.log(`🎯 Button ${index}: chat-id=${chatId}`);

    button.addEventListener("click", () => {
      console.log("🖱️ Button clicked! Switching to room:", chatId);
      chatSelect(parseInt(chatId));
    });
  });

  // Set up file upload
  const fileInput = document.getElementById("fileUpload");
  console.log("🔍 Looking for file input...");
  console.log("File input element:", fileInput);

  if (fileInput) {
    console.log("✅ File input found, attaching listener");
    fileInput.addEventListener("change", handleFileSelect);

    // Test if it's clickable
    fileInput.addEventListener("click", () => {
      console.log("👆 File input clicked!");
    });
  } else {
    console.error("❌ File input NOT found! Check your HTML.");
  }

  // Set up the send button
  const sendButton = document.getElementById("txtSend");
  const messageBox = document.getElementById("msgBox");

  if (sendButton) {
    console.log("✅ Send button found");
    sendButton.addEventListener("click", async () => {
      console.log("📤 Send button clicked");
      const messageText = messageBox.value;
      const success = await sendMessage(messageText);

      if (success) {
        messageBox.value = "";
        const charCounter = document.getElementById("char");
        if (charCounter) {
          charCounter.textContent = "0";
        }
      }
    });
  }

  // Set up Chat/Share toggle
  const chatBtn = document.getElementById("chatBtn");
  const shareBtn = document.getElementById("shareBtn");

  if (chatBtn) {
    chatBtn.addEventListener("change", () => {
      if (chatBtn.checked) {
        switchMode("chat");
      }
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener("change", () => {
      if (shareBtn.checked) {
        switchMode("share");
      }
    });
  }

  // Set up Giphy search
  const giphySearch = document.getElementById("giphySearch");
  if (giphySearch) {
    giphySearch.addEventListener("input", handleGiphySearch);
    console.log("✅ Giphy search initialized");
  }

  // Send on Enter key
  if (messageBox) {
    messageBox.addEventListener("keypress", async (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendButton?.click();
      }
    });
  }

  // Auto-select first room if available
  if (buttonsWithData.length > 0) {
    const firstChatId = parseInt(buttonsWithData[0].dataset.chatId);
    console.log("🎯 Auto-selecting first room:", firstChatId);
    chatSelect(firstChatId);
  }

  switchMode("chat");

  console.log("✅ Chat system initialization complete!");
});
