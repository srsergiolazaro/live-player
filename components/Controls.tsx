
import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Plus, ListMusic } from 'lucide-react';
import { PlayState } from '../types';

interface ControlsProps {
  playState: PlayState;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onAddSong: () => void;
  togglePlaylist: () => void;
}

const Controls: React.FC<ControlsProps> = ({ 
    playState, 
    onPlayPause, 
    onNext, 
    onPrev,
    onAddSong,
    togglePlaylist
}) => {
  const ButtonBase = "group relative flex items-center justify-center transition-all active:translate-y-[2px] shadow-[0_4px_0_#333] active:shadow-none rounded-md border border-stone-600";
  
  return (
    <div className="w-full max-w-2xl bg-stone-800/80 p-4 rounded-b-xl border-t border-stone-700 flex items-center justify-between gap-4">
      
      {/* Transport Controls */}
      <div className="flex gap-3 bg-stone-900 p-2 rounded-lg shadow-inner border border-stone-700">
        <button 
            onClick={onPrev}
            className={`${ButtonBase} w-12 h-12 bg-stone-300 hover:bg-stone-200 text-stone-800`}
            aria-label="Anterior"
            title="Anterior"
        >
            <SkipBack size={20} fill="currentColor" />
        </button>

        <button 
            onClick={onPlayPause}
            className={`${ButtonBase} w-16 h-12 ${playState === PlayState.PLAYING ? 'bg-green-500 text-green-900' : 'bg-stone-300 text-stone-800'} hover:opacity-90`}
            aria-label="Reproducir/Pausar"
            title={playState === PlayState.PLAYING ? "Pausar" : "Reproducir"}
        >
            {playState === PlayState.PLAYING ? (
                <Pause size={24} fill="currentColor" />
            ) : (
                <Play size={24} fill="currentColor" />
            )}
        </button>

        <button 
            onClick={onNext}
            className={`${ButtonBase} w-12 h-12 bg-stone-300 hover:bg-stone-200 text-stone-800`}
            aria-label="Siguiente"
            title="Siguiente"
        >
            <SkipForward size={20} fill="currentColor" />
        </button>
      </div>

      {/* Feature Buttons */}
      <div className="flex gap-2">
         <button 
            onClick={onAddSong}
            className={`${ButtonBase} w-12 h-12 bg-amber-600 hover:bg-amber-500 text-white shadow-[0_4px_0_#78350f]`}
            title="Agregar Canción"
         >
            <Plus size={24} />
         </button>
         <button 
            onClick={togglePlaylist}
            className={`${ButtonBase} w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_0_#1e3a8a]`}
            title="Lista de Reproducción"
         >
            <ListMusic size={24} />
         </button>
      </div>
    </div>
  );
};

export default Controls;
