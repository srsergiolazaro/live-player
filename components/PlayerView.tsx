
import React from 'react';
import { Song } from '../types';
import { Mic } from 'lucide-react';
import SkipVoteHUD from './hud/SkipVoteHUD';

interface PlayerViewProps {
    song: Song;
    currentTime: number;
    duration: number;
    progress: number;
    currentIndex: number;
    direction: 'left' | 'right';
    skipVotes: number;
}

const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const PlayerView: React.FC<PlayerViewProps> = ({ 
    song, 
    currentTime, 
    duration, 
    progress, 
    currentIndex, 
    direction, 
    skipVotes 
}) => {
    const isVoiceMode = song.type === 'voice';

    return (
        <>
            {/* Background Blur Effect */}
            {!isVoiceMode && (
                <div 
                    className="absolute inset-0 opacity-20 bg-cover bg-center blur-xl transform scale-150 transition-all duration-1000 ease-linear animate-fade-in"
                    style={{ backgroundImage: `url(${song.coverUrl})` }}
                ></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60"></div>

            <div className="flex-1 flex flex-col items-center justify-center pb-8 px-6 z-10 animate-fade-in">
                
                {/* VISUAL CENTERPIECE */}
                {isVoiceMode ? (
                    <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
                        <div className="absolute inset-0 bg-amber-500/10 blur-3xl animate-pulse"></div>
                        <div className="w-32 h-32 rounded-full border-2 border-amber-500/50 flex items-center justify-center relative">
                            <div className="absolute w-full h-full rounded-full border border-amber-500/20 animate-ping"></div>
                            <Mic size={48} className="text-amber-400" />
                        </div>
                        <div className="absolute bottom-0 text-amber-500 font-mono text-xs animate-pulse">STREAM HOST</div>
                    </div>
                ) : (
                    <div className="relative w-64 h-64 mb-6 perspective-1000 group">
                        <div 
                            key={song.id} 
                            className={`w-full h-full rounded-xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7)] border border-white/10 overflow-hidden bg-stone-800 relative z-10 ${direction === 'right' ? 'animate-slide-right' : 'animate-slide-left'}`}
                        >
                            <img 
                                src={song.coverUrl} 
                                alt="Album Art" 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                            
                            {/* HUD OVERLAY */}
                            <SkipVoteHUD 
                                currentVotes={skipVotes}
                                threshold={15}
                                timeLeft={currentTime}
                            />
                        </div>
                    </div>
                )}

                {/* SONG INFO & PROGRESS */}
                <div className="w-full flex flex-col items-center">
                    <div className="flex justify-between w-full text-[10px] text-stone-400 font-medium mb-1 px-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{isVoiceMode ? 'INTERLUDE' : `PISTA ${(currentIndex + 1).toString().padStart(2, '0')}`}</span>
                        <span>{isVoiceMode ? '--:--' : formatTime(duration)}</span>
                    </div>

                    <div className="w-full h-1.5 bg-stone-700/50 rounded-full mb-3 overflow-hidden cursor-pointer group">
                        <div 
                            className={`h-full rounded-full relative ${isVoiceMode ? 'bg-amber-500' : 'bg-gradient-to-r from-blue-500 to-cyan-400'}`}
                            style={{ width: `${progress}%` }}
                        >
                            {!isVoiceMode && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_5px_rgba(255,255,255,0.8)] opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                        </div>
                    </div>

                    <h2 className={`text-xl font-bold tracking-tight text-center truncate w-full drop-shadow-md ${isVoiceMode ? 'text-amber-400' : 'text-white'}`}>
                        {song.title}
                    </h2>
                    <p className="text-sm text-stone-400 font-medium text-center truncate w-full drop-shadow-sm">
                        {song.artist}
                    </p>
                </div>
            </div>
        </>
    );
};

export default PlayerView;
