
import React, { useState, useEffect, useRef } from 'react';
import { Song, ChatMessage } from '../types';
import { Swords, Crown, CheckCircle2, Users, Timer, Sparkles, Zap, Trophy, Music2 } from 'lucide-react';

interface VotingGameProps {
  playlist: Song[];
  currentIndex: number;
  onWinnerSelected: (winnerIndex: number) => void;
  onBack: () => void;
  lastChatMessage: ChatMessage | null;
}

// Visual Effects Interfaces
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface FloatText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  scale: number;
}

const VotingGame: React.FC<VotingGameProps> = ({ playlist, currentIndex, onWinnerSelected, onBack, lastChatMessage }) => {
  const [candidates, setCandidates] = useState<{song: Song, index: number}[]>([]);
  const [gameState, setGameState] = useState<'intro' | 'voting' | 'calculating' | 'result'>('intro');
  const [timeLeft, setTimeLeft] = useState(60); 
  
  // Real vote counts
  const [votesA, setVotesA] = useState(0);
  const [votesB, setVotesB] = useState(0);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);

  // FX State
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatTexts, setFloatTexts] = useState<FloatText[]>([]);
  const [shake, setShake] = useState(0);

  // Refs
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // --- FX LOOP ---
  const animate = (time: number) => {
    if (lastTimeRef.current !== undefined) {
      // Update Particles
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vy: p.vy + 0.2, // Gravity
        life: p.life - 0.02
      })).filter(p => p.life > 0));

      // Update Floating Texts
      setFloatTexts(prev => prev.map(t => ({
        ...t,
        y: t.y - 2, // Float up faster
        life: t.life - 0.015,
        scale: t.life > 0.8 ? t.scale + 0.05 : t.scale // Pop in
      })).filter(t => t.life > 0));

      // Decay Shake
      setShake(s => Math.max(0, s * 0.9));
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const spawnParticles = (x: number, y: number, color: string, count = 10) => {
      const newParts: Particle[] = [];
      for(let i=0; i<count; i++) {
          newParts.push({
              id: Math.random(),
              x, y,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8 - 2,
              life: 1.0,
              color,
              size: Math.random() * 6 + 2
          });
      }
      setParticles(prev => [...prev, ...newParts]);
  };

  const spawnFloatText = (x: number, y: number, text: string, color: string) => {
      setFloatTexts(prev => [...prev, {
          id: Math.random(),
          x: x + (Math.random() - 0.5) * 20,
          y,
          text,
          color,
          life: 1.0,
          scale: 0.5
      }]);
  };

  // --- GAME LOGIC ---
  useEffect(() => {
    // 1. Pick 2 random songs that are NOT current song
    const availableIndices = playlist
        .map((_, idx) => idx)
        .filter(idx => idx !== currentIndex && playlist[idx].type === 'music');
    
    // Shuffle
    const shuffled = availableIndices.sort(() => 0.5 - Math.random());
    const selectedIndices = shuffled.slice(0, 2);

    if (selectedIndices.length < 2) {
        setCandidates([]);
        return;
    }

    const c1 = { song: playlist[selectedIndices[0]], index: selectedIndices[0] };
    const c2 = { song: playlist[selectedIndices[1]], index: selectedIndices[1] };
    
    setCandidates([c1, c2]);
    setVotesA(0);
    setVotesB(0);
    setTimeLeft(60);

    // Intro animation timer
    const timer = setTimeout(() => {
        setGameState('voting');
        // Intro FX
        setShake(10);
        spawnParticles(window.innerWidth/2, window.innerHeight/2, '#ffffff', 30);
    }, 2000);

    return () => clearTimeout(timer);
  }, [playlist, currentIndex]);

  // TIMER LOGIC
  useEffect(() => {
    if (gameState === 'voting') {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          if (prev <= 10) {
              // Tick effect
              setShake(2);
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  // CHECK FOR TIME UP
  useEffect(() => {
    if (gameState === 'voting' && timeLeft === 0) {
       const winner = votesA >= votesB ? 0 : 1;
       finishVoting(winner);
    }
  }, [timeLeft, gameState, votesA, votesB]);

  // LISTEN TO CHAT
  useEffect(() => {
    if (gameState !== 'voting' || !lastChatMessage) return;

    const text = lastChatMessage.text.trim().toLowerCase();
    const username = lastChatMessage.username;
    
    // Check for A votes
    if (['a', '1', 'uno', 'left', 'izquierda', 'option a'].some(keyword => text.includes(keyword))) {
        setVotesA(prev => prev + 1);
        spawnParticles(window.innerWidth * 0.25, window.innerHeight * 0.8, '#ef4444', 5);
        spawnFloatText(window.innerWidth * 0.25, window.innerHeight * 0.7, `${username} voted A`, '#fca5a5');
        setShake(2);
    }
    // Check for B votes
    else if (['b', '2', 'dos', 'right', 'derecha', 'option b'].some(keyword => text.includes(keyword))) {
        setVotesB(prev => prev + 1);
        spawnParticles(window.innerWidth * 0.75, window.innerHeight * 0.8, '#3b82f6', 5);
        spawnFloatText(window.innerWidth * 0.75, window.innerHeight * 0.7, `${username} voted B`, '#93c5fd');
        setShake(2);
    }

  }, [lastChatMessage, gameState]);

  // Finish Logic
  const finishVoting = (winnerIndexInCandidates: number) => {
    setGameState('calculating');
    setWinnerIdx(winnerIndexInCandidates);

    // Drumroll FX
    setShake(5);
    
    // Dramatic finish
    setTimeout(() => {
        setGameState('result');
        // Explosion for winner
        const x = winnerIndexInCandidates === 0 ? window.innerWidth * 0.25 : window.innerWidth * 0.75;
        spawnParticles(x, window.innerHeight * 0.5, '#fbbf24', 50);
        setShake(20);

        // Actually perform the action after delay
        setTimeout(() => {
            onWinnerSelected(candidates[winnerIndexInCandidates].index);
        }, 5000); // 5 seconds to celebrate
    }, 2000);
  };

  if (candidates.length < 2) return null;

  const [c1, c2] = candidates;
  const totalVotes = votesA + votesB;
  const percentA = totalVotes === 0 ? 50 : Math.round((votesA / totalVotes) * 100);
  const percentB = totalVotes === 0 ? 50 : 100 - percentA;

  return (
    <div 
        className="w-full h-full bg-black relative overflow-hidden flex flex-col font-sans select-none"
        style={{ transform: `translate(${(Math.random() - 0.5) * shake}px, ${(Math.random() - 0.5) * shake}px)` }}
    >
        {/* Dynamic Background */}
        <div className="absolute inset-0 flex transition-all duration-500">
             <div className="flex-1 bg-red-900/20 relative overflow-hidden">
                 <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-sm scale-110" style={{ backgroundImage: `url(${c1.song.coverUrl})` }}></div>
                 {/* Spotlight */}
                 <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-b from-red-500/10 to-transparent transform -skew-x-12"></div>
             </div>
             <div className="flex-1 bg-blue-900/20 relative overflow-hidden">
                 <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-sm scale-110" style={{ backgroundImage: `url(${c2.song.coverUrl})` }}></div>
                 {/* Spotlight */}
                 <div className="absolute top-0 right-1/4 w-1/2 h-full bg-gradient-to-b from-blue-500/10 to-transparent transform skew-x-12"></div>
             </div>
        </div>
        
        {/* FX Layers */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
        {particles.map(p => (
            <div key={p.id} className="absolute rounded-full pointer-events-none" 
                 style={{ left: p.x, top: p.y, width: p.size, height: p.size, backgroundColor: p.color, opacity: p.life }} />
        ))}
        {floatTexts.map(t => (
            <div key={t.id} className="absolute pointer-events-none font-black text-sm text-shadow-sm" 
                 style={{ left: t.x, top: t.y, color: t.color, opacity: t.life, transform: `scale(${t.scale})` }}>
                {t.text}
            </div>
        ))}
        
        {/* INTRO OVERLAY */}
        {gameState === 'intro' && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
                <div className="text-center transform animate-bounce-in">
                    <Swords size={80} className="text-white mx-auto mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                    <h1 className="text-6xl font-black text-white italic tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white to-stone-400">DUELO</h1>
                    <h1 className="text-6xl font-black text-red-500 italic tracking-tighter mb-6 drop-shadow-[0_4px_0_rgba(0,0,0,1)]">DE HITS</h1>
                    <div className="inline-block bg-white/10 border border-white/20 px-6 py-2 rounded-full backdrop-blur-md">
                        <p className="text-xs font-mono text-white tracking-[0.3em] animate-pulse">EL CHAT DECIDE EL GANADOR</p>
                    </div>
                </div>
            </div>
        )}

        {/* CALCULATING OVERLAY */}
        {gameState === 'calculating' && (
             <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                 <div className="text-center">
                     <div className="w-16 h-16 border-4 border-t-amber-500 border-white/10 rounded-full animate-spin mx-auto mb-4"></div>
                     <div className="text-2xl font-black text-white animate-pulse tracking-widest">CONTANDO VOTOS...</div>
                 </div>
             </div>
        )}

        {/* HEADER STATS */}
        {gameState !== 'intro' && (
             <div className="absolute top-4 inset-x-0 z-40 flex justify-center pointer-events-none">
                <div className="bg-black/80 backdrop-blur-md border border-stone-700 rounded-full px-6 py-2 flex items-center gap-6 text-xs font-mono shadow-[0_10px_30px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform">
                    <span className="flex items-center gap-2 text-stone-300">
                        <Users size={14} className="text-amber-500" /> 
                        <span className="font-bold text-lg">{totalVotes}</span> 
                        <span className="opacity-50">VOTOS</span>
                    </span>
                    <span className="w-[1px] h-4 bg-stone-600"></span>
                    <span className={`flex items-center gap-2 ${timeLeft < 10 ? 'text-red-500 font-bold animate-pulse' : 'text-stone-300'}`}>
                        <Timer size={14} /> 
                        <span className="font-bold text-lg">{timeLeft <= 10 ? timeLeft : `00:${timeLeft.toString().padStart(2, '0')}`}</span>
                    </span>
                </div>
             </div>
        )}

        {/* --- LEFT CANDIDATE (A) --- */}
        <div 
            className={`flex-1 relative border-b-4 border-red-600 transition-all duration-700 overflow-hidden group
                ${gameState === 'result' && winnerIdx !== 0 ? 'opacity-20 grayscale flex-[0.5]' : ''}
                ${gameState === 'result' && winnerIdx === 0 ? 'flex-[2]' : ''}
            `}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10"></div>
            
            {/* Massive Album Art Background */}
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[5000ms] group-hover:scale-110"
                 style={{ backgroundImage: `url(${c1.song.coverUrl})` }}></div>
            
            <div className="relative z-20 p-8 flex flex-col justify-center h-full">
                {/* Result Crown */}
                {gameState === 'result' && winnerIdx === 0 && (
                    <div className="absolute top-4 left-4 animate-bounce-in">
                        <Crown size={48} className="text-amber-400 fill-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]" />
                    </div>
                )}

                <div className="flex items-center gap-3 mb-2 animate-slide-right">
                    <div className="bg-red-600 text-white text-xs font-black px-3 py-1 rounded skew-x-[-12deg] shadow-lg border border-red-400">
                        OPCIÓN A
                    </div>
                    {percentA > 50 && <div className="text-red-500 animate-pulse"><Zap size={20} fill="currentColor" /></div>}
                </div>
                
                <h2 className="text-4xl font-black text-white leading-none mb-2 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] truncate max-w-md transform transition-transform group-hover:translate-x-2">
                    {c1.song.title}
                </h2>
                <p className="text-xl text-stone-300 font-bold truncate max-w-sm mb-6 flex items-center gap-2">
                    <Music2 size={16} /> {c1.song.artist}
                </p>
                
                {gameState !== 'intro' && (
                    <div className="mt-2 max-w-[80%] relative">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-4xl font-black text-white tabular-nums tracking-tighter drop-shadow-md">{percentA}%</span>
                            <span className="text-[10px] font-mono text-red-400 opacity-80 uppercase tracking-widest">{votesA} Votos</span>
                        </div>
                        {/* High Tech Bar */}
                        <div className="w-full h-4 bg-stone-900/90 rounded overflow-hidden border border-stone-600 relative shadow-inner">
                            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] z-20 animate-shine"></div>
                            <div 
                                className="h-full bg-gradient-to-r from-red-900 via-red-600 to-red-500 transition-all duration-300 relative" 
                                style={{ width: `${percentA}%` }}
                            >
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_white]"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* VS BADGE CENTER */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
            {gameState === 'result' ? (
                <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.8)] animate-bounce-in border-4 border-white">
                     <Trophy size={48} className="text-white drop-shadow-md" />
                </div>
            ) : (
                <div className="relative group">
                    <div className="absolute inset-0 bg-red-600 blur-xl opacity-50 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                    <div className="w-16 h-16 bg-black border-4 border-white rotate-45 flex items-center justify-center shadow-2xl relative z-10">
                        <div className="-rotate-45 font-black italic text-xl text-white">VS</div>
                    </div>
                </div>
            )}
        </div>

        {/* --- RIGHT CANDIDATE (B) --- */}
        <div 
             className={`flex-1 relative border-t-4 border-blue-600 transition-all duration-700 overflow-hidden group
                ${gameState === 'result' && winnerIdx !== 1 ? 'opacity-20 grayscale flex-[0.5]' : ''}
                ${gameState === 'result' && winnerIdx === 1 ? 'flex-[2]' : ''}
             `}
        >
             <div className="absolute inset-0 bg-gradient-to-l from-black via-black/40 to-transparent z-10"></div>
             
             {/* Massive Album Art Background */}
             <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[5000ms] group-hover:scale-110"
                 style={{ backgroundImage: `url(${c2.song.coverUrl})` }}></div>

             <div className="relative z-20 p-8 flex flex-col justify-center items-end h-full text-right">
                {/* Result Crown */}
                {gameState === 'result' && winnerIdx === 1 && (
                    <div className="absolute bottom-4 left-4 animate-bounce-in">
                        <Crown size={48} className="text-amber-400 fill-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]" />
                    </div>
                )}

                <div className="flex items-center gap-3 mb-2 animate-slide-left flex-row-reverse">
                    <div className="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded skew-x-[-12deg] shadow-lg border border-blue-400">
                        OPCIÓN B
                    </div>
                    {percentB > 50 && <div className="text-blue-500 animate-pulse"><Zap size={20} fill="currentColor" /></div>}
                </div>

                <h2 className="text-4xl font-black text-white leading-none mb-2 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] truncate max-w-md transform transition-transform group-hover:-translate-x-2">
                    {c2.song.title}
                </h2>
                <p className="text-xl text-stone-300 font-bold truncate max-w-sm mb-6 flex items-center gap-2 flex-row-reverse">
                    <Music2 size={16} /> {c2.song.artist}
                </p>

                {gameState !== 'intro' && (
                    <div className="mt-2 w-full max-w-[80%] flex flex-col items-end relative">
                        <div className="flex justify-between items-end mb-2 w-full">
                            <span className="text-[10px] font-mono text-blue-400 opacity-80 uppercase tracking-widest">{votesB} Votos</span>
                            <span className="text-4xl font-black text-white tabular-nums tracking-tighter drop-shadow-md">{percentB}%</span>
                        </div>
                        {/* High Tech Bar */}
                        <div className="w-full h-4 bg-stone-900/90 rounded overflow-hidden border border-stone-600 relative shadow-inner">
                            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] z-20 animate-shine"></div>
                            <div 
                                className="h-full bg-gradient-to-l from-blue-900 via-blue-600 to-blue-500 transition-all duration-300 relative float-right" 
                                style={{ width: `${percentB}%` }}
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_white]"></div>
                            </div>
                        </div>
                    </div>
                )}
             </div>
        </div>

        {/* Footer Chat Prompt */}
        <div className="absolute bottom-0 w-full p-2 text-center z-40 bg-gradient-to-t from-black to-transparent pointer-events-none">
             <div className="inline-flex items-center gap-2 bg-stone-900/50 backdrop-blur px-3 py-1 rounded-full border border-white/10 text-[10px] text-stone-400 font-mono animate-pulse">
                 <span>Escribe</span> 
                 <span className="text-white font-bold bg-stone-800 px-1 rounded">A</span> 
                 <span>o</span> 
                 <span className="text-white font-bold bg-stone-800 px-1 rounded">B</span> 
                 <span>para votar</span>
             </div>
        </div>
    </div>
  );
};

export default VotingGame;
