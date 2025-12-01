
import React from 'react';
import { PlayState } from '../types';
import { Users, BatteryMedium, AlertTriangle } from 'lucide-react';

interface StatusBarProps {
    playState: PlayState;
    skipVotes: number;
    isVoiceMode: boolean;
}

const StatusBar: React.FC<StatusBarProps> = ({ playState, skipVotes, isVoiceMode }) => {
    return (
        <div className="h-7 flex justify-between items-center px-3 text-[10px] text-stone-400 bg-black/60 backdrop-blur-sm z-30 shrink-0 border-b border-white/5">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-red-500/10 px-1.5 py-0.5 rounded-full border border-red-500/20">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_red]"></div>
                    <span className="text-red-500 font-bold tracking-wider">EN VIVO</span>
                </div>
                <span className="font-mono hidden sm:inline">2h 43m</span>
            </div>
            
            <div className="flex items-center gap-3">
                {/* Simulated Viewer Sentiment Indicator */}
                {!isVoiceMode && skipVotes > 5 && (
                    <div className="flex items-center gap-1 text-red-500 animate-pulse font-bold">
                        <AlertTriangle size={10} />
                        <span>OLA DE HATE</span>
                    </div>
                )}
                
                <div className="flex items-center gap-1 text-stone-500">
                    <Users size={10} />
                    <span>2.4k</span>
                </div>
                <BatteryMedium size={12} className={playState === PlayState.PLAYING ? 'text-green-500' : 'text-stone-600'} />
            </div>
        </div>
    );
};

export default StatusBar;
