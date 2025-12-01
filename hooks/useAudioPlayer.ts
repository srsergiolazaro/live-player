
import { useState, useEffect, useRef, useCallback } from 'react';
import { PlayState, Song } from '../types';

export const useAudioPlayer = (currentSong: Song | undefined, onSongEnd: () => void) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [playState, setPlayState] = useState<PlayState>(PlayState.STOPPED);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Initialize Audio Object
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
        }
        const audio = audioRef.current;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration || 0);
        const handleEnded = () => {
             // Let parent decide what to do (next song), but reset playstate if needed or keep playing
             onSongEnd();
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.pause();
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [onSongEnd]);

    // Sync React State with Audio Element
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentSong) return;

        // Only reload if URL changes
        if (audio.src !== currentSong.url) {
            audio.src = currentSong.url;
            audio.load();
            if (playState === PlayState.PLAYING) {
                audio.play().catch(e => console.error("Playback failed", e));
            }
        } else {
            // Handle Play/Pause for same song
             if (playState === PlayState.PLAYING && audio.paused) {
                audio.play().catch(e => console.error("Playback failed", e));
            } else if (playState === PlayState.PAUSED && !audio.paused) {
                audio.pause();
            } else if (playState === PlayState.STOPPED) {
                audio.pause();
                audio.currentTime = 0;
            }
        }
    }, [currentSong, playState]);

    const togglePlayPause = useCallback(() => {
        setPlayState(prev => prev === PlayState.PLAYING ? PlayState.PAUSED : PlayState.PLAYING);
    }, []);

    const skipIntro = useCallback(() => {
        if(audioRef.current) audioRef.current.currentTime = 10;
    }, []);

    return {
        audioRef,
        playState,
        setPlayState,
        currentTime,
        duration,
        togglePlayPause,
        skipIntro
    };
};
