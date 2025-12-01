
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { Swords, Zap, Music2, Guitar, Mic2, Speaker, Radio, Crown, Flame, Skull, Trophy } from 'lucide-react';

interface GenreDuelGameProps {
  onBack: () => void;
  lastChatMessage: ChatMessage | null;
}

const GENRES = [
  { id: 'rock', name: 'ROCK', color: '#ef4444', bg: 'bg-red-600', icon: Guitar },
  { id: 'pop', name: 'POP', color: '#ec4899', bg: 'bg-pink-600', icon: Mic2 },
  { id: 'electro', name: 'EDM', color: '#06b6d4', bg: 'bg-cyan-600', icon: Zap },
  { id: 'hiphop', name: 'HIPHOP', color: '#eab308', bg: 'bg-yellow-600', icon: Speaker },
  { id: 'reggae', name: 'LATINO', color: '#22c55e', bg: 'bg-green-600', icon: Radio },
  { id: 'jazz', name: 'JAZZ', color: '#3b82f6', bg: 'bg-blue-600', icon: Music2 },
];

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

const GenreDuelGame: React.FC<GenreDuelGameProps> = ({ onBack, lastChatMessage }) => {
  const [leftGenre, setLeftGenre] = useState(GENRES[0]);
  const [rightGenre, setRightGenre] = useState(GENRES[1]);
  const [balance, setBalance] = useState(50);
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameState, setGameState] = useState<'intro' | 'fight' | 'winner'>('intro');
  
  // Advanced State
  const [leftCombo, setLeftCombo] = useState(0);
  const [rightCombo, setRightCombo] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatTexts, setFloatTexts] = useState<FloatText[]>([]);
  const [shake, setShake] = useState(0); // Screen shake intensity

  // Refs for loops
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Init
  useEffect(() => {
    const shuffled = [...GENRES].sort(() => Math.random() - 0.5);
    setLeftGenre(shuffled[0]);
    setRightGenre(shuffled[1]);
    
    setTimeout(() => setGameState('fight'), 3000);
  }, []);

  // Timer
  useEffect(() => {
    if (gameState !== 'fight') return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setGameState('winner'); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  // ANIMATION LOOP (Particles & Floating Text & Shake Decay)
  const animate = (time: number) => {
    if (lastTimeRef.current !== undefined) {
      // Update Particles
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vy: p.vy + 0.5, // Gravity
        life: p.life - 0.02
      })).filter(p => p.life > 0));

      // Update Floating Texts
      setFloatTexts(prev => prev.map(t => ({
        ...t,
        y: t.y - 1.5, // Float up
        life: t.life - 0.02,
        scale: t.life > 0.8 ? t.scale + 0.05 : t.scale // Pop in effect
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

  // Combo Decay
  useEffect(() => {
      if (gameState !== 'fight') return;
      const interval = setInterval(() => {
          setLeftCombo(c => Math.max(0, c - 1));
          setRightCombo(c => Math.max(0, c - 1));
      }, 1500); // Slower decay for more satisfaction
      return () => clearInterval(interval);
  }, [gameState]);

  // Winning Condition
  useEffect(() => {
      if (gameState === 'fight' && (balance <= 0 || balance >= 100)) {
          setGameState('winner');
      }
  }, [balance, gameState]);

  // --- FX FUNCTIONS ---
  const spawnExplosion = (x: number, y: number, color: string) => {
      const count = 8;
      const newParticles: Particle[] = [];
      for (let i = 0; i < count; i++) {
          newParticles.push({
              id: Math.random(),
              x, y,
              vx: (Math.random() - 0.5) * 10,
              vy: (Math.random() - 0.5) * 10,
              life: 1.0,
              color,
              size: Math.random() * 6 + 2
          });
      }
      setParticles(prev => [...prev, ...newParticles]);
  };

  const spawnText = (x: number, y: number, text: string, color: string) => {
      setFloatTexts(prev => [...prev, {
          id: Math.random(),
          x: x + (Math.random() - 0.5) * 40,
          y,
          text,
          color,
          life: 1.0,
          scale: 0.5
      }]);
  };

  // --- CHAT HANDLER ---
  useEffect(() => {
    if (!lastChatMessage || gameState !== 'fight') return;
    
    const txt = lastChatMessage.text.toUpperCase();
    const isLeft = txt.includes('A') || txt.includes('LEFT') || txt.includes(leftGenre.name) || txt.includes('1');
    const isRight = txt.includes('B') || txt.includes('RIGHT') || txt.includes(rightGenre.name) || txt.includes('2');

    if (isLeft) {
        handleHit('left');
    } else if (isRight) {
        handleHit('right');
    }
  }, [lastChatMessage, gameState]);

  const handleHit = (side: 'left' | 'right') => {
      const power = 1.5; 
      // Si el usuario ya está en "fuego" (combo > 10), el golpe es más fuerte
      const isFire = side === 'left' ? leftCombo > 10 : rightCombo > 10;
      const hitPower = isFire ? 3 : 1.5;

      // Update State
      if (side === 'left') {
          setBalance(b => Math.max(0, b - hitPower));
          setLeftCombo(c => c + 1);
          setRightCombo(0); // Combo Breaker
          setShake(5);
          spawnExplosion(window.innerWidth * 0.75, window.innerHeight * 0.5, leftGenre.color);
          spawnText(window.innerWidth * 0.75, window.innerHeight * 0.4, isFire ? "SUPER!" : "HIT!", leftGenre.color);
      } else {
          setBalance(b => Math.min(100, b + hitPower));
          setRightCombo(c => c + 1);
          setLeftCombo(0);
          setShake(5);
          spawnExplosion(window.innerWidth * 0.25, window.innerHeight * 0.5, rightGenre.color);
          spawnText(window.innerWidth * 0.25, window.innerHeight * 0.4, isFire ? "SUPER!" : "HIT!", rightGenre.color);
      }
  };

  const LeftIcon = leftGenre.icon;
  const RightIcon = rightGenre.icon;
  const winner = balance < 50 ? leftGenre : (balance > 50 ? rightGenre : null);

  // FX States
  const leftFire = leftCombo > 8;
  const rightFire = rightCombo > 8;
  
  // Calculate dynamic scale based on advantage + combo
  // Advantage: 0-1. Combo 0-inf.
  const leftAdvantage = (100 - balance) / 100; // 0 to 1
  const rightAdvantage = balance / 100; // 0 to 1
  
  const leftScale = 1 + (leftAdvantage * 0.3) + (leftCombo * 0.02);
  const rightScale = 1 + (rightAdvantage * 0.3) + (rightCombo * 0.02);

  return (
    <div 
        className="w-full h-full bg-slate-900 relative overflow-hidden flex flex-col font-black select-none"
        style={{ transform: `translate(${(Math.random() - 0.5) * shake}px, ${(Math.random() - 0.5) * shake}px)` }}
    >
       {/* --- DYNAMIC BACKGROUND --- */}
       <div className="absolute inset-0 flex pointer-events-none transition-colors duration-500">
           {/* Left BG */}
           <div 
                className="flex-1 transition-all duration-300 relative overflow-hidden" 
                style={{ 
                    background: `linear-gradient(135deg, ${leftGenre.color}20, black)`,
                    flexBasis: `${50 + (50 - balance)}%` // Dynamic split
                }}
            >
                {leftFire && <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>}
            </div>
           {/* Right BG */}
           <div 
                className="flex-1 transition-all duration-300 relative overflow-hidden" 
                style={{ 
                    background: `linear-gradient(225deg, ${rightGenre.color}20, black)`,
                    flexBasis: `${50 - (50 - balance)}%`
                }}
            >
                {rightFire && <div className="absolute inset-0 bg-orange-500/10 animate-pulse"></div>}
            </div>
       </div>

       {/* Grid & Vignette */}
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] pointer-events-none opacity-60"></div>

       {/* --- PARTICLES LAYER --- */}
       {particles.map(p => (
           <div 
             key={p.id}
             className="absolute rounded-sm pointer-events-none"
             style={{
                 left: p.x, top: p.y,
                 width: p.size, height: p.size,
                 backgroundColor: p.color,
                 opacity: p.life,
                 transform: `rotate(${p.life * 360}deg)`
             }}
           />
       ))}
       
       {/* --- FLOATING TEXT LAYER --- */}
       {floatTexts.map(t => (
           <div
             key={t.id}
             className="absolute pointer-events-none font-black italic text-stroke-black"
             style={{
                 left: t.x, top: t.y,
                 color: t.color,
                 opacity: t.life,
                 transform: `scale(${t.scale})`,
                 textShadow: '0 2px 0 black'
             }}
           >
               {t.text}
           </div>
       ))}


       {/* --- HUD HEADER --- */}
       <div className="relative z-20 flex justify-between items-start p-4 w-full">
           {/* Left Name */}
           <div className="flex flex-col items-start w-1/3">
               <div className="flex items-center gap-2 mb-1 animate-slide-right" style={{ color: leftGenre.color }}>
                   <LeftIcon size={24} className="filter drop-shadow-[0_0_5px_currentColor]" />
                   <span className="text-2xl italic tracking-tighter drop-shadow-md">{leftGenre.name}</span>
               </div>
           </div>

           {/* Timer */}
           <div className="flex flex-col items-center -mt-2">
               <div className="bg-black/80 border-2 border-stone-700 px-4 py-2 rounded-b-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] z-30">
                    <span className={`text-3xl font-mono ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                        {Math.floor(timeLeft / 60)}:{Math.floor(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
               </div>
           </div>

           {/* Right Name */}
           <div className="flex flex-col items-end w-1/3">
               <div className="flex items-center gap-2 mb-1 animate-slide-left flex-row-reverse" style={{ color: rightGenre.color }}>
                   <RightIcon size={24} className="filter drop-shadow-[0_0_5px_currentColor]" />
                   <span className="text-2xl italic tracking-tighter drop-shadow-md">{rightGenre.name}</span>
               </div>
           </div>
       </div>

       {/* --- MAIN BATTLE AREA --- */}
       <div className="flex-1 relative z-10 flex items-center justify-center w-full">
            
            {/* INTRO SCREEN */}
            {gameState === 'intro' && (
                <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-8 mb-6">
                            <LeftIcon size={48} style={{ color: leftGenre.color }} />
                            <div className="text-4xl font-bold text-stone-500 italic">VS</div>
                            <RightIcon size={48} style={{ color: rightGenre.color }} />
                        </div>
                        <h1 className="text-7xl font-black text-white italic tracking-tighter mb-2 animate-bounce-in">FIGHT!</h1>
                        <p className="text-stone-400 font-mono tracking-[0.5em] text-sm animate-pulse">EL CHAT CONTROLA EL JUEGO</p>
                    </div>
                </div>
            )}

             {/* WINNER SCREEN */}
             {gameState === 'winner' && (
                <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50 animate-zoom-in backdrop-blur-md">
                    <div className="text-center relative">
                        <div className="absolute -inset-20 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-xl animate-spin-slow"></div>
                        {winner ? (
                            <>
                                <Crown size={64} className="mx-auto mb-4 animate-bounce" style={{ color: winner.color }} />
                                <div className="text-2xl text-stone-300 font-bold uppercase tracking-widest mb-2">Ganador</div>
                                <div className="text-8xl font-black italic tracking-tighter mb-6 filter drop-shadow-[0_0_30px_currentColor]" style={{ color: winner.color }}>
                                    {winner.name}
                                </div>
                                <Trophy size={32} className="text-yellow-500 mx-auto animate-pulse" />
                            </>
                        ) : (
                            <div className="text-6xl text-stone-400 font-black italic">EMPATE</div>
                        )}
                         <button onClick={onBack} className="mt-12 text-xs text-stone-500 hover:text-white uppercase tracking-widest border border-stone-700 px-6 py-3 rounded-full hover:bg-stone-800 transition-colors">
                            Volver al Menú
                        </button>
                    </div>
                </div>
            )}

            {/* AVATARS & COMBO UI */}
            <div className="w-full flex justify-between items-center px-4 relative h-full">
                
                {/* --- LEFT PLAYER --- */}
                <div className="w-1/2 flex flex-col items-center justify-center h-full relative group">
                    {/* AVATAR */}
                    <div 
                        className="relative transition-transform duration-100 ease-out"
                        style={{ transform: `scale(${Math.min(leftScale, 1.8)})` }}
                    >
                         {leftFire && (
                             <div className="absolute -inset-10 bg-red-500/30 blur-2xl rounded-full animate-pulse"></div>
                         )}
                         <div className={`w-28 h-28 rounded-full flex items-center justify-center border-4 shadow-2xl relative z-10 transition-colors duration-300 ${leftFire ? 'border-yellow-400 bg-red-900' : 'border-stone-700 bg-stone-900'}`}>
                             <LeftIcon size={48} style={{ color: leftGenre.color }} className={leftFire ? 'animate-shake' : ''} />
                         </div>
                    </div>

                    {/* MASSIVE COMBO TEXT */}
                    {leftCombo > 1 && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
                            <div className="text-center animate-bounce-in">
                                <div className="text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white to-stone-400 drop-shadow-[0_4px_0_rgba(0,0,0,1)]"
                                     style={{ textShadow: `0 0 20px ${leftGenre.color}` }}>
                                    {leftCombo}
                                </div>
                                <div className="text-xl font-bold text-white uppercase tracking-widest bg-black/50 px-2 rounded transform -skew-x-12">
                                    COMBO
                                </div>
                            </div>
                        </div>
                    )}
                </div>


                {/* --- CENTER VS --- */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-20">
                    <Swords size={200} className="text-stone-800" />
                </div>


                {/* --- RIGHT PLAYER --- */}
                <div className="w-1/2 flex flex-col items-center justify-center h-full relative group">
                    {/* AVATAR */}
                    <div 
                        className="relative transition-transform duration-100 ease-out"
                        style={{ transform: `scale(${Math.min(rightScale, 1.8)})` }}
                    >
                         {rightFire && (
                             <div className="absolute -inset-10 bg-orange-500/30 blur-2xl rounded-full animate-pulse"></div>
                         )}
                         <div className={`w-28 h-28 rounded-full flex items-center justify-center border-4 shadow-2xl relative z-10 transition-colors duration-300 ${rightFire ? 'border-yellow-400 bg-orange-900' : 'border-stone-700 bg-stone-900'}`}>
                             <RightIcon size={48} style={{ color: rightGenre.color }} className={rightFire ? 'animate-shake' : ''} />
                         </div>
                    </div>

                    {/* MASSIVE COMBO TEXT */}
                    {rightCombo > 1 && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
                            <div className="text-center animate-bounce-in">
                                <div className="text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white to-stone-400 drop-shadow-[0_4px_0_rgba(0,0,0,1)]"
                                     style={{ textShadow: `0 0 20px ${rightGenre.color}` }}>
                                    {rightCombo}
                                </div>
                                <div className="text-xl font-bold text-white uppercase tracking-widest bg-black/50 px-2 rounded transform -skew-x-12">
                                    COMBO
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
       </div>

       {/* --- SUPER METER BAR --- */}
       <div className="relative z-20 px-4 pb-6 pt-2 bg-gradient-to-t from-black to-transparent">
           {/* Bar Container */}
           <div className="w-full h-8 bg-stone-900 rounded-lg border-2 border-stone-600 relative overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                {/* Center Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white z-20 shadow-[0_0_10px_white]"></div>
                
                {/* Left Bar */}
                <div 
                    className="absolute top-0 bottom-0 left-0 transition-all duration-200 ease-linear"
                    style={{ 
                        width: '50%',
                        right: '50%',
                        transform: `scaleX(${(50 - balance + 50) / 50})`, // Scale from center logic hack
                        transformOrigin: 'left', // Actually needs complex math or simpler widths
                        // Easier logic:
                    }}
                >
                    {/* Re-doing simpler bar logic */}
                </div>

                 {/* Left Side Fill */}
                 <div 
                    className="absolute top-0 bottom-0 right-1/2 transition-all duration-300 ease-out"
                    style={{ 
                        width: `${Math.max(0, 50 - balance)}%`,
                        background: `linear-gradient(90deg, ${leftGenre.color}, white)`,
                    }}
                >
                    {/* Electricity */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-30 animate-pulse"></div>
                </div>

                 {/* Right Side Fill */}
                 <div 
                    className="absolute top-0 bottom-0 left-1/2 transition-all duration-300 ease-out"
                    style={{ 
                        width: `${Math.max(0, balance - 50)}%`,
                        background: `linear-gradient(-90deg, ${rightGenre.color}, white)`,
                    }}
                >
                    {/* Electricity */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-30 animate-pulse"></div>
                </div>

           </div>
           
           {/* Footer Text */}
           <div className="flex justify-between items-center mt-2 text-[10px] font-bold font-mono text-stone-500 uppercase">
               <span>DAMAGE: {Math.floor(100 - balance)}%</span>
               <span className={balance < 40 || balance > 60 ? 'text-white animate-pulse' : ''}>
                   {balance < 40 ? `<< ${leftGenre.name} DOMINANDO` : balance > 60 ? `${rightGenre.name} DOMINANDO >>` : 'BATALLA IGUALADA'}
               </span>
               <span>DAMAGE: {Math.floor(balance)}%</span>
           </div>
       </div>

    </div>
  );
};

export default GenreDuelGame;
