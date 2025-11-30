import React from 'react';
import { useChat } from '../../context/ChatContext';

const ChatsSection = () => {
  const { currentChatId, chatSelect, channelNames } = useChat();

  const chatRooms = [
    { id: 1234, name: 'General' },
    { id: 4321, name: 'Random' }
  ];

  React.useEffect(() => {
    // Auto-select first room if none is selected (mirror legacy behaviour)
    if (!currentChatId && chatRooms.length > 0) {
      console.log('Auto-selecting default chat:', chatRooms[0].id);
      chatSelect(chatRooms[0].id);
    }
  }, [currentChatId, chatSelect]);

  // Ensure the first chat is marked as active on initial render
  const effectiveCurrentChatId = currentChatId || (chatRooms.length > 0 ? chatRooms[0].id : null);

  return (
    <div className="chatsSection">
      <div className="scrollable">
        {chatRooms.map(room => (
          <button
            key={room.id}
            className={`button ${effectiveCurrentChatId === room.id ? 'active-chat' : ''}`}
            data-chat-id={room.id}
            onClick={() => {
              console.log('Selecting chat:', room.id);
              chatSelect(room.id);
            }}
          >
            {channelNames[room.id] || room.name || `Room ${room.id}`}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatsSection;