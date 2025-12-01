import React, { useState, useEffect } from 'react';
import { Terminal, AlertTriangle } from 'lucide-react';

interface SkipVoteHUDProps {
  currentVotes: number;
  threshold: number;
  timeLeft: number;
}

const SkipVoteHUD: React.FC<SkipVoteHUDProps> = ({ currentVotes, threshold, timeLeft }) => {
  const [shake, setShake] = useState({ x: 0, y: 0 });
  const isHighStakes = currentVotes > (threshold * 0.6); // > 60% votes
  const isCritical = currentVotes >= (threshold - 2); // 1 or 2 votes left

  // Internal shake logic based on intensity
  useEffect(() => {
    if (currentVotes === 0) {
        setShake({ x: 0, y: 0 });
        return;
    }

    const intensity = Math.min((currentVotes / threshold) * 5, 8); // Max 8px shake
    
    const interval = setInterval(() => {
        setShake({
            x: (Math.random() - 0.5) * intensity,
            y: (Math.random() - 0.5) * intensity
        });
    }, 50);

    return () => clearInterval(interval);
  }, [currentVotes, threshold]);

  const progressPercent = Math.min((currentVotes / threshold) * 100, 100);
  const remainingSeconds = Math.max(0, 30 - Math.floor(timeLeft)).toString().padStart(2, '0');

  // Colors based on state
  const accentColor = isHighStakes ? 'text-red-500' : 'text-blue-400';
  const borderColor = isHighStakes ? 'border-red-500/50' : 'border-white/10';
  const bgColor = isHighStakes ? 'bg-red-950/60' : 'bg-black/60';
  const barGradient = isHighStakes ? 'from-red-600 to-orange-600' : 'from-blue-500 to-cyan-400';

  if (timeLeft > 30) return null;

  return (
    <div 
        className={`absolute bottom-6 inset-x-4 z-50 transition-all duration-500 ${timeLeft > 28 ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
        style={{ transform: `translate(${shake.x}px, ${shake.y}px)` }}
    >
        {/* Main Card Container */}
        <div className={`${bgColor} backdrop-blur-md border ${borderColor} rounded-lg overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative group`}>
            
            {/* Background Texture/Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>
            {isHighStakes && <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none"></div>}

            <div className="p-3 relative z-10">
                {/* Header Row: Instruction & Timer */}
                <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-stone-400 font-mono uppercase tracking-widest mb-0.5 flex items-center gap-1">
                             <Terminal size={10} />
                             Escribe :
                        </span>
                        <div className="flex items-baseline gap-2">
                            <span className={`font-black text-xl italic tracking-wider ${accentColor} drop-shadow-md`}>
                                SKIP
                            </span>
                        </div>
                    </div>

                    {/* Timer Box */}
                    <div className="bg-black/40 border border-white/5 rounded px-2 py-1 text-right">
                        <div className="text-[9px] text-stone-500 font-mono">TIEMPO</div>
                        <div className={`font-mono font-bold ${timeLeft > 20 ? 'text-stone-300' : 'text-red-400'}`}>
                            00:{remainingSeconds}
                        </div>
                    </div>
                </div>

                {/* Progress Bar Container */}
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono font-medium px-0.5">
                        <span className={isCritical ? 'text-red-500 animate-bounce' : 'text-stone-300'}>
                           {isCritical ? '¡VOTOS CRÍTICOS!' : 'CONTEO ACTUAL'}
                        </span>
                        <span className="text-white">
                            <span className={accentColor}>{currentVotes}</span>
                            <span className="text-stone-600"> / </span>
                            {threshold}
                        </span>
                    </div>

                    <div className="h-3 bg-stone-900/80 rounded border border-stone-700/50 overflow-hidden relative">
                        {/* Grid Lines inside bar */}
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_19%,rgba(255,255,255,0.1)_20%)] bg-[size:5%_100%] z-20 pointer-events-none"></div>
                        
                        {/* The Bar */}
                        <div 
                            className={`h-full bg-gradient-to-r ${barGradient} transition-all duration-300 ease-out shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
                            style={{ width: `${progressPercent}%` }}
                        >
                            <div className="w-full h-full bg-white/20 animate-shine"></div>
                        </div>
                    </div>
                </div>

                {/* Footer Warning (Only if high stakes) */}
                {isHighStakes && (
                    <div className="mt-2 flex items-center justify-center gap-1.5 text-[9px] text-red-400 font-bold tracking-widest uppercase animate-pulse">
                        <AlertTriangle size={10} />
                        <span>Decisión del Chat Pendiente</span>
                        <AlertTriangle size={10} />
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default SkipVoteHUD;