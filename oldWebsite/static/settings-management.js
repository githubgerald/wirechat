// ==========================================
// SETTINGS MANAGEMENT SYSTEM
// ==========================================

// Default settings
const defaultSettings = {
  // General
  username: null,
  statusMessage: "",

  // Privacy
  showOnline: true,
  readReceipts: true,
  typingIndicator: true,
  lastSeen: false,

  // Notifications
  notifications: true,
  soundNotifications: true,
  desktopNotifications: false,
  mentionNotifications: true,

  // Chat
  fontSize: "medium",
  messageDisplay: "cozy",
  enterToSend: true,
  showTimestamps: true,
  groupMessages: true,

  // Appearance
  theme: "dark",

  // Personalization
  primaryColor: "#66CCDA",
  secondaryColor: "#0394BB",
  userColor: "#DD8E32",
  othersColor: "#13801D",

  // Data
  autoDownload: false,
  saveHistory: true,
};

let currentSettings = { ...defaultSettings };

// ==========================================
// SETTINGS MENU MANAGEMENT
// ==========================================

function openSettings() {
  const wrapper = document.getElementById("settingsMenuWrapper");
  if (wrapper) {
    wrapper.classList.add("show");
    loadSettingsIntoUI();
    console.log("⚙️ Settings menu opened");
  } else {
    console.error("❌ Settings menu wrapper not found");
  }
}

function closeSettings() {
  const wrapper = document.getElementById("settingsMenuWrapper");
  if (wrapper) {
    wrapper.classList.remove("show");
    console.log("⚙️ Settings menu closed");
  }
}

function showSettingsSection(sectionName) {
  document.querySelectorAll(".settingsSection").forEach((section) => {
    section.classList.remove("active");
  });

  document.querySelectorAll(".settingsNavButton").forEach((btn) => {
    btn.classList.remove("active");
  });

  const section = document.getElementById(`section-${sectionName}`);
  if (section) {
    section.classList.add("active");
  }

  const clickedButton = event.target.closest(".settingsNavButton");
  if (clickedButton) {
    clickedButton.classList.add("active");
  }
}

// ==========================================
// LOAD/SAVE SETTINGS
// ==========================================

function loadSettings() {
  const saved = localStorage.getItem("chatSettings");
  if (saved) {
    try {
      currentSettings = { ...defaultSettings, ...JSON.parse(saved) };
      console.log("✅ Settings loaded:", currentSettings);
    } catch (error) {
      console.error("❌ Error loading settings:", error);
    }
  }
  applyAllSettings();
}

function saveSettings() {
  readSettingsFromUI();
  localStorage.setItem("chatSettings", JSON.stringify(currentSettings));
  console.log("✅ Settings saved:", currentSettings);
  applyAllSettings();
}

function loadSettingsIntoUI() {
  console.log("📝 Loading settings into UI...");

  // General
  setValue("usernameInput", currentSettings.username);
  setValue("statusMessage", currentSettings.statusMessage);

  // Privacy
  setChecked("showOnline", currentSettings.showOnline);
  setChecked("readReceipts", currentSettings.readReceipts);
  setChecked("typingIndicator", currentSettings.typingIndicator);
  setChecked("lastSeen", currentSettings.lastSeen);

  // Notifications
  setChecked("notifications", currentSettings.notifications);
  setChecked("soundNotifications", currentSettings.soundNotifications);
  setChecked("desktopNotifications", currentSettings.desktopNotifications);
  setChecked("mentionNotifications", currentSettings.mentionNotifications);

  // Chat
  setValue("fontSize", currentSettings.fontSize);
  setValue("messageDisplay", currentSettings.messageDisplay);
  setChecked("enterToSend", currentSettings.enterToSend);
  setChecked("showTimestamps", currentSettings.showTimestamps);
  setChecked("groupMessages", currentSettings.groupMessages);

  // Appearance
  const themeRadio = document.querySelector(
    `input[name="theme"][value="${currentSettings.theme}"]`
  );
  if (themeRadio) themeRadio.checked = true;

  // Personalization
  initializeColorSliders();

  // Data
  setChecked("autoDownload", currentSettings.autoDownload);
  setChecked("saveHistory", currentSettings.saveHistory);

  console.log("✅ Settings loaded into UI");
}

function readSettingsFromUI() {
  console.log("📖 Reading settings from UI...");

  // General
  currentSettings.username = getValue("usernameInput");
  currentSettings.statusMessage = getValue("statusMessage");

  // Update global username
  if (currentSettings.username && typeof currentUsername !== "undefined") {
    currentUsername = currentSettings.username;
  }

  // Privacy
  currentSettings.showOnline = getChecked("showOnline");
  currentSettings.readReceipts = getChecked("readReceipts");
  currentSettings.typingIndicator = getChecked("typingIndicator");
  currentSettings.lastSeen = getChecked("lastSeen");

  // Notifications
  currentSettings.notifications = getChecked("notifications");
  currentSettings.soundNotifications = getChecked("soundNotifications");
  currentSettings.desktopNotifications = getChecked("desktopNotifications");
  currentSettings.mentionNotifications = getChecked("mentionNotifications");

  // Chat
  currentSettings.fontSize = getValue("fontSize");
  currentSettings.messageDisplay = getValue("messageDisplay");
  currentSettings.enterToSend = getChecked("enterToSend");
  currentSettings.showTimestamps = getChecked("showTimestamps");
  currentSettings.groupMessages = getChecked("groupMessages");

  // Appearance
  const themeRadio = document.querySelector('input[name="theme"]:checked');
  if (themeRadio) currentSettings.theme = themeRadio.value;

  // Data
  currentSettings.autoDownload = getChecked("autoDownload");
  currentSettings.saveHistory = getChecked("saveHistory");

  console.log("✅ Settings read from UI");
}

// ==========================================
// APPLY ALL SETTINGS
// ==========================================

function applyAllSettings() {
  console.log("🎯 Applying all settings...");

  applyTheme();
  applyPersonalization();
  applyFontSize();
  applyMessageDisplay();
  applyPrivacySettings();
  applyNotificationSettings();
  applyChatSettings();
  applyDataSettings();

  console.log("✅ All settings applied");
}

function applyTheme() {
  console.log("🎨 Applying theme:", currentSettings.theme);
  document.body.className = `theme-${currentSettings.theme}`;
  document.body.offsetHeight; // Force reflow
}

function applyPersonalization() {
  console.log("🌈 Applying personalization colors");
  const root = document.documentElement;

  root.style.setProperty("--colour-primary", currentSettings.primaryColor);
  root.style.setProperty("--colour-secondary", currentSettings.secondaryColor);
  root.style.setProperty("--colour-user", currentSettings.userColor);
  root.style.setProperty("--colour-others", currentSettings.othersColor);
}

function applyFontSize() {
  console.log("🔤 Applying font size:", currentSettings.fontSize);
  const root = document.documentElement;
  const sizes = {
    small: "1.0rem",
    medium: "1.5rem",
    large: "2.0rem",
  };
  root.style.setProperty(
    "--message-font-size",
    sizes[currentSettings.fontSize]
  );
}

function applyMessageDisplay() {
  console.log("📏 Applying message display:", currentSettings.messageDisplay);
  const root = document.documentElement;
  const spacing = {
    compact: "20px",
    cozy: "40px",
    spacious: "60px",
  };
  root.style.setProperty(
    "--message-gap",
    spacing[currentSettings.messageDisplay]
  );
}

function applyPrivacySettings() {
  console.log("🔒 Applying privacy settings");
  const root = document.documentElement;

  // Typing indicator
  root.style.setProperty(
    "--typing-indicator-display",
    currentSettings.typingIndicator ? "block" : "none"
  );

  // Read receipts
  root.style.setProperty(
    "--read-receipts-display",
    currentSettings.readReceipts ? "block" : "none"
  );

  // Online status
  root.style.setProperty(
    "--online-status-display",
    currentSettings.showOnline ? "inline-block" : "none"
  );

  // Apply to existing UI elements
  updatePrivacyUI();
}

function applyNotificationSettings() {
  console.log("🔔 Applying notification settings");
  const root = document.documentElement;

  root.style.setProperty(
    "--notification-sound-enabled",
    currentSettings.soundNotifications ? "1" : "0"
  );
  root.style.setProperty(
    "--desktop-notifications-enabled",
    currentSettings.desktopNotifications ? "1" : "0"
  );

  if (currentSettings.desktopNotifications) {
    requestNotificationPermission();
  }
}

function applyChatSettings() {
  console.log("💬 Applying chat settings");
  const root = document.documentElement;

  // Enter to send
  root.style.setProperty(
    "--enter-to-send",
    currentSettings.enterToSend ? "1" : "0"
  );

  // Show timestamps
  document.querySelectorAll(".timeSent").forEach((element) => {
    element.style.display = currentSettings.showTimestamps ? "flex" : "none";
  });

  // Group messages (this would need more complex implementation)
  if (currentSettings.groupMessages) {
    document.body.classList.add("group-messages");
  } else {
    document.body.classList.remove("group-messages");
  }

  // Update input behavior
  updateInputBehavior();
}

function applyDataSettings() {
  console.log("💾 Applying data settings");
  // Auto-download and save history are applied when relevant actions occur
}

// ==========================================
// SPECIFIC SETTINGS IMPLEMENTATIONS
// ==========================================

function initializeColorSliders() {
  const colors = {
    primary: currentSettings.primaryColor,
    secondary: currentSettings.secondaryColor,
    user: currentSettings.userColor,
    others: currentSettings.othersColor,
  };

  Object.entries(colors).forEach(([colorType, hexColor]) => {
    const hsl = hexToHsl(hexColor);
    if (hsl) {
      const slider = document.getElementById(`${colorType}Hue`);
      const preview = document.getElementById(`${colorType}Preview`);
      const valueDisplay = document.getElementById(`${colorType}Value`);

      if (slider) slider.value = hsl.h;
      if (preview) preview.style.backgroundColor = hexColor;
      if (valueDisplay) valueDisplay.textContent = hexColor;
    }
  });
}

function updateColor(colorType, hueValue) {
  const saturation = 70;
  const lightness = colorType === "primary" ? 63 : 50;
  const hex = hslToHex(hueValue, saturation, lightness);

  document.getElementById(`${colorType}Preview`).style.backgroundColor = hex;
  document.getElementById(`${colorType}Value`).textContent = hex;

  currentSettings[`${colorType}Color`] = hex;
  saveSettings(); // Auto-save and apply
}

function updatePrivacyUI() {
  // Update online status indicators
  document.querySelectorAll(".online-status").forEach((status) => {
    status.style.display = currentSettings.showOnline ? "inline-block" : "none";
  });

  // Update read receipts
  document.querySelectorAll(".read-receipt").forEach((receipt) => {
    receipt.style.display = currentSettings.readReceipts ? "inline" : "none";
  });
}

function updateInputBehavior() {
  const messageBox = document.getElementById("msgBox");
  if (messageBox) {
    messageBox.setAttribute("data-enter-to-send", currentSettings.enterToSend);
  }
}

// ==========================================
// NOTIFICATIONS & TYPING
// ==========================================

function requestNotificationPermission() {
  if (currentSettings.desktopNotifications && "Notification" in window) {
    Notification.requestPermission().then((permission) => {
      console.log("Notification permission:", permission);
    });
  }
}

function showNotification(title, body) {
  if (!currentSettings.notifications) return;

  if (currentSettings.soundNotifications) {
    playNotificationSound();
  }

  if (
    currentSettings.desktopNotifications &&
    Notification.permission === "granted"
  ) {
    new Notification(title, {
      body: body,
      icon: "/assets/images/icon.ico",
    });
  }
}

function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.1
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    console.error("🔇 Error playing notification sound:", error);
  }
}

let typingTimeout;
function handleTyping() {
  if (!currentSettings.typingIndicator) return;

  const typingIndicator = document.getElementById("typingIndicator");
  if (typingIndicator) {
    typingIndicator.style.display = "block";
    typingIndicator.textContent = `${
      currentSettings.username || "Someone"
    } is typing...`;
  }

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    if (typingIndicator) {
      typingIndicator.style.display = "none";
    }
  }, 2000);
}

// ==========================================
// DATA EXPORT
// ==========================================

async function downloadChatData() {
  if (!currentChatId) {
    alert("Please select a chat room first!");
    return;
  }

  try {
    const response = await fetch(`/api/v0/chats/${currentChatId}`);
    const data = await response.json();

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat_${currentChatId}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification("Data Export", "Chat data downloaded successfully!");
  } catch (error) {
    console.error("❌ Error downloading chat data:", error);
    showNotification("Data Export", "Failed to download chat data");
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function setValue(id, value) {
  const element = document.getElementById(id);
  if (element && value !== null && value !== undefined) {
    element.value = value;
  }
}

function setChecked(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.checked = value;
  }
}

function getValue(id) {
  const element = document.getElementById(id);
  return element ? element.value.trim() : defaultSettings[id];
}

function getChecked(id) {
  const element = document.getElementById(id);
  return element ? element.checked : defaultSettings[id];
}

function hslToHex(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function hexToHsl(hex) {
  hex = hex.replace("#", "");

  let r, g, b;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16) / 255;
    g = parseInt(hex[1] + hex[1], 16) / 255;
    b = parseInt(hex[2] + hex[2], 16) / 255;
  } else if (hex.length === 6) {
    r = parseInt(hex[0] + hex[1], 16) / 255;
    g = parseInt(hex[2] + hex[3], 16) / 255;
    b = parseInt(hex[4] + hex[5], 16) / 255;
  } else {
    return null;
  }

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function saveGeneralSettings() {
  readSettingsFromUI();
  saveSettings();
  showNotification("Settings", "General settings saved!");
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("⚙️ Initializing settings system");
  loadSettings();
  requestNotificationPermission();

  // Set up typing detection
  const messageBox = document.getElementById("msgBox");
  if (messageBox) {
    messageBox.addEventListener("input", handleTyping);
  }

  console.log("✅ Settings system ready");
});

// Global functions
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.showSettingsSection = showSettingsSection;
window.saveGeneralSettings = saveGeneralSettings;
window.updateColor = updateColor;
window.downloadChatData = downloadChatData;
