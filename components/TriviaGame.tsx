
import React, { useState, useEffect, useRef } from 'react';
import { Song, ChatMessage } from '../types';
import { Trophy, Timer, BrainCircuit, User, X, Volume2, Sparkles, Zap } from 'lucide-react';

interface TriviaGameProps {
  playlist: Song[];
  onBack: () => void;
  lastChatMessage: ChatMessage | null;
}

const TriviaGame: React.FC<TriviaGameProps> = ({ playlist, onBack, lastChatMessage }) => {
  // Game State
  const [currentRoundSong, setCurrentRoundSong] = useState<Song | null>(null);
  const [gameState, setGameState] = useState<'countdown' | 'playing' | 'round-end'>('countdown');
  const [score, setScore] = useState(0);
  const [blurLevel, setBlurLevel] = useState(30);
  const [maskedTitle, setMaskedTitle] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [countdown, setCountdown] = useState(3);
  const [roundWinner, setRoundWinner] = useState<string | null>(null);

  // Audio Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stats
  const [streak, setStreak] = useState(0);

  // Initialize Game Logic
  useEffect(() => {
    startNewRound();
    return () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    };
  }, []);

  const startNewRound = () => {
    // Stop previous audio
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }

    // Pick random song
    const musicSongs = playlist.filter(s => s.type === 'music');
    const randomSong = musicSongs[Math.floor(Math.random() * musicSongs.length)];
    
    setCurrentRoundSong(randomSong);
    
    // Reset Round State
    setGameState('countdown');
    setCountdown(3);
    setBlurLevel(30); 
    setTimeLeft(30);
    setRoundWinner(null);

    // Create mask (e.g. "H_t_l C_l_f___ia")
    const title = randomSong.title;
    const mask = title.split('').map(char => 
        /[a-zA-Z0-9]/.test(char) && Math.random() > 0.4 ? '_' : char
    ).join('');
    setMaskedTitle(mask);
  };

  // 1. Countdown Sequence
  useEffect(() => {
    if (gameState !== 'countdown') return;

    if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    } else {
        // Start Game
        setGameState('playing');
        if (currentRoundSong) {
            if (!audioRef.current) audioRef.current = new Audio();
            audioRef.current.src = currentRoundSong.url;
            audioRef.current.volume = 0.5;
            audioRef.current.play().catch(e => console.error("Audio play error", e));
        }
    }
  }, [gameState, countdown, currentRoundSong]);

  // 2. Game Loop (Timer, Blur, Hints)
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
            handleRoundEnd(null); // Time up
            return 0;
        }
        return prev - 1;
      });

      // Reduce blur gradually over 30 seconds
      setBlurLevel(prev => Math.max(0, prev - 1));

      // Reveal hints occasionally
      if (Math.random() > 0.75) {
        setMaskedTitle(prev => {
            if (!currentRoundSong) return prev;
            const trueTitle = currentRoundSong.title;
            const arr = prev.split('');
            const hiddenIndices = arr.map((c, i) => c === '_' ? i : -1).filter(i => i !== -1);
            if (hiddenIndices.length > 0) {
                const revealIdx = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
                arr[revealIdx] = trueTitle[revealIdx];
            }
            return arr.join('');
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, currentRoundSong]);

  // 3. Check Answers
  useEffect(() => {
    if (gameState !== 'playing' || !currentRoundSong || !lastChatMessage) return;

    const guess = lastChatMessage.text.toLowerCase().trim();
    const title = currentRoundSong.title.toLowerCase();
    const artist = currentRoundSong.artist.toLowerCase();

    // Check for "title match" or "artist match"
    const isTitleMatch = title.includes(guess) && guess.length > 3;
    const isArtistMatch = artist.includes(guess) && guess.length > 3;

    if (isTitleMatch || isArtistMatch) {
        handleRoundEnd(lastChatMessage.username);
    }
  }, [lastChatMessage, currentRoundSong, gameState]);

  // Handle Win/Loss
  const handleRoundEnd = (winner: string | null) => {
    if (audioRef.current) {
        audioRef.current.pause(); // Stop music immediately
    }
    
    // Reveal image fully so user knows what it was
    setBlurLevel(0);

    setGameState('round-end');
    setRoundWinner(winner);
    
    if (winner === 'You') {
        setScore(s => s + 100 + (timeLeft * 10));
        setStreak(s => s + 1);
    } else {
        setStreak(0);
    }

    // Delay before next round (6 seconds)
    setTimeout(() => {
        startNewRound();
    }, 6000);
  };

  const handleManualExit = () => {
    if (audioRef.current) audioRef.current.pause();
    onBack();
  }

  if (!currentRoundSong) return null;

  return (
    <div className="w-full h-full bg-stone-900 relative overflow-hidden flex flex-col font-mono select-none">
      
      {/* Background with Dynamic Blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-linear transform scale-110"
        style={{ 
            backgroundImage: `url(${currentRoundSong.coverUrl})`,
            filter: `blur(${blurLevel}px) brightness(0.6)` 
        }}
      ></div>
      
      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none z-10"></div>
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,black_100%)] z-10 pointer-events-none"></div>

      {/* Header HUD */}
      <div className="relative z-20 flex justify-between items-center p-3 bg-black/60 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="flex items-center gap-2">
            <Trophy className="text-yellow-500 animate-bounce" size={16} />
            <span className="text-xl font-black text-white tracking-widest italic">{score}</span>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${timeLeft < 10 ? 'bg-red-900/50 border-red-500 text-red-400 animate-pulse' : 'bg-stone-800/80 border-cyan-500 text-cyan-400'}`}>
            <Timer size={14} />
            <span className="font-bold font-mono">{timeLeft.toString().padStart(2, '0')}s</span>
        </div>
      </div>

      {/* Center Stage */}
      <div className="flex-1 relative z-20 flex flex-col items-center justify-center p-4">
        
        {/* COUNTDOWN OVERLAY */}
        {gameState === 'countdown' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-50 backdrop-blur-sm">
                 <div key={countdown} className="text-8xl font-black text-white italic drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-ping">
                     {countdown > 0 ? countdown : "GO!"}
                 </div>
            </div>
        )}

        {/* PLAYING STATE */}
        {gameState === 'playing' && (
            <div className="w-full relative">
                 {/* Visualizer Circle */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-2 border-cyan-500/30 animate-spin-slow"></div>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full border border-purple-500/30 animate-reverse-spin"></div>
                 
                 <div className="bg-black/60 p-6 rounded-2xl backdrop-blur-md border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] w-full relative overflow-hidden group">
                     
                     {/* Audio Waveform Shimmy */}
                     <div className="absolute bottom-0 left-0 w-full h-1 bg-cyan-500 animate-pulse"></div>

                     <div className="mb-4 text-center">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-900/50 rounded-full text-[10px] font-bold text-purple-300 uppercase tracking-widest mb-2 border border-purple-500/30">
                              <Volume2 size={12} className="animate-pulse" />
                              Reproduciendo
                          </div>
                          <div className="h-16 flex items-center justify-center">
                               <h2 className="text-2xl font-black text-white tracking-[0.2em] break-words drop-shadow-lg leading-tight">
                                    {maskedTitle}
                               </h2>
                          </div>
                     </div>

                     <div className="mt-2 flex items-center justify-center gap-2 text-xs text-stone-400 border-t border-white/5 pt-3">
                         <User size={12} />
                         <span>ARTISTA: </span>
                         <span className="text-cyan-400 font-bold tracking-wider">
                             {currentRoundSong.artist.substring(0, 3)}...
                         </span>
                     </div>
                 </div>
            </div>
        )}

        {/* RESULT STATE */}
        {gameState === 'round-end' && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
                <div className="text-center transform scale-110">
                    {roundWinner ? (
                        <div className="relative">
                             <div className="absolute -inset-10 bg-gradient-to-r from-yellow-500 via-red-500 to-yellow-500 opacity-30 blur-xl animate-pulse"></div>
                             <Sparkles className="mx-auto text-yellow-400 mb-2 w-12 h-12 animate-bounce" />
                             <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 italic tracking-tighter drop-shadow-lg mb-2">
                                 GANADOR
                             </h2>
                             <div className="bg-yellow-900/80 border border-yellow-500 px-6 py-2 rounded-lg inline-block transform rotate-2">
                                 <span className="text-xl font-bold text-white">{roundWinner}</span>
                             </div>
                             <div className="mt-6 text-sm text-stone-400 font-mono">
                                 Canción: <span className="text-white font-bold">{currentRoundSong.title}</span>
                             </div>
                             <div className="mt-4 text-xs font-mono text-cyan-400 animate-pulse">
                                 Siguiente ronda en 6s...
                             </div>
                        </div>
                    ) : (
                        <div className="grayscale">
                            <Zap className="mx-auto text-stone-500 mb-2 w-12 h-12" />
                            <h2 className="text-4xl font-black text-stone-300 italic tracking-tighter mb-2">
                                SE ACABÓ EL TIEMPO
                            </h2>
                            <div className="mt-4 text-stone-400">
                                Era: <span className="text-white font-bold text-lg">{currentRoundSong.title}</span>
                            </div>
                            <div className="mt-8 w-8 h-8 border-4 border-stone-500 border-t-white rounded-full animate-spin mx-auto"></div>
                        </div>
                    )}
                </div>
            </div>
        )}

      </div>

      {/* Footer */}
      <div className="relative z-20 p-4 bg-gradient-to-t from-black via-black/90 to-transparent flex justify-between items-end">
         <div className="flex flex-col gap-1">
             <div className="text-[10px] text-stone-500 font-mono">RACHA</div>
             <div className="flex gap-1">
                 {Array.from({length: Math.min(streak, 5)}).map((_, i) => (
                     <div key={i} className="w-2 h-4 bg-green-500 rounded-sm shadow-[0_0_5px_rgba(34,197,94,0.8)]"></div>
                 ))}
             </div>
         </div>
         <button onClick={handleManualExit} className="bg-stone-800/80 hover:bg-red-900/80 p-3 rounded-full text-white transition-all border border-stone-700 hover:border-red-500 group">
            <X size={20} className="group-hover:rotate-90 transition-transform" />
         </button>
      </div>

    </div>
  );
};

export default TriviaGame;
