import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useChat } from '../../context/ChatContext';

const ContextMenu = () => {
  const { editMessage, deleteMessage } = useChat();
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [targetMessage, setTargetMessage] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    // Expose a global function so message components can show the menu
    window.showMessageContextMenu = (message, position) => {
      setTargetMessage(message);
      // clamp to viewport
      const x = Math.max(8, Math.min(position.x, window.innerWidth - 200));
      const y = Math.max(8, Math.min(position.y, window.innerHeight - 200));
      setPos({ x, y });
      setVisible(true);
    };

    const handleMouseDown = (e) => {
      // Only hide on left mouse button (button === 0). Ignore right-clicks (2).
      if (!e || typeof e.button !== 'number') return;
      if (e.button !== 0) return;
      // If the click is inside the menu we should NOT hide it (so buttons can react)
      try {
        if (menuRef.current && menuRef.current.contains(e.target)) {
          return;
        }
      } catch (err) {
        // ignore
      }
      setVisible(false);
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') setVisible(false);
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('keydown', handleEsc);
    return () => {
      delete window.showMessageContextMenu;
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  if (!visible || !targetMessage) return null;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(targetMessage.message || '');
    } catch (e) {
      console.error('Copy failed', e);
    }
    setVisible(false);
  };

  const onDelete = async () => {
    const ok = confirm('Delete this message?');
    if (!ok) return;
    await deleteMessage(targetMessage.uid);
    setVisible(false);
  };

  const onEdit = async () => {
    const newText = prompt('Edit message:', targetMessage.message || '');
    if (newText === null) return; // cancel
    await editMessage(targetMessage.uid, { message: newText });
    setVisible(false);
  };

  const onReply = () => {
    // Insert a mention + quoted text into the message box using global helper
    const username = targetMessage.username || '';
    const snippet = (targetMessage.message || '').slice(0, 200);
    if (window.insertReply) {
      window.insertReply(username, snippet);
    } else if (window.insertMention) {
      window.insertMention(username);
    }
    setVisible(false);
  };

  const onHide = async () => {
    const ok = confirm('Hide this message from view?');
    if (!ok) return;
    await editMessage(targetMessage.uid, { hidden: true });
    setVisible(false);
  };

  const onPin = async () => {
    await editMessage(targetMessage.uid, { pinned: !targetMessage.pinned });
    setVisible(false);
  };

  const onReact = async () => {
    const emoji = prompt('React with (paste emoji):', '👍');
    if (!emoji) return;
    const current = (targetMessage.reactions && typeof targetMessage.reactions === 'object') ? { ...targetMessage.reactions } : {};
    current[emoji] = (current[emoji] || 0) + 1;
    await editMessage(targetMessage.uid, { reactions: current });
    setVisible(false);
  };

  const onDownload = async () => {
    const url = targetMessage.mediaUrl;
    if (!url) {
      alert('No downloadable media for this message');
      return;
    }

    try {
      if (url.startsWith('data:')) {
        // data URI -> download directly
        const a = document.createElement('a');
        a.href = url;
        a.download = targetMessage.fileName || 'download';
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        // Try fetch and blob
        const resp = await fetch(url);
        const blob = await resp.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = targetMessage.fileName || 'download';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      console.error('Download failed', err);
      alert('Download failed');
    }
    setVisible(false);
  };

  const menu = (
    <div
      ref={menuRef}
      className="rc-context-menu"
      style={{
        position: 'fixed',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        zIndex: 2147483647,
        background: 'var(--section-bg, var(--colour-dark))',
        border: '2px solid var(--colour-primary, #66CCDA)',
        borderRadius: '8px',
        padding: '6px 4px',
        boxShadow: 'none',
        minWidth: '180px'
      }}
      role="menu"
      data-theme="dark"
    >
      <button className="contextMenu-button" onClick={onEdit}>Edit</button>
      <button className="contextMenu-button" onClick={onReply}>Reply</button>
      <button className="contextMenu-button" onClick={onCopy}>Copy</button>
      <button className="contextMenu-button" onClick={onDelete}>Delete</button>
      <button className="contextMenu-button" onClick={onHide}>Hide</button>
      <button className="contextMenu-button" onClick={onDownload}>Download</button>
      <button className="contextMenu-button" onClick={onReact}>React</button>
      <button className="contextMenu-button" onClick={onPin}>{targetMessage.pinned ? 'Unpin' : 'Pin'}</button>
    </div>
  );

  return createPortal(menu, document.body);
};

export default ContextMenu;