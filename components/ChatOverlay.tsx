
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { Send, Users, MessageSquare, Terminal, AlertTriangle, FastForward } from 'lucide-react';

interface ChatOverlayProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentTime: number;
  skipVotes: number;
}

const ChatOverlay: React.FC<ChatOverlayProps> = ({ messages, onSendMessage, currentTime, skipVotes }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Show commands logic: Only first 30 seconds
  const showCommands = currentTime < 30;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue('');
  };

  const votePercentage = Math.min((skipVotes / 15) * 100, 100);

  return (
    <div className="fixed top-0 right-0 h-full w-80 bg-[#0f0f0f] border-l border-stone-800 flex flex-col z-50 shadow-2xl animate-slide-left">
      
      {/* Header */}
      <div className="h-12 bg-[#18181b] flex items-center justify-between px-4 text-stone-300 border-b border-black shadow-sm shrink-0 relative z-20">
        <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-amber-500" />
            <span className="font-bold tracking-wider text-xs uppercase">Chat en Vivo</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-stone-500 bg-black/40 px-2 py-1 rounded border border-stone-800">
            <Users size={12} />
            <span>2.4k</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[#0f0f0f] relative">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#0f0f0f] via-transparent to-transparent h-4 z-10"></div>
        
        {messages.map((msg) => {
            const isSkip = msg.text.toLowerCase().includes('skip') || msg.text.toLowerCase().includes('l song');
            return (
                <div key={msg.id} className={`text-sm break-words leading-snug animate-fade-in ${isSkip ? 'opacity-100' : 'opacity-90'}`}>
                    <span style={{ color: msg.color }} className="font-bold mr-2 hover:underline cursor-pointer text-xs uppercase tracking-wide">
                    {msg.username}
                    </span>
                    <span className={`font-medium ${isSkip ? 'text-red-500 font-bold italic' : 'text-stone-300'}`}>
                    {msg.text}
                    </span>
                </div>
            );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ACTIVE COMMANDS PANEL (Animated) */}
      <div 
        className={`bg-stone-900 border-t border-red-900/30 overflow-hidden transition-all duration-500 ease-in-out flex flex-col`}
        style={{ 
            maxHeight: showCommands ? '140px' : '0px',
            opacity: showCommands ? 1 : 0,
            transform: showCommands ? 'translateY(0)' : 'translateY(20px)'
        }}
      >
         <div className="p-3 bg-red-950/20 m-2 rounded-lg border border-red-500/20 relative overflow-hidden group">
            {/* Scanline effect */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>
            
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-red-500 animate-pulse">
                    <Terminal size={14} />
                    <span className="text-[10px] font-black tracking-widest uppercase">Votación Activa</span>
                </div>
                <div className="text-[10px] font-mono text-red-400 bg-red-900/40 px-1.5 rounded">
                    00:{Math.max(0, 30 - Math.floor(currentTime)).toString().padStart(2, '0')}
                </div>
            </div>

            <div className="flex items-center justify-between mb-1">
                 <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm font-mono">!SKIP</span>
                    <span className="text-[10px] text-stone-500 uppercase">Comando</span>
                 </div>
                 <span className="text-xs font-mono text-white">{skipVotes}/15</span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-stone-800 relative">
                <div 
                    className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-300 relative"
                    style={{ width: `${votePercentage}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
            </div>

            <div className="mt-2 text-[9px] text-stone-500 font-mono text-center flex items-center justify-center gap-1">
                <AlertTriangle size={10} className="text-amber-600" />
                <span>Escribe "SKIP" para votar</span>
            </div>
         </div>
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#18181b] border-t border-stone-800 shrink-0 relative z-20">
        <form onSubmit={handleSubmit} className="relative">
            <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="w-full bg-[#09090b] text-white text-sm rounded-lg pl-3 pr-10 py-3 focus:outline-none focus:ring-1 focus:ring-stone-600 border border-stone-800 transition-all placeholder:text-stone-600 font-medium"
            />
            <button 
                type="submit" 
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1.5 hover:bg-stone-800 rounded-md transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                disabled={!inputValue.trim()}
            >
                <Send size={14} />
            </button>
        </form>
      </div>
    </div>
  );
};

export default ChatOverlay;
