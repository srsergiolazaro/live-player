
import React, { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { getAuthUrl } from '../utils/spotify';

interface SpotifyConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SpotifyConfigModal: React.FC<SpotifyConfigModalProps> = ({ isOpen, onClose }) => {
  const [clientId, setClientId] = useState('');
  
  // Auto-detect current URL for redirect
  const redirectUri = window.location.origin + window.location.pathname;

  if (!isOpen) return null;

  const handleLogin = () => {
    if (!clientId) return;
    // Save to local storage so we remember it
    localStorage.setItem('spotify_client_id', clientId);
    window.location.href = getAuthUrl(clientId, redirectUri);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#1db954] text-black rounded-3xl p-8 relative shadow-[0_0_50px_rgba(29,185,84,0.4)]">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-black/50 hover:text-black">
            <X size={24} />
        </button>

        <h2 className="text-3xl font-black italic tracking-tighter mb-2">CONECTAR SPOTIFY</h2>
        <p className="text-sm font-medium mb-6 opacity-80">
            Controla tu música real desde RetroCassette. Necesitas un Client ID.
        </p>

        <div className="bg-black/10 p-4 rounded-xl mb-6 text-xs font-mono">
            <p className="mb-2 font-bold">Instrucciones:</p>
            <ol className="list-decimal pl-4 space-y-1 opacity-80">
                <li>Ve a <a href="https://developer.spotify.com/dashboard" target="_blank" className="underline font-bold">Spotify Dashboard</a></li>
                <li>Crea una app y copia el <strong>Client ID</strong>.</li>
                <li>En "Edit Settings", añade esta Redirect URI:</li>
            </ol>
            <div className="mt-2 bg-black/20 p-2 rounded text-[10px] break-all select-all cursor-pointer hover:bg-black/30 transition-colors">
                {redirectUri}
            </div>
        </div>

        <div className="space-y-4">
            <div>
                <label className="text-xs font-bold uppercase tracking-wider ml-1">Tu Client ID</label>
                <input 
                    type="text" 
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="e.g. 4Z8W4fKeB5..."
                    className="w-full bg-white border-none rounded-xl py-3 px-4 text-sm font-mono focus:ring-4 focus:ring-black/20 focus:outline-none"
                />
            </div>

            <button 
                onClick={handleLogin}
                disabled={!clientId}
                className="w-full bg-black text-white font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                <ExternalLink size={18} />
                AUTORIZAR Y CONECTAR
            </button>
        </div>
      </div>
    </div>
  );
};

export default SpotifyConfigModal;
