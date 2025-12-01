
import React from 'react';
import { Song, PlayState, ChatMessage } from '../types';
import Playlist from './Playlist';
import GamesMenu from './GamesMenu';
import VotingGame from './VotingGame';
import TriviaGame from './TriviaGame';
import ScrambleGame from './ScrambleGame';
import GenreDuelGame from './GenreDuelGame';
import PlayerView from './PlayerView';
import StatusBar from './StatusBar';
import ControlBar from './ControlBar';

interface ScreenProps {
  song: Song;
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

const Screen: React.FC<ScreenProps> = (props) => {
  const { 
    song, 
    playlist, 
    view, 
    onToggleView, 
    onSelectSong, 
    onVoteWinner, 
    onGenerateDJ, 
    isGeneratingDJ, 
    lastChatMessage,
    currentIndex 
  } = props;

  // Render logic for the "Content" area
  const renderMainContent = () => {
    switch(view) {
        case 'games':
            return (
                <GamesMenu 
                    onSelectGame={(game) => onToggleView(game as any)} 
                    onBack={() => onToggleView('player')} 
                    onGenerateDJ={onGenerateDJ}
                    isGeneratingDJ={isGeneratingDJ}
                />
            );
        case 'voting':
            return (
                <VotingGame 
                    playlist={playlist}
                    currentIndex={currentIndex}
                    onWinnerSelected={(winnerIdx) => {
                        onVoteWinner(winnerIdx);
                        onToggleView('player'); 
                    }}
                    onBack={() => onToggleView('games')}
                    lastChatMessage={lastChatMessage}
                />
            );
        case 'trivia':
            return (
                <TriviaGame 
                    playlist={playlist}
                    onBack={() => onToggleView('games')}
                    lastChatMessage={lastChatMessage}
                />
            );
        case 'scramble':
            return (
                <ScrambleGame 
                    onBack={() => onToggleView('games')}
                    lastChatMessage={lastChatMessage}
                />
            );
        case 'duel':
            return (
                <GenreDuelGame 
                    onBack={() => onToggleView('games')}
                    lastChatMessage={lastChatMessage}
                />
            );
        case 'library':
            return (
                <div className="flex-1 bg-stone-950/80 animate-fade-in relative z-10 h-full flex flex-col">
                    <Playlist 
                        songs={playlist}
                        currentIndex={currentIndex}
                        onSelect={onSelectSong}
                    />
                </div>
            );
        case 'player':
        default:
            return (
                <PlayerView 
                    song={song}
                    currentTime={props.currentTime}
                    duration={props.duration}
                    progress={props.progress}
                    currentIndex={props.currentIndex}
                    direction={props.direction}
                    skipVotes={props.skipVotes}
                />
            );
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-stone-900 via-black to-stone-900 flex flex-col text-white relative">
        
        {/* TOP STATUS BAR */}
        <StatusBar 
            playState={props.playState}
            skipVotes={props.skipVotes}
            isVoiceMode={song.type === 'voice'}
        />

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
            {renderMainContent()}
        </div>

        {/* BOTTOM CONTROLS */}
        <ControlBar 
            view={view}
            onToggleView={onToggleView}
            onPrev={props.onPrev}
            onNext={props.onNext}
            onPlayPause={props.onPlayPause}
            playState={props.playState}
        />

    </div>
  );
};

export default Screen;
