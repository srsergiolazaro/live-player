
import React, { useState } from 'react';
import { Sparkles, Trophy, ArrowRight, Eye, PlayCircle, Hash, BrainCircuit, Mic2, Radio, Disc, Wind, Swords } from 'lucide-react';

interface GamesMenuProps {
  onSelectGame: (game: string) => void;
  onBack: () => void;
  onGenerateDJ: () => void;
  isGeneratingDJ: boolean;
}

const GamesMenu: React.FC<GamesMenuProps> = ({ onSelectGame, onBack, onGenerateDJ, isGeneratingDJ }) => {
  return (
    <div className="w-full h-full bg-stone-900 flex flex-col relative overflow-hidden animate-fade-in">
      {/* Background Grid Animation */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0)_1px,transparent_1px)] bg-[size:20px_20px] [background-position:center] opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-stone-900 pointer-events-none"></div>

      {/* Header */}
      <div className="p-6 text-center z-10">
        <h2 className="text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-600 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
          ZONA ARCADE
        </h2>
        <div className="w-16 h-1 bg-amber-500 mx-auto mt-2 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
      </div>

      {/* Menu Options */}
      <div className="flex-1 px-4 py-2 space-y-4 z-10 overflow-y-auto custom-scrollbar">
        
        {/* NEW GAME: GENRE DUEL */}
        <button 
            onClick={() => onSelectGame('duel')}
            className="w-full group relative overflow-hidden bg-stone-800/50 border border-stone-600 rounded-xl p-4 transition-all duration-300 hover:border-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:scale-[1.02]"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-600 to-blue-600 flex items-center justify-center shadow-lg group-hover:animate-pulse">
                        <Swords className="text-white transform group-hover:rotate-45 transition-transform" size={24} />
                    </div>
                    <div className="text-left">
                        <div className="text-xs text-red-300 font-mono mb-0.5">NUEVO JUEGO</div>
                        <div className="text-white font-bold text-lg leading-none italic">GUERRA DE GÉNEROS</div>
                    </div>
                </div>
                <div className="text-xs font-mono bg-stone-900 px-2 py-1 rounded border border-stone-700">VS</div>
            </div>
            <div className="mt-3 text-[10px] text-stone-400 font-mono border-t border-white/5 pt-2 flex justify-between">
               <span>BATALLA 1 vs 1</span>
               <span className="text-red-400 font-bold">CHAT CONTROLA</span>
            </div>
        </button>

        {/* MANUAL DJ TOOL */}
        <button 
            onClick={onGenerateDJ}
            disabled={isGeneratingDJ}
            className={`w-full group relative overflow-hidden border rounded-xl p-4 transition-all duration-300 hover:scale-[1.02]
                ${isGeneratingDJ 
                    ? 'bg-stone-800 border-stone-600 cursor-wait opacity-80' 
                    : 'bg-gradient-to-br from-purple-900/40 to-stone-800/80 border-purple-500/50 hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                }
            `}
        >
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-lg transition-transform ${isGeneratingDJ ? 'bg-stone-700' : 'bg-gradient-to-br from-purple-600 to-fuchsia-600 group-hover:rotate-12'}`}>
                        {isGeneratingDJ ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Radio className="text-white" size={24} />
                        )}
                    </div>
                    <div className="text-left">
                        <div className="text-xs text-purple-300 font-mono mb-0.5">HERRAMIENTA AI</div>
                        <div className="text-white font-bold text-lg leading-none italic">
                            {isGeneratingDJ ? 'GENERANDO...' : 'ESTUDIO DJ'}
                        </div>
                    </div>
                </div>
                {!isGeneratingDJ && <Mic2 className="text-purple-500 group-hover:text-purple-300 transition-colors" />}
            </div>
            <div className="mt-3 text-[10px] text-stone-400 font-mono border-t border-white/5 pt-2 flex justify-between">
               <span>CREAR INTERVENCIÓN</span>
               <span className={isGeneratingDJ ? 'text-stone-500' : 'text-purple-400'}>
                   {isGeneratingDJ ? 'PROCESANDO...' : 'INSERTAR EN COLA'}
               </span>
            </div>
        </button>

        <div className="w-full h-[1px] bg-stone-800 my-2"></div>

        {/* GAME 3: CYBER SCRAMBLE */}
        <button 
            onClick={() => onSelectGame('scramble')}
            className="w-full group relative overflow-hidden bg-stone-800/50 border border-stone-600 rounded-xl p-4 transition-all duration-300 hover:border-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:scale-[1.02]"
        >
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center shadow-lg group-hover:animate-pulse">
                        <BrainCircuit className="text-white" size={24} />
                    </div>
                    <div className="text-left">
                        <div className="text-xs text-stone-400 font-mono mb-0.5">ANTI-LAG</div>
                        <div className="text-white font-bold text-lg leading-none italic">CYBER SCRAMBLE</div>
                    </div>
                </div>
                <Hash className="text-stone-500 group-hover:text-green-400 group-hover:rotate-12 transition-all" />
            </div>
            <div className="mt-3 text-[10px] text-stone-400 font-mono border-t border-white/5 pt-2 flex justify-between">
               <span>DESCIFRA EL ARTISTA</span>
               <span className="text-green-400">CHAT VS CPU</span>
            </div>
        </button>

        {/* GAME 1: VOTING */}
        <button 
            onClick={() => onSelectGame('voting')}
            className="w-full group relative overflow-hidden bg-stone-800/50 border border-stone-600 rounded-xl p-4 transition-all duration-300 hover:border-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-[1.02]"
        >
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg group-hover:animate-pulse">
                        <Sparkles className="text-white" size={24} />
                    </div>
                    <div className="text-left">
                        <div className="text-xs text-stone-400 font-mono mb-0.5">EVENTO EN VIVO</div>
                        <div className="text-white font-bold text-lg leading-none italic">DUELO DE HITS</div>
                    </div>
                </div>
                <ArrowRight className="text-stone-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="mt-3 text-[10px] text-stone-400 font-mono border-t border-white/5 pt-2 flex justify-between">
               <span>ESTADO: ACTIVO</span>
               <span className="text-green-400">● 245 USUARIOS VOTANDO</span>
            </div>
        </button>

        {/* GAME 2: PIXEL TRIVIA */}
        <button 
            onClick={() => onSelectGame('trivia')}
            className="w-full group relative overflow-hidden bg-stone-800/50 border border-stone-600 rounded-xl p-4 transition-all duration-300 hover:border-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.02]"
        >
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-600 to-emerald-600 flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                        <Eye className="text-white" size={24} />
                    </div>
                    <div className="text-left">
                        <div className="text-xs text-stone-400 font-mono mb-0.5">DESAFÍO VISUAL</div>
                        <div className="text-white font-bold text-lg leading-none italic">PIXEL ARTISTA</div>
                    </div>
                </div>
                <PlayCircle className="text-stone-500 group-hover:text-cyan-400 group-hover:scale-110 transition-all" />
            </div>
            <div className="mt-3 text-[10px] text-stone-400 font-mono border-t border-white/5 pt-2 flex justify-between">
               <span>ADIVINA EL COVER</span>
               <span className="text-cyan-400">RANKING MUNDIAL</span>
            </div>
        </button>

      </div>

      <div className="p-4 text-center">
          <button onClick={onBack} className="text-xs text-stone-500 hover:text-white uppercase tracking-widest transition-colors">
              Volver al Reproductor
          </button>
      </div>
    </div>
  );
};

export default GamesMenu;
