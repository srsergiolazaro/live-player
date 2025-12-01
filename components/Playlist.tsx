
import React, { useEffect, useRef } from 'react';
import { Song } from '../types';
import { BarChart2, Music2, Mic2 } from 'lucide-react';

interface PlaylistProps {
  songs: Song[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

const Playlist: React.FC<PlaylistProps> = ({ songs, currentIndex, onSelect }) => {
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRef.current) {
        activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentIndex, songs.length]); // Scroll when index changes or songs are added

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar pb-12 animate-fade-in">
      <div className="px-4 py-2 bg-stone-900/90 sticky top-0 z-10 backdrop-blur-sm border-b border-white/5 mb-2">
        <h3 className="text-xs font-bold text-stone-400 tracking-widest uppercase flex items-center gap-2">
            <Music2 size={12} />
            Lista de Pistas
        </h3>
      </div>
      
      <div className="px-2 space-y-1">
        {songs.map((song, index) => {
            const isActive = index === currentIndex;
            const isVoice = song.type === 'voice';

            return (
                <div 
                    key={song.id}
                    ref={isActive ? activeRef : null}
                    onClick={() => onSelect(index)}
                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all border group
                        ${isActive 
                            ? 'bg-blue-600/20 border-blue-500/30 text-white' 
                            : 'bg-transparent border-transparent hover:bg-white/5 text-stone-400'
                        }
                        ${isVoice ? 'my-2 bg-stone-800/50 border-stone-700/50' : ''}
                    `}
                >
                    {/* Index / Status Icon */}
                    <div className="w-6 flex justify-center shrink-0 text-[10px] font-mono opacity-50">
                        {isActive ? (
                            <BarChart2 size={12} className="text-blue-400 animate-pulse" />
                        ) : isVoice ? (
                            <Mic2 size={12} className="text-amber-500" />
                        ) : (
                            (index + 1).toString().padStart(2, '0')
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col overflow-hidden min-w-0 flex-1">
                        <span className={`font-medium text-xs truncate ${isActive ? 'text-white' : isVoice ? 'text-amber-400' : 'text-stone-300'}`}>
                           {song.title}
                        </span>
                        <span className="text-[10px] truncate opacity-60">{song.artist}</span>
                    </div>

                    {/* Duration */}
                    <span className="text-[10px] font-mono opacity-50 shrink-0">{song.duration}</span>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default Playlist;
