import { getCurrentTime } from './dateUtils';

export class NotificationManager {
  constructor() {
    this.permission = this.getPermission();
    this.soundEnabled = true;
  }

  getPermission() {
    return 'Notification' in window ? Notification.permission : 'denied';
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      return 'unsupported';
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  show(title, options = {}) {
    if (this.permission !== 'granted') {
      return null;
    }

    const defaultOptions = {
      icon: '/assets/images/icon.ico',
      badge: '/assets/images/icon.ico',
      timestamp: Date.now(),
      requireInteraction: false,
      silent: !this.soundEnabled,
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      if (this.soundEnabled && !defaultOptions.silent) {
        this.playSound();
      }

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  playSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  showMessageNotification(username, message, roomName = '') {
    const title = roomName ? `${username} in ${roomName}` : `New message from ${username}`;
    const options = {
      body: message.length > 100 ? message.substring(0, 100) + '...' : message,
      tag: 'message',
      renotify: true,
      data: {
        type: 'message',
        username,
        timestamp: getCurrentTime()
      }
    };

    return this.show(title, options);
  }

  showMentionNotification(username, message) {
    const title = `You were mentioned by ${username}`;
    const options = {
      body: message,
      tag: 'mention',
      requireInteraction: true,
      data: {
        type: 'mention',
        username,
        timestamp: getCurrentTime()
      }
    };

    return this.show(title, options);
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
  }

  isSupported() {
    return 'Notification' in window;
  }

  isGranted() {
    return this.permission === 'granted';
  }
}

// Singleton instance
export const notificationManager = new NotificationManager();