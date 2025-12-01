
import React from 'react';
import { Song, PlayState, ChatMessage } from '../types';
import Screen from './Screen';

interface MP3PlayerProps {
  currentSong: Song;
  playlist: Song[];
  playState: PlayState;
  currentTime: number;
  duration: number;
  progress: number;
  currentIndex: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSkipIntro: () => void;
  onAdd: () => void;
  onToggleView: (view: 'player' | 'library' | 'games' | 'voting' | 'trivia' | 'scramble' | 'duel') => void;
  onSelectSong: (index: number) => void;
  onVoteWinner: (index: number) => void;
  onGenerateDJ: () => void;
  isGeneratingDJ: boolean;
  view: 'player' | 'library' | 'games' | 'voting' | 'trivia' | 'scramble' | 'duel';
  direction: 'left' | 'right';
  skipVotes: number;
  lastChatMessage: ChatMessage | null;
}

const MP3Player: React.FC<MP3PlayerProps> = ({
  currentSong,
  playlist,
  playState,
  currentTime,
  duration,
  progress,
  currentIndex,
  onPlayPause,
  onNext,
  onPrev,
  onSkipIntro,
  onAdd,
  onToggleView,
  onSelectSong,
  onVoteWinner,
  onGenerateDJ,
  isGeneratingDJ,
  view,
  direction,
  skipVotes,
  lastChatMessage
}) => {
  return (
    <div className="relative group perspective-1000">
      {/* Device Body */}
      <div className="w-[340px] h-[640px] bg-[#2a2a2a] rounded-[30px] p-4 shadow-[0_30px_60px_-10px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.2)] border-t border-stone-600 relative overflow-hidden flex flex-col items-center transition-transform duration-500 hover:rotate-y-1">
        
        {/* Texture/Grain */}
        <div className="absolute inset-0 bg-[#2a2a2a] opacity-100 pointer-events-none rounded-[30px]" 
             style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`}}>
        </div>

        {/* Branding Top */}
        <div className="w-full flex justify-center mb-4 mt-2 relative z-10">
          <span className="text-stone-400 font-bold tracking-[0.2em] text-sm font-sans opacity-80 drop-shadow-md">SONY</span>
        </div>

        {/* Screen Container */}
        <div className="w-full h-[480px] bg-black rounded-lg border-[3px] border-[#1a1a1a] shadow-[inset_0_0_20px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col">
             {/* Glossy Overlay */}
             <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent z-50 pointer-events-none rounded-lg"></div>
             
             <Screen 
                song={currentSong}
                playlist={playlist}
                playState={playState}
                currentTime={currentTime}
                duration={duration}
                progress={progress}
                currentIndex={currentIndex}
                onPlayPause={onPlayPause}
                onNext={onNext}
                onPrev={onPrev}
                onSkipIntro={onSkipIntro}
                onAdd={onAdd}
                onToggleView={onToggleView}
                onSelectSong={onSelectSong}
                onVoteWinner={onVoteWinner}
                onGenerateDJ={onGenerateDJ}
                isGeneratingDJ={isGeneratingDJ}
                view={view}
                direction={direction}
                skipVotes={skipVotes}
                lastChatMessage={lastChatMessage}
             />
        </div>

        {/* Bottom Logo / Physical Feel */}
        <div className="mt-auto mb-4 w-full flex justify-between items-end px-4 relative z-10">
           {/* Walkman Logo */}
           <div className="w-8 h-8 rounded-full border-2 border-stone-500/30 flex items-center justify-center opacity-50">
                <span className="font-bold text-stone-400 italic font-serif">W.</span>
           </div>
           
           {/* Model Number */}
           <div className="text-[10px] text-stone-600 font-mono tracking-widest">
              NW-A3000
           </div>
        </div>

        {/* Side Button Highlights (Visual Only) */}
        <div className="absolute -right-[2px] top-32 w-[4px] h-12 bg-stone-700 rounded-l-md shadow-lg"></div>
        <div className="absolute -right-[2px] top-48 w-[4px] h-12 bg-stone-700 rounded-l-md shadow-lg"></div>

      </div>
    </div>
  );
};

export default MP3Player;
