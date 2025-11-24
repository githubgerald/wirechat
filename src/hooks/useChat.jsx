import { useState, useEffect } from 'react';

export function useChat() {
    const [currentChatId, setCurrentChatId] = useState(1234);
    const [messages, setMessages] = useState([]);
    const [channelNames, setChannelNames] = useState({});

    // FIX: Point to Flask server on port 5000
    const API_BASE_URL = "http://localhost:5000/api/v0/chats/";

    const chatSelect = (chatId) => {
        setCurrentChatId(chatId);
        fetchMessages(chatId);
    };

    const fetchMessages = async (chatId) => {
    try {
        const response = await fetch(`${API_BASE_URL}${chatId}`);
        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('API Response:', data); // Add this line
        console.log('Messages array:', data.messages); // Add this line
        
        setMessages(data.messages || []);
        if (data.channel_name) {
        setChannelNames(prev => ({
            ...prev,
            [chatId]: data.channel_name
        }));
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
    };

    const sendMessage = async (message) => {
        if (!message.trim()) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}${currentChatId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'User',
                    message: message,
                    userType: 'user'
                })
            });
            
            if (response.ok) {
                fetchMessages(currentChatId);
                return true;
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
        return false;
    };

    useEffect(() => {
        fetchMessages(currentChatId);
    }, []);

    return {
        currentChatId,
        messages,
        channelNames,
        chatSelect,
        sendMessage
    };
}