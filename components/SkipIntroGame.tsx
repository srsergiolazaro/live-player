
import React, { useState, useEffect } from 'react';
import { Siren,  FastForward, ThumbsDown } from 'lucide-react';

interface SkipIntroGameProps {
  onComplete: () => void;
  onCancel: () => void;
}

const SkipIntroGame: React.FC<SkipIntroGameProps> = ({ onComplete, onCancel }) => {
  const [power, setPower] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  // Decay mechanics: Power goes down rapidly because the "Cringe" is strong
  useEffect(() => {
    const interval = setInterval(() => {
      setPower((prev) => Math.max(0, prev - 1.5)); 
    }, 50); // Fast tick
    return () => clearInterval(interval);
  }, []);

  // Check win condition
  useEffect(() => {
    if (power >= 100) {
      onComplete();
    }
  }, [power, onComplete]);

  const handleMash = () => {
    setPower((prev) => Math.min(100, prev + 12)); // Harder to fill
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 100);
  };

  return (
    <div className="absolute inset-0 z-50 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in select-none border-[6px] border-red-600">
      
      {/* Background Pulse */}
      <div className="absolute inset-0 bg-red-500/20 animate-pulse pointer-events-none"></div>

      {/* Header */}
      <div className="absolute top-8 w-full text-center z-10 px-4">
        <div className="flex justify-center gap-2 mb-2 animate-bounce">
            <Siren className="text-red-500 fill-red-500" size={32} />
            <Siren className="text-red-500 fill-red-500" size={32} />
        </div>
        <h2 className="text-3xl font-black italic text-white tracking-tighter drop-shadow-[0_4px_0_rgba(0,0,0,1)] uppercase transform -rotate-2">
          CRINGE ALERT!
        </h2>
        <p className="text-[10px] font-mono text-red-200 tracking-widest bg-black/50 inline-block px-2 py-1 mt-2 rounded">
          CHAT IS LEAVING! SKIP NOW!
        </p>
      </div>

      {/* The Central Button */}
      <div className="relative group mt-8">
        {/* Glow effect */}
        <div 
            className="absolute inset-0 bg-red-600 rounded-full blur-2xl transition-opacity duration-100"
            style={{ opacity: 0.5 + (power / 200) }}
        ></div>

        <button
          onClick={handleMash}
          className={`
            relative w-32 h-32 rounded-full border-8 border-red-500 bg-stone-900 
            flex flex-col items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.6)]
            active:scale-95 transition-transform hover:bg-stone-800
            ${isShaking ? 'translate-x-2 translate-y-2' : ''}
          `}
        >
            <FastForward 
                size={48} 
                className={`text-white transition-all duration-100 ${power > 80 ? 'animate-pulse' : ''}`} 
                fill="currentColor"
            />
            <span className="text-[10px] font-black text-red-500 mt-1">MASH!</span>
        </button>

        {/* Circular Progress (CSS Conic Gradient) */}
        <div 
            className="absolute inset-[-15px] rounded-full z-[-1] animate-spin-slow"
            style={{
                background: `conic-gradient(#ef4444 ${power}%, transparent ${power}%)`,
                transform: 'rotate(-90deg)'
            }}
        ></div>
      </div>

      {/* Progress Bar Label */}
      <div className="mt-10 w-56 bg-black h-6 rounded-none skew-x-[-12deg] border-2 border-red-600 overflow-hidden relative shadow-lg">
          <div className="absolute inset-0 flex items-center justify-center z-10">
              <span className="text-xs font-black text-white italic tracking-wider">SAVING STREAM {Math.round(power)}%</span>
          </div>
          <div 
            className="h-full bg-red-600 transition-all duration-75 ease-out"
            style={{ width: `${power}%` }}
          ></div>
      </div>

      {/* Chat Simulation Overlay */}
      <div className="absolute bottom-4 left-0 w-full px-4 space-y-1 opacity-70 pointer-events-none">
          <div className="text-[9px] text-red-300 font-mono bg-black/40 p-1 rounded w-fit animate-slide-right">User123: L song skip pls</div>
          <div className="text-[9px] text-red-300 font-mono bg-black/40 p-1 rounded w-fit animate-slide-right delay-75">xX_Gamer_Xx: ResidentSleeper</div>
          <div className="text-[9px] text-red-300 font-mono bg-black/40 p-1 rounded w-fit animate-slide-right delay-150">ModBot: Viewer count dropping...</div>
      </div>

    </div>
  );
};

export default SkipIntroGame;
