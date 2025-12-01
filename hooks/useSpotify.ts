
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchNowPlaying, fetchQueue, sendSpotifyCommand } from '../utils/spotify';
import { Song, PlayState } from '../types';

export const useSpotify = (token: string | null) => {
  const [spotifySong, setSpotifySong] = useState<Song | null>(null);
  const [spotifyPlayState, setSpotifyPlayState] = useState<PlayState>(PlayState.STOPPED);
  const [spotifyProgress, setSpotifyProgress] = useState(0); // 0-100
  const [spotifyDuration, setSpotifyDuration] = useState(0); // Seconds
  const [spotifyCurrentTime, setSpotifyCurrentTime] = useState(0); // Seconds
  const [spotifyQueue, setSpotifyQueue] = useState<Song[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Polling ref to avoid overlaps
  const isPolling = useRef(false);

  const mapSpotifyItemToSong = (item: any): Song => {
    return {
      id: item.id,
      title: item.name,
      artist: item.artists.map((a: any) => a.name).join(', '),
      duration: formatDuration(item.duration_ms),
      url: item.preview_url || '', // Spotify doesn't always give MP3s, but we control via API
      coverUrl: item.album.images[0]?.url || '',
      color: 'bg-green-600', // Spotify Brand Color
      type: 'music',
      isSpotify: true,
      spotifyUri: item.uri
    };
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
  };

  const syncSpotify = useCallback(async () => {
    if (!token || isPolling.current) return;
    isPolling.current = true;

    try {
      // 1. Get Now Playing
      const nowPlayingData = await fetchNowPlaying(token);
      
      if (nowPlayingData && nowPlayingData.item) {
        const song = mapSpotifyItemToSong(nowPlayingData.item);
        setSpotifySong(song);
        setSpotifyPlayState(nowPlayingData.is_playing ? PlayState.PLAYING : PlayState.PAUSED);
        
        // Time Calc
        const progressMs = nowPlayingData.progress_ms;
        const durationMs = nowPlayingData.item.duration_ms;
        setSpotifyCurrentTime(progressMs / 1000);
        setSpotifyDuration(durationMs / 1000);
        setSpotifyProgress((progressMs / durationMs) * 100);
      } else {
        // Nothing playing
        setSpotifyPlayState(PlayState.PAUSED);
      }

      // 2. Get Queue (Optional, less frequent?)
      // We only fetch queue if we have a song, to save API calls
      if (nowPlayingData) {
          const queueData = await fetchQueue(token);
          if (queueData && queueData.queue) {
              const queueMapped = queueData.queue.slice(0, 10).map(mapSpotifyItemToSong);
              setSpotifyQueue(queueMapped);
          }
      }

      setError(null);
    } catch (e) {
      console.error("Spotify Sync Error", e);
      setError("Error syncing with Spotify");
    } finally {
      isPolling.current = false;
    }
  }, [token]);

  // Polling Effect
  useEffect(() => {
    if (!token) return;
    
    // Initial sync
    syncSpotify();

    // Poll every 3 seconds
    const interval = setInterval(syncSpotify, 3000);
    return () => clearInterval(interval);
  }, [token, syncSpotify]);

  // Controls
  const spotifyNext = async () => {
    if (token) {
        await sendSpotifyCommand(token, 'next');
        setTimeout(syncSpotify, 500); // Sync quickly after action
    }
  };

  const spotifyPrev = async () => {
    if (token) {
        await sendSpotifyCommand(token, 'previous');
        setTimeout(syncSpotify, 500);
    }
  };

  const spotifyTogglePlay = async () => {
    if (token) {
        const cmd = spotifyPlayState === PlayState.PLAYING ? 'pause' : 'play';
        await sendSpotifyCommand(token, cmd);
        setSpotifyPlayState(cmd === 'play' ? PlayState.PLAYING : PlayState.PAUSED);
        setTimeout(syncSpotify, 500);
    }
  };

  return {
    spotifySong,
    spotifyPlayState,
    spotifyProgress,
    spotifyDuration,
    spotifyCurrentTime,
    spotifyQueue,
    spotifyNext,
    spotifyPrev,
    spotifyTogglePlay,
    error
  };
};
