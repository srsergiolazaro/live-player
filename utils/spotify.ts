
// utils/spotify.ts

// Scopes required to read playback state and control it
const SCOPES = [
  "user-read-currently-playing",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-queue" // Needed for playlist/queue info
];

export const getAuthUrl = (clientId: string, redirectUri: string) => {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "token", // Implicit Grant Flow (easiest for client-side only)
    redirect_uri: redirectUri,
    scope: SCOPES.join(" "),
    show_dialog: "true",
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

export const getTokenFromUrl = (): string | null => {
  const hash = window.location.hash;
  if (!hash) return null;
  const params = new URLSearchParams(hash.substring(1));
  return params.get("access_token");
};

// --- API CALLS ---

export const fetchNowPlaying = async (token: string) => {
  const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (res.status === 204 || res.status > 400) return null;
  return await res.json();
};

export const fetchQueue = async (token: string) => {
  const res = await fetch("https://api.spotify.com/v1/me/player/queue", {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!res.ok) return null;
  return await res.json();
};

export const sendSpotifyCommand = async (token: string, command: 'next' | 'previous' | 'play' | 'pause') => {
  let endpoint = "";
  let method = "POST";

  switch (command) {
    case 'next': endpoint = "next"; break;
    case 'previous': endpoint = "previous"; break;
    case 'play': endpoint = "play"; method = "PUT"; break;
    case 'pause': endpoint = "pause"; method = "PUT"; break;
  }

  await fetch(`https://api.spotify.com/v1/me/player/${endpoint}`, {
    method: method,
    headers: { Authorization: `Bearer ${token}` },
  });
};
