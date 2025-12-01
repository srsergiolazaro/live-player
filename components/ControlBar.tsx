
import React from 'react';
import { PlayState } from '../types';
import { Play, Pause, SkipBack, SkipForward, Gamepad2, Disc, ListMusic } from 'lucide-react';

interface ControlBarProps {
    view: string;
    onToggleView: (view: 'player' | 'library' | 'games' | 'voting' | 'trivia' | 'scramble' | 'duel') => void;
    onPrev: () => void;
    onNext: () => void;
    onPlayPause: () => void;
    playState: PlayState;
}

const ControlBar: React.FC<ControlBarProps> = ({ view, onToggleView, onPrev, onNext, onPlayPause, playState }) => {
    const isGameView = ['games', 'voting', 'trivia', 'scramble', 'duel'].includes(view);

    return (
        <div className="w-full h-16 bg-gradient-to-t from-black via-black to-transparent flex items-center justify-between px-3 z-30 shrink-0 pb-1 border-t border-stone-800">
            <button 
                onClick={() => onToggleView(isGameView ? 'player' : 'games')} 
                className={`transition-colors p-2 active:scale-95 flex flex-col items-center gap-0.5 ${isGameView ? 'text-amber-500' : 'text-stone-400 hover:text-amber-400'}`}
                title="Interact"
            >
                <Gamepad2 size={20} />
            </button>
            
            <div className="flex items-center gap-4">
                <button onClick={onPrev} className="text-stone-300 hover:text-white transition-colors p-2 active:scale-90">
                    <SkipBack size={24} className="fill-current" />
                </button>
                
                <button 
                    onClick={onPlayPause}
                    className="w-12 h-12 rounded-full border border-white/20 bg-gradient-to-b from-stone-700 to-stone-800 flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:from-stone-600 hover:to-stone-700 active:scale-95 transition-all group"
                >
                    {playState === PlayState.PLAYING ? (
                        <Pause size={20} className="fill-white drop-shadow-lg" />
                    ) : (
                        <Play size={20} className="fill-white ml-0.5 drop-shadow-lg" />
                    )}
                </button>

                <button onClick={onNext} className="text-stone-300 hover:text-white transition-colors p-2 active:scale-90">
                    <SkipForward size={24} className="fill-current" />
                </button>
            </div>

            <div className="flex gap-1">
                <button 
                    onClick={() => onToggleView(view === 'library' ? 'player' : 'library')} 
                    className={`transition-colors p-2 active:scale-95 flex flex-col items-center gap-0.5 ${view === 'library' ? 'text-blue-400' : 'text-stone-400 hover:text-white'}`}
                    title="Library"
                >
                    {view === 'library' ? <Disc size={20} className="animate-spin-slow" /> : <ListMusic size={20} />}
                </button>
            </div>
        </div>
    );
};

export default ControlBar;
