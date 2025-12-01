
import React, { useState } from 'react';
import { X, ExternalLink, Key, Check } from 'lucide-react';
import { getAuthUrl } from '../utils/spotify';

interface SpotifyConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SpotifyConfigModal: React.FC<SpotifyConfigModalProps> = ({ isOpen, onClose }) => {
  const [clientId, setClientId] = useState('');
  const [manualToken, setManualToken] = useState('');
  
  // Auto-detect current URL for redirect
  const redirectUri = window.location.origin + window.location.pathname;

  if (!isOpen) return null;

  const handleLogin = () => {
    if (!clientId) return;
    localStorage.setItem('spotify_client_id', clientId);
    window.location.href = getAuthUrl(clientId, redirectUri);
  };

  const handleManualTokenSave = () => {
    if (!manualToken) return;
    // Clean the token string just in case
    const token = manualToken.trim();
    localStorage.setItem('spotify_access_token', token);
    // Force reload to pick up the new token in App.tsx
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#191414] text-white rounded-3xl p-8 relative shadow-[0_0_50px_rgba(29,185,84,0.2)] border border-[#1db954]/20 overflow-y-auto max-h-[90vh]">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-500 hover:text-white transition-colors">
            <X size={24} />
        </button>

        <h2 className="text-3xl font-black italic tracking-tighter mb-2 text-[#1db954]">CONFIGURACIÓN SPOTIFY</h2>
        <p className="text-sm text-stone-400 mb-6">
            Para ver "Qué estoy escuchando", necesitas un Token de Usuario con permisos (Scopes).
        </p>

        {/* OPTION 1: AUTO CONNECT */}
        <div className="mb-8 p-4 bg-stone-900/50 rounded-xl border border-stone-800">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                <ExternalLink size={14} className="text-[#1db954]" /> Opción A: Conexión Automática
            </h3>
            <p className="text-xs text-stone-500 mb-4">Recomendado. Requiere crear una App en Spotify Dashboard.</p>
            
            <div className="space-y-3">
                <div>
                    <label className="text-[10px] font-bold uppercase text-stone-500 ml-1">Client ID</label>
                    <input 
                        type="text" 
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        placeholder="Pega tu Client ID aquí"
                        className="w-full bg-black border border-stone-700 rounded-lg py-2 px-3 text-sm font-mono focus:border-[#1db954] focus:outline-none text-white"
                    />
                </div>
                <div className="text-[10px] font-mono text-stone-600 break-all bg-black/30 p-2 rounded">
                    Redirect URI: <span className="text-stone-400 select-all">{redirectUri}</span>
                </div>
                <button 
                    onClick={handleLogin}
                    disabled={!clientId}
                    className="w-full bg-[#1db954] text-black font-bold py-3 rounded-lg hover:bg-[#1ed760] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    CONECTAR
                </button>
            </div>
        </div>

        {/* OPTION 2: MANUAL TOKEN */}
        <div className="p-4 bg-stone-900/50 rounded-xl border border-stone-800">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                <Key size={14} className="text-amber-500" /> Opción B: Token Manual
            </h3>
            <p className="text-xs text-stone-500 mb-4">
                Si prefieres generar el token tú mismo (vía CURL o Web API Console). 
                <br/>
                <span className="text-red-400">Nota: El token 'client_credentials' NO funcionará para ver tu reproducción.</span>
            </p>

            <div className="space-y-3">
                <input 
                    type="text" 
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="BQC..."
                    className="w-full bg-black border border-stone-700 rounded-lg py-2 px-3 text-sm font-mono focus:border-amber-500 focus:outline-none text-white"
                />
                <button 
                    onClick={handleManualTokenSave}
                    disabled={!manualToken}
                    className="w-full bg-stone-800 text-white font-bold py-3 rounded-lg hover:bg-stone-700 disabled:opacity-50 border border-stone-600 transition-colors flex items-center justify-center gap-2"
                >
                    <Check size={16} />
                    GUARDAR TOKEN
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default SpotifyConfigModal;
