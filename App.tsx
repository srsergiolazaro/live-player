
import React, { useState, useCallback, useEffect } from 'react';
import { Song, PlayState } from './types';
import { DEFAULT_PLAYLIST } from './constants';
import MP3Player from './components/MP3Player';
import AddSongModal from './components/AddSongModal';
import ChatOverlay from './components/ChatOverlay';
import { generateDJInterlude } from './utils/ai-dj';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useChat } from './hooks/useChat';

const App: React.FC = () => {
  // State: Playlist & UI
  const [playlist, setPlaylist] = useState<Song[]>(DEFAULT_PLAYLIST);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [view, setView] = useState<'player' | 'library' | 'games' | 'voting' | 'trivia' | 'scramble' | 'duel'>('player');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [skipVotes, setSkipVotes] = useState(0);
  const [isGeneratingDJ, setIsGeneratingDJ] = useState(false);
  
  const currentSong = playlist[currentIndex];
  const VOTE_THRESHOLD = 15;

  // Custom Hooks
  const handleNext = useCallback(() => {
    setSlideDirection('right');
    setCurrentIndex(prev => (prev < playlist.length - 1 ? prev + 1 : 0));
    setSkipVotes(0);
  }, [playlist.length]);

  const { 
    playState, 
    setPlayState, 
    currentTime, 
    duration, 
    togglePlayPause, 
    skipIntro, 
    audioRef 
  } = useAudioPlayer(currentSong, handleNext);

  const { chatMessages, addMessage } = useChat();

  // Navigation Logic
  const handlePrev = useCallback(() => {
    setSlideDirection('left');
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : playlist.length - 1));
    setSkipVotes(0);
  }, [playlist.length]);

  const handleSelectSong = (idx: number) => {
    setCurrentIndex(idx);
    setPlayState(PlayState.PLAYING);
    setSkipVotes(0);
  };

  const handleAddSong = (songData: Omit<Song, 'id'>, position: number) => {
    const newSong: Song = { ...songData, id: Date.now().toString() };
    const newPlaylist = [...playlist];
    newPlaylist.splice(position, 0, newSong);
    setPlaylist(newPlaylist);
  };

  const handleSendMessage = (text: string) => {
    addMessage('You', text, '#3b82f6');
    // Check for skip command
    if (text.toLowerCase().includes('skip')) {
        setSkipVotes(prev => prev + 1);
    }
  };

  // Skip Vote Monitor
  useEffect(() => {
    if (skipVotes >= VOTE_THRESHOLD) {
        handleNext();
    }
  }, [skipVotes, handleNext]);

  // AI DJ Logic
  const handleDJ = async () => {
    if (isGeneratingDJ) return;
    setIsGeneratingDJ(true);
    const nextIndex = (currentIndex + 1) % playlist.length;
    const song = await generateDJInterlude(playlist[currentIndex], playlist[nextIndex]);
    if (song) {
        handleAddSong(song, currentIndex + 1);
    }
    setIsGeneratingDJ(false);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden">
        <MP3Player 
            currentSong={currentSong}
            playlist={playlist}
            playState={playState}
            currentTime={currentTime}
            duration={duration}
            progress={progress}
            currentIndex={currentIndex}
            onPlayPause={togglePlayPause}
            onNext={handleNext}
            onPrev={handlePrev}
            onSkipIntro={skipIntro}
            onAdd={() => setIsAddModalOpen(true)}
            onToggleView={setView}
            onSelectSong={handleSelectSong}
            onVoteWinner={handleSelectSong}
            onGenerateDJ={handleDJ}
            isGeneratingDJ={isGeneratingDJ}
            view={view}
            direction={slideDirection}
            skipVotes={skipVotes}
            lastChatMessage={chatMessages[chatMessages.length - 1] || null}
        />
        <ChatOverlay 
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            currentTime={currentTime}
            skipVotes={skipVotes}
        />
        <AddSongModal 
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAdd={handleAddSong}
            playlistLength={playlist.length}
        />
    </div>
  );
};

export default App;
