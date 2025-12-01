
import React, { useState, useCallback, useEffect } from 'react';
import { Song, PlayState } from './types';
import { DEFAULT_PLAYLIST } from './constants';
import MP3Player from './components/MP3Player';
import AddSongModal from './components/AddSongModal';
import ChatOverlay from './components/ChatOverlay';
import SpotifyConfigModal from './components/SpotifyConfigModal';
import { generateDJInterlude } from './utils/ai-dj';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useChat } from './hooks/useChat';
import { useSpotify } from './hooks/useSpotify';
import { getTokenFromUrl } from './utils/spotify';
import { Settings } from 'lucide-react';

const App: React.FC = () => {
  // State: Playlist & UI
  const [playlist, setPlaylist] = useState<Song[]>(DEFAULT_PLAYLIST);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [view, setView] = useState<'player' | 'library' | 'games' | 'voting' | 'trivia' | 'scramble' | 'duel'>('player');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSpotifyModalOpen, setIsSpotifyModalOpen] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [skipVotes, setSkipVotes] = useState(0);
  const [isGeneratingDJ, setIsGeneratingDJ] = useState(false);
  
  // Spotify State
  const [spotifyToken, setSpotifyToken] = useState<string | null>(localStorage.getItem('spotify_access_token'));
  const [useSpotifyMode, setUseSpotifyMode] = useState(false);

  // Check for Token in URL (Implicit Grant Redirect)
  useEffect(() => {
    const token = getTokenFromUrl();
    if (token) {
        setSpotifyToken(token);
        localStorage.setItem('spotify_access_token', token);
        setUseSpotifyMode(true);
        window.location.hash = ''; // Clear URL
    }
  }, []);

  // -- LOGIC SWITCHER --
  const localSong = playlist[currentIndex];
  
  // Hooks
  const localAudio = useAudioPlayer(useSpotifyMode ? undefined : localSong, () => handleNextLocal());
  const spotifyData = useSpotify(useSpotifyMode ? spotifyToken : null);

  const { chatMessages, addMessage } = useChat();

  // Unified Data (Spotify vs Local)
  const currentSong = useSpotifyMode && spotifyData.spotifySong ? spotifyData.spotifySong : localSong;
  const playState = useSpotifyMode ? spotifyData.spotifyPlayState : localAudio.playState;
  const currentTime = useSpotifyMode ? spotifyData.spotifyCurrentTime : localAudio.currentTime;
  const duration = useSpotifyMode ? spotifyData.spotifyDuration : localAudio.duration;
  
  const activePlaylist = useSpotifyMode && spotifyData.spotifyQueue.length > 0 
      ? [currentSong, ...spotifyData.spotifyQueue] 
      : playlist;
  
  // Since Spotify playlist/queue is dynamic, index is less relevant, but we keep it 0 for "Now Playing"
  const activeIndex = useSpotifyMode ? 0 : currentIndex; 
  const progress = duration ? (currentTime / duration) * 100 : 0;

  // -- HANDLERS --

  const handleNextLocal = useCallback(() => {
    setSlideDirection('right');
    setCurrentIndex(prev => (prev < playlist.length - 1 ? prev + 1 : 0));
    setSkipVotes(0);
  }, [playlist.length]);

  const handlePrevLocal = useCallback(() => {
    setSlideDirection('left');
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : playlist.length - 1));
    setSkipVotes(0);
  }, [playlist.length]);

  // Unified Handlers
  const handleNext = () => {
      if (useSpotifyMode) spotifyData.spotifyNext();
      else handleNextLocal();
  };

  const handlePrev = () => {
      if (useSpotifyMode) spotifyData.spotifyPrev();
      else handlePrevLocal();
  };

  const handlePlayPause = () => {
      if (useSpotifyMode) spotifyData.spotifyTogglePlay();
      else localAudio.togglePlayPause();
  };

  const handleSelectSong = (idx: number) => {
    if (useSpotifyMode) return; // Can't select arbitrary songs in simple Spotify mode yet
    setCurrentIndex(idx);
    localAudio.setPlayState(PlayState.PLAYING);
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
    if (text.toLowerCase().includes('skip')) {
        setSkipVotes(prev => prev + 1);
    }
  };

  // Skip Vote Monitor
  useEffect(() => {
    const VOTE_THRESHOLD = 15;
    if (skipVotes >= VOTE_THRESHOLD) {
        handleNext();
        setSkipVotes(0);
    }
  }, [skipVotes]);

  // AI DJ Logic
  const handleDJ = async () => {
    if (isGeneratingDJ || useSpotifyMode) return; // DJ Mode not yet supported on Spotify Mode
    setIsGeneratingDJ(true);
    const nextIndex = (currentIndex + 1) % playlist.length;
    const song = await generateDJInterlude(playlist[currentIndex], playlist[nextIndex]);
    if (song) {
        handleAddSong(song, currentIndex + 1);
    }
    setIsGeneratingDJ(false);
  };

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden font-sans">
        
        {/* Settings / Mode Toggle */}
        <div className="absolute top-4 left-4 z-50 flex gap-2">
            <button 
                onClick={() => setIsSpotifyModalOpen(true)}
                className={`p-2 rounded-full border border-stone-700 transition-all shadow-lg ${useSpotifyMode ? 'bg-[#1db954] text-black' : 'bg-stone-800 text-stone-400 hover:text-white'}`}
                title="Configurar Spotify"
            >
                <Settings size={20} />
            </button>
            {spotifyToken && (
                <button
                    onClick={() => setUseSpotifyMode(!useSpotifyMode)}
                    className="px-3 py-1 bg-stone-800 border border-stone-700 rounded-full text-xs font-bold text-white uppercase"
                >
                    {useSpotifyMode ? 'MODO: SPOTIFY' : 'MODO: CASSETTE'}
                </button>
            )}
        </div>

        <MP3Player 
            currentSong={currentSong}
            playlist={activePlaylist}
            playState={playState}
            currentTime={currentTime}
            duration={duration}
            progress={progress}
            currentIndex={activeIndex}
            onPlayPause={handlePlayPause}
            onNext={handleNext}
            onPrev={handlePrev}
            onSkipIntro={localAudio.skipIntro}
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
        <SpotifyConfigModal 
            isOpen={isSpotifyModalOpen}
            onClose={() => setIsSpotifyModalOpen(false)}
        />
    </div>
  );
};

export default App;
