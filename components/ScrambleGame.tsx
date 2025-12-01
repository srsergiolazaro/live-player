
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { Terminal, BrainCircuit, CheckCircle2, Lock, Unlock, Hash } from 'lucide-react';

interface ScrambleGameProps {
  onBack: () => void;
  lastChatMessage: ChatMessage | null;
}

const WORDS = [
  "METALLICA", "NIRVANA", "SHAKIRA", "MADONNA", "EMINEM", 
  "QUEEN", "BEATLES", "GORILLAZ", "ROSALIA", "DRAKE", 
  "COLDPLAY", "RIHANNA", "BEYONCE", "SKRILLEX", "DAFT PUNK"
];

const ScrambleGame: React.FC<ScrambleGameProps> = ({ onBack, lastChatMessage }) => {
  const [targetWord, setTargetWord] = useState("");
  const [scrambledWord, setScrambledWord] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [roundWinner, setRoundWinner] = useState<{name: string, color: string} | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'solved' | 'failed'>('playing');

  // Initialize Round
  useEffect(() => {
    startRound();
  }, []);

  const startRound = () => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    setTargetWord(word);
    setScrambledWord(shuffleWord(word));
    setTimeLeft(30);
    setGameState('playing');
    setRoundWinner(null);
  };

  const shuffleWord = (word: string) => {
    // Keep shuffling until it's actually different
    let shuffled = word.split('').sort(() => Math.random() - 0.5).join('');
    while (shuffled === word && word.length > 1) {
        shuffled = word.split('').sort(() => Math.random() - 0.5).join('');
    }
    return shuffled;
  };

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('failed');
          setTimeout(startRound, 4000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Check Chat Input
  useEffect(() => {
    if (gameState !== 'playing' || !lastChatMessage) return;

    const guess = lastChatMessage.text.trim().toUpperCase();
    
    // Fuzzy matching or direct match
    if (guess === targetWord || (guess.includes(targetWord) && guess.length < targetWord.length + 5)) {
        handleWin(lastChatMessage.username, lastChatMessage.color);
    }

  }, [lastChatMessage, targetWord, gameState]);

  const handleWin = (username: string, color: string) => {
    setGameState('solved');
    setRoundWinner({ name: username, color });
    setScore(s => s + 100 + (timeLeft * 10));
    setTimeout(startRound, 4000);
  };

  return (
    <div className="w-full h-full bg-slate-900 relative overflow-hidden flex flex-col font-mono select-none">
       {/* Matrix Background */}
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10"></div>
       <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-black pointer-events-none"></div>

       {/* HUD */}
       <div className="relative z-10 flex justify-between items-center p-4 border-b border-green-500/30 bg-black/40">
           <div className="flex flex-col">
               <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Puntaje Sistema</span>
               <span className="text-2xl font-black text-white">{score.toString().padStart(6, '0')}</span>
           </div>
           <div className={`flex items-center gap-2 px-3 py-1 rounded border ${timeLeft < 10 ? 'border-red-500 text-red-500 animate-pulse' : 'border-green-500 text-green-400'}`}>
               <Hash size={16} />
               <span className="font-bold text-xl">{timeLeft}s</span>
           </div>
       </div>

       {/* Game Area */}
       <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-4">
           
           <div className="mb-8 text-center">
               <div className="flex items-center justify-center gap-2 text-green-400 mb-2 opacity-70">
                   <Terminal size={14} />
                   <span className="text-xs tracking-[0.3em] uppercase">Desencriptación Requerida</span>
               </div>
               
               {gameState === 'playing' ? (
                   <div className="relative">
                       <h2 className="text-4xl sm:text-5xl font-black text-white tracking-[0.2em] break-all text-center drop-shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse">
                           {scrambledWord.split('').map((char, i) => (
                               <span key={i} className="inline-block mx-1 hover:text-green-400 transition-colors">{char}</span>
                           ))}
                       </h2>
                       <div className="text-center mt-4 text-xs text-stone-500">
                           IDENTIFICA AL ARTISTA
                       </div>
                   </div>
               ) : gameState === 'solved' ? (
                   <div className="animate-bounce-in">
                       <div className="flex justify-center mb-2">
                           <Unlock size={48} className="text-green-400" />
                       </div>
                       <h2 className="text-4xl font-black text-green-400 tracking-widest">{targetWord}</h2>
                       <div className="mt-4 bg-green-900/40 border border-green-500 px-4 py-2 rounded-lg inline-block">
                           <span className="text-xs text-green-300 mr-2">DESCIFRADO POR:</span>
                           <span className="font-bold text-white" style={{ color: roundWinner?.color }}>{roundWinner?.name}</span>
                       </div>
                   </div>
               ) : (
                   <div className="opacity-60 grayscale">
                       <div className="flex justify-center mb-2">
                           <Lock size={48} className="text-red-500" />
                       </div>
                       <h2 className="text-4xl font-black text-red-500 tracking-widest">{targetWord}</h2>
                       <div className="mt-2 text-red-400 font-bold">ACCESO DENEGADO</div>
                   </div>
               )}
           </div>

           {/* Decor */}
           <div className="absolute bottom-20 left-0 w-full h-1 bg-green-500/20">
               <div className="h-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,1)] animate-progress" style={{ width: `${(timeLeft/30)*100}%` }}></div>
           </div>

       </div>

       {/* Footer */}
       <div className="p-4 bg-black/60 border-t border-green-900/50 flex justify-between items-center relative z-10">
           <div className="flex items-center gap-2 text-xs text-stone-400">
               <BrainCircuit size={14} className="text-green-600" />
               <span>Escribe la respuesta en el chat</span>
           </div>
           <button 
               onClick={onBack}
               className="text-[10px] uppercase font-bold text-stone-500 hover:text-white transition-colors"
           >
               Abortar Misión
           </button>
       </div>
    </div>
  );
};

export default ScrambleGame;
