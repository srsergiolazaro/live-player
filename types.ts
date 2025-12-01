
export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: string; // Display format "mm:ss"
  url: string;
  coverUrl?: string;
  color?: string; // Tape color
  type: 'music' | 'voice'; // New field to distinguish tracks
  isSpotify?: boolean; // Flag for external tracks
  spotifyUri?: string;
}

export enum PlayState {
  STOPPED,
  PLAYING,
  PAUSED
}

export interface ChatMessage {
  id: string;
  username: string;
  text: string;
  color: string;
  isSystem?: boolean;
}

export interface SpotifyConfig {
  clientId: string;
  redirectUri: string;
}
