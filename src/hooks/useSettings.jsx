import { useState, useEffect } from 'react';

export function useSettings() {
    const [settings, setSettings] = useState({
        theme: 'dark',
        enterToSend: true,
        username: 'User'
    });

    useEffect(() => {
        const saved = localStorage.getItem('app-settings');
        if (saved) {
            setSettings(JSON.parse(saved));
        }
    }, []);

    const updateSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    return { 
        settings, 
        updateSettings,
        openSettings: () => console.log('Open settings')
    };
}