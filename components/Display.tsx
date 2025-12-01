
import React, { useEffect, useState } from 'react';
import { Song } from '../types';

interface DisplayProps {
  song: Song;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const Display: React.FC<DisplayProps> = ({ song, isPlaying, currentTime, duration }) => {
  const [bars, setBars] = useState<number[]>(Array(16).fill(10));

  // Simulate spectrum analyzer
  useEffect(() => {
    if (!isPlaying) {
        setBars(Array(16).fill(2));
        return;
    }
    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.random() * 100));
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="w-full max-w-2xl h-32 bg-black border-4 border-gray-700 rounded-lg relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,1)] p-4 mb-6">
        {/* Glass Reflection */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none z-20 rounded-lg"></div>
        <div className="crt-overlay absolute inset-0 z-20"></div>
        
        <div className="flex justify-between items-center h-full z-10 relative font-['VT323'] text-amber-500 text-shadow-glow">
            
            {/* Left Side: Info */}
            <div className="flex flex-col w-1/2">
                <div className="text-xs text-amber-700 uppercase tracking-widest mb-1">Reproduciendo</div>
                <div className="text-2xl leading-none truncate whitespace-nowrap animate-pulse-slow">
                    {song.artist}
                </div>
                <div className="text-3xl leading-none truncate text-amber-300 filter drop-shadow-[0_0_5px_rgba(255,180,0,0.8)]">
                    {song.title}
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-xl">{formatTime(currentTime)}</span>
                    <span className="text-amber-800">/</span>
                    <span className="text-xl text-amber-700">{formatTime(duration)}</span>
                </div>
            </div>

            {/* Right Side: Visualizer */}
            <div className="flex items-end justify-end gap-[2px] h-16 w-1/2 opacity-90">
                {bars.map((height, i) => (
                    <div key={i} className="flex flex-col-reverse h-full w-3 gap-[1px]">
                        {Array.from({ length: 10 }).map((_, j) => {
                            // Calculate if this segment is "lit"
                            const threshold = j * 10;
                            const isLit = height > threshold;
                            // Top bars are red, middle yellow, bottom green
                            let colorClass = 'bg-amber-900';
                            if (isLit) {
                                if (j > 7) colorClass = 'bg-red-500 shadow-[0_0_5px_red]';
                                else if (j > 4) colorClass = 'bg-yellow-400 shadow-[0_0_5px_yellow]';
                                else colorClass = 'bg-green-500 shadow-[0_0_5px_green]';
                            }
                            return (
                                <div key={j} className={`w-full h-[10%] ${colorClass} transition-colors duration-75 rounded-[1px]`}></div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
        
        {/* Playing Indicator */}
        {isPlaying && (
             <div className="absolute top-2 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_red] z-30"></div>
        )}
    </div>
  );
};

export default Display;
