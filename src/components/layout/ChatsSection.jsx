import React from 'react';
import { useChat } from '../../context/ChatContext';

const ChatsSection = () => {
  const { currentChatId, chatSelect, channelNames } = useChat();

  const chatRooms = [
    { id: 1234, name: '1234' },
    { id: 4321, name: '' }
  ];

  React.useEffect(() => {
    // Auto-select first room if none is selected (mirror legacy behaviour)
    if (!currentChatId && chatRooms.length > 0) {
      chatSelect(chatRooms[0].id);
    }
  }, [currentChatId, chatSelect]);

  return (
    <div className="chatsSection">
      <div className="scrollable">
        {chatRooms.map(room => (
          <button
            key={room.id}
            className={`button ${currentChatId === room.id ? 'active-chat' : ''}`}
            data-chat-id={room.id}
            onClick={() => chatSelect(room.id)}
          >
            {channelNames[room.id] || room.name || `Room ${room.id}`}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatsSection;