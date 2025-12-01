
import { useState, useEffect, useCallback } from 'react';
import { ChatMessage } from '../types';

export const useChat = () => {
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

    const addMessage = useCallback((username: string, text: string, color: string = '#ffffff') => {
        setChatMessages(prev => [...prev, {
            id: Date.now().toString() + Math.random(),
            username,
            text,
            color
        }].slice(-50)); // Keep last 50 messages
    }, []);

    // Simulated Chat Loop
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                const users = ['User1', 'Gamer123', 'MusicFan', 'ChillVibes', 'RetroKing', 'NeonCat', 'SynthWave'];
                const msgs = ['Cool song!', 'Next please', 'Vibe check', 'Hello chat', 'LFG', 'Pog', 'Jamming', 'Skip pls', 'Banger'];
                const u = users[Math.floor(Math.random() * users.length)];
                const m = msgs[Math.floor(Math.random() * msgs.length)];
                
                // Random color for user
                const colors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6'];
                const c = colors[Math.floor(Math.random() * colors.length)];

                addMessage(u, m, c);
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [addMessage]);

    return { chatMessages, addMessage };
};
