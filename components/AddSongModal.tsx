
import React, { useState } from 'react';
import { Song } from '../types';
import { X, Music, User, Link, ListOrdered } from 'lucide-react';

interface AddSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (song: Omit<Song, 'id'>, position: number) => void;
  playlistLength: number;
}

const AddSongModal: React.FC<AddSongModalProps> = ({ isOpen, onClose, onAdd, playlistLength }) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [url, setUrl] = useState('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3');
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=600&auto=format&fit=crop');
  const [position, setPosition] = useState<number>(playlistLength + 1);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      title: title || 'Pista Desconocida',
      artist: artist || 'Artista Desconocido',
      duration: '04:20', 
      url: url,
      coverUrl: coverUrl,
      color: 'bg-stone-600',
      type: 'music'
    }, position - 1); // Convert 1-based index to 0-based
    
    // Reset
    setTitle('');
    setArtist('');
    setPosition(playlistLength + 2);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-[#222] border border-stone-700 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white tracking-wide">AGREGAR PISTA</h2>
            <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors">
                <X size={20} />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-stone-500 font-bold uppercase ml-1">Título</label>
            <div className="relative">
                <Music size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input 
                    type="text" 
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-[#111] border border-stone-700 rounded-lg py-2.5 pl-9 pr-3 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Nombre de la canción"
                />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs text-stone-500 font-bold uppercase ml-1">Artista</label>
            <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input 
                    type="text" 
                    required
                    value={artist}
                    onChange={e => setArtist(e.target.value)}
                    className="w-full bg-[#111] border border-stone-700 rounded-lg py-2.5 pl-9 pr-3 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Nombre del artista"
                />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-stone-500 font-bold uppercase ml-1">URL del Audio</label>
            <div className="relative">
                <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input 
                    type="url" 
                    required
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    className="w-full bg-[#111] border border-stone-700 rounded-lg py-2.5 pl-9 pr-3 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="https://..."
                />
            </div>
          </div>

          <div className="bg-[#1a1a1a] p-3 rounded-lg border border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-300">
                <ListOrdered size={16} />
                <span className="text-sm font-medium">Posición</span>
            </div>
            <div className="flex items-center gap-2">
                <input 
                    type="number" 
                    min="1" 
                    max={playlistLength + 1}
                    value={position}
                    onChange={e => setPosition(parseInt(e.target.value))}
                    className="w-16 bg-black border border-stone-700 text-white text-center rounded py-1 font-mono text-sm focus:border-blue-500 focus:outline-none"
                />
                <span className="text-stone-600 text-xs">
                    de {playlistLength + 1}
                </span>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 rounded-xl shadow-lg mt-4 active:scale-[0.98] transition-all text-sm uppercase tracking-wider"
          >
            Guardar en Biblioteca
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSongModal;
