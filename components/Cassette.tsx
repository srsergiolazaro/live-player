import React from 'react';
import { PlayState, Song } from '../types';

interface CassetteProps {
  song: Song;
  playState: PlayState;
  progress: number; // 0 to 100
}

const Cassette: React.FC<CassetteProps> = ({ song, playState, progress }) => {
  const isPlaying = playState === PlayState.PLAYING;
  
  // Calculate tape spool sizes based on progress
  // Left spool gets smaller, right spool gets bigger
  const leftRadius = 25 - (progress * 0.15); 
  const rightRadius = 10 + (progress * 0.15);

  return (
    <div className="relative w-[320px] h-[200px] bg-stone-800 rounded-2xl border-4 border-stone-700 shadow-[0_0_15px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden select-none">
      {/* Texture Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>
      
      {/* Cassette Body */}
      <div className={`w-[300px] h-[180px] ${song.color || 'bg-amber-700'} rounded-xl relative shadow-inner flex flex-col items-center p-2 transition-colors duration-500`}>
        
        {/* Top Label Area */}
        <div className="w-full h-[40px] bg-stone-200 rounded-t-lg flex items-center justify-between px-4 relative overflow-hidden shadow-md">
            <div className="font-['Permanent_Marker'] text-stone-800 text-lg truncate max-w-[200px]">
                {song.title}
            </div>
            <div className="text-xs font-mono text-stone-500 border border-stone-400 px-1">A</div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
        </div>

        {/* Middle Transparent Window */}
        <div className="w-[240px] h-[90px] bg-stone-900/90 rounded-md mt-2 relative border-2 border-stone-600 flex items-center justify-center overflow-hidden">
          
          {/* Tape Connecting Bar (Visual hack) */}
          <div className="absolute w-full h-[20px] bg-stone-800 top-1/2 -translate-y-1/2 z-0"></div>
          
          {/* Left Spool */}
          <div className="absolute left-8 z-10 flex items-center justify-center">
            {/* The tape roll */}
            <div 
              className="rounded-full bg-stone-900 border-4 border-stone-700"
              style={{ width: `${leftRadius * 2.5}px`, height: `${leftRadius * 2.5}px` }}
            ></div>
            {/* The Spindle */}
            <div className={`absolute w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md ${isPlaying ? 'animate-spin-tape' : ''}`}>
                <div className="w-full h-1 bg-stone-800 absolute"></div>
                <div className="h-full w-1 bg-stone-800 absolute"></div>
                <div className="w-full h-1 bg-stone-800 absolute rotate-45"></div>
                <div className="h-full w-1 bg-stone-800 absolute rotate-45"></div>
            </div>
          </div>

          {/* Right Spool */}
          <div className="absolute right-8 z-10 flex items-center justify-center">
            {/* The tape roll */}
            <div 
              className="rounded-full bg-stone-900 border-4 border-stone-700"
              style={{ width: `${rightRadius * 2.5}px`, height: `${rightRadius * 2.5}px` }}
            ></div>
            {/* The Spindle */}
            <div className={`absolute w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md ${isPlaying ? 'animate-spin-tape' : ''}`}>
                <div className="w-full h-1 bg-stone-800 absolute"></div>
                <div className="h-full w-1 bg-stone-800 absolute"></div>
                <div className="w-full h-1 bg-stone-800 absolute rotate-45"></div>
                <div className="h-full w-1 bg-stone-800 absolute rotate-45"></div>
            </div>
          </div>
          
          {/* Center Markers */}
          <div className="absolute bottom-2 text-stone-500 font-mono text-[10px] z-20">
            100 50 0
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto mb-1 w-full flex justify-center items-end h-[20px]">
             {/* Screw heads */}
             <div className="w-2 h-2 rounded-full bg-stone-400 shadow-sm border border-stone-600 mx-auto"></div>
             <div className="w-2 h-2 rounded-full bg-stone-400 shadow-sm border border-stone-600 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default Cassette;