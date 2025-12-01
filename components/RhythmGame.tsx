
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { Play, RotateCcw, Trophy, Crown, Disc } from 'lucide-react';

interface RhythmGameProps {
  onBack: () => void;
  lastChatMessage: ChatMessage | null;
}

const GRAVITY = 0.6;
const JUMP_STRENGTH = -8;
const PIPE_SPEED = 3;
const PIPE_SPAWN_RATE = 1500; // ms
const GAP_SIZE = 180;

interface Pipe {
  id: number;
  x: number;
  topHeight: number;
  passed: boolean;
}

const RhythmGame: React.FC<RhythmGameProps> = ({ onBack, lastChatMessage }) => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  // Bird Physics
  const [birdY, setBirdY] = useState(250);
  const [velocity, setVelocity] = useState(0);
  const [rotation, setRotation] = useState(0);

  // Pipes
  const [pipes, setPipes] = useState<Pipe[]>([]);

  // Refs for loop
  const gameLoopRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const lastPipeTimeRef = useRef<number>(0);
  const birdYRef = useRef(250);
  const pipesRef = useRef<Pipe[]>([]);

  // --- CONTROLS ---
  const jump = () => {
    if (gameState !== 'playing') return;
    setVelocity(JUMP_STRENGTH);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setBirdY(250);
    setVelocity(0);
    setPipes([]);
    birdYRef.current = 250;
    pipesRef.current = [];
    lastTimeRef.current = performance.now();
    lastPipeTimeRef.current = performance.now();
  };

  // --- CHAT INPUT ---
  useEffect(() => {
    if (!lastChatMessage || gameState !== 'playing') return;
    const txt = lastChatMessage.text.trim().toLowerCase();
    // Keywords to trigger jump
    if (['jump', 'fly', 'up', 'saltar', 'arriba', 'w', 'space', '!jump'].some(k => txt.includes(k))) {
        jump();
    }
  }, [lastChatMessage, gameState]);

  // --- GAME LOOP ---
  useEffect(() => {
    if (gameState !== 'playing') {
        cancelAnimationFrame(gameLoopRef.current);
        return;
    }

    const loop = (time: number) => {
      // const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // 1. SPAWN PIPES
      if (time - lastPipeTimeRef.current > PIPE_SPAWN_RATE) {
        const height = Math.floor(Math.random() * (300 - 50 + 1)) + 50; // Random height 50-300
        const newPipe: Pipe = {
            id: Date.now(),
            x: 400, // Start off screen
            topHeight: height,
            passed: false
        };
        pipesRef.current.push(newPipe);
        lastPipeTimeRef.current = time;
      }

      // 2. PHYSICS (Bird)
      setVelocity(v => {
          const newV = v + GRAVITY;
          birdYRef.current += newV;
          // Floor collision
          if (birdYRef.current > 480) { // Screen height approx
             handleGameOver();
          }
          // Ceiling collision
          if (birdYRef.current < -50) {
             birdYRef.current = -50;
             return 0;
          }
          return newV;
      });
      
      setBirdY(birdYRef.current);
      setRotation(Math.min(Math.max(velocity * 3, -25), 90));

      // 3. PHYSICS (Pipes)
      setPipes(prevPipes => {
          const nextPipes = prevPipes
            .map(p => ({ ...p, x: p.x - PIPE_SPEED }))
            .filter(p => p.x > -80); // Remove off-screen

          // Collision Detection
          nextPipes.forEach(p => {
              // Horizontal overlap (Bird is approx 40px wide, centered at 50)
              // Bird X is fixed at ~50px from left (visually centered in a container)
              // Let's say Bird hit box is left: 60, right: 100
              
              const birdLeft = 60;
              const birdRight = 100;
              const birdTop = birdYRef.current + 10;
              const birdBottom = birdYRef.current + 30;

              const pipeLeft = p.x;
              const pipeRight = p.x + 50; // Pipe width

              if (birdRight > pipeLeft && birdLeft < pipeRight) {
                  // Vertical check
                  // Hit top pipe OR Hit bottom pipe
                  if (birdTop < p.topHeight || birdBottom > (p.topHeight + GAP_SIZE)) {
                      handleGameOver();
                  }
              }

              // Score update
              if (!p.passed && birdLeft > pipeRight) {
                  p.passed = true;
                  setScore(s => s + 1);
              }
          });

          pipesRef.current = nextPipes;
          return nextPipes;
      });

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [gameState, velocity]);

  const handleGameOver = () => {
      setGameState('gameover');
      setHighScore(prev => Math.max(prev, score));
  };

  return (
    <div className="w-full h-full bg-sky-900 relative overflow-hidden flex flex-col font-sans select-none" onClick={jump}>
      
      {/* Background Layers */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#38bdf8_0%,#0ea5e9_60%,#0284c7_100%)]"></div>
      {/* Clouds */}
      <div className="absolute top-20 left-10 opacity-50 animate-slide-right" style={{ animationDuration: '20s' }}>
          <div className="text-white/20 text-6xl">☁️</div>
      </div>
      <div className="absolute top-40 left-60 opacity-30 animate-slide-right" style={{ animationDuration: '25s' }}>
           <div className="text-white/20 text-4xl">☁️</div>
      </div>

      {/* Cityscape BG */}
      <div className="absolute bottom-0 w-full h-32 opacity-30 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/city-lights.png')]"></div>

      {/* GAME WORLD */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          
          {/* PIPES */}
          {pipes.map(p => (
              <React.Fragment key={p.id}>
                  {/* Top Pipe (Pencil) */}
                  <div 
                    className="absolute top-0 w-[50px] bg-yellow-400 border-x-4 border-yellow-600 flex flex-col items-center justify-end"
                    style={{ left: p.x, height: p.topHeight }}
                  >
                      <div className="w-full h-8 bg-stone-300 border-y-4 border-stone-400 mb-0"></div> {/* Eraser/Metal part */}
                      <div className="w-full h-4 bg-black"></div> {/* Tip */}
                  </div>

                  {/* Bottom Pipe (Pencil) */}
                  <div 
                    className="absolute bottom-0 w-[50px] bg-yellow-400 border-x-4 border-yellow-600 flex flex-col items-center"
                    style={{ left: p.x, height: `calc(100% - ${p.topHeight + GAP_SIZE}px)` }}
                  >
                       <div className="w-full h-4 bg-black"></div> {/* Tip */}
                       <div className="w-full h-8 bg-stone-300 border-y-4 border-stone-400"></div> {/* Eraser/Metal part */}
                  </div>
              </React.Fragment>
          ))}

          {/* BIRD (Cassette Tape) */}
          <div 
             className="absolute left-[60px] w-12 h-10 transition-transform duration-75"
             style={{ top: birdY, transform: `rotate(${rotation}deg)` }}
          >
              {/* Wings animation */}
              <div className={`absolute -left-2 top-1/2 w-4 h-3 bg-white rounded-full border border-stone-500 ${gameState === 'playing' ? 'animate-flap' : ''}`}></div>
              
              {/* Cassette Body */}
              <div className="w-full h-full bg-orange-600 rounded-md border-2 border-stone-800 flex items-center justify-center shadow-lg relative z-10">
                  <div className="w-8 h-4 bg-white/90 px-1 flex items-center justify-between">
                      <div className="w-2 h-2 bg-black rounded-full animate-spin"></div>
                      <div className="w-2 h-2 bg-black rounded-full animate-spin"></div>
                  </div>
                  {/* Eyes */}
                  <div className="absolute -right-1 top-1 w-4 h-4 bg-white rounded-full border border-black flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                  </div>
              </div>
          </div>
      </div>

      {/* HUD */}
      <div className="absolute top-4 left-0 w-full flex justify-center pointer-events-none z-20">
          <div className="text-5xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] stroke-black">
              {score}
          </div>
      </div>

      {/* START SCREEN */}
      {gameState === 'start' && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-30 animate-fade-in backdrop-blur-sm">
              <div className="bg-stone-900 p-6 rounded-2xl border-4 border-stone-700 shadow-2xl text-center max-w-[280px]">
                  <Disc size={48} className="text-orange-500 mx-auto mb-2 animate-bounce" />
                  <h1 className="text-3xl font-black text-white italic tracking-tighter mb-1">FLAPPY TAPE</h1>
                  <p className="text-xs text-stone-400 mb-6 font-mono">EL CHAT CONTROLA EL VUELO</p>
                  
                  <div className="bg-black/40 p-3 rounded-lg mb-6 text-left space-y-2">
                      <div className="flex items-center gap-2 text-xs text-stone-300">
                          <span className="bg-stone-700 px-1.5 py-0.5 rounded text-white font-bold font-mono">JUMP</span>
                          <span>para aletear</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone-300">
                          <span className="bg-stone-700 px-1.5 py-0.5 rounded text-white font-bold font-mono">!jump</span>
                          <span>también funciona</span>
                      </div>
                  </div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); startGame(); }}
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl shadow-[0_4px_0_#14532d] active:shadow-none active:translate-y-1 transition-all"
                  >
                      INICIAR JUEGO
                  </button>
                  
                  <button onClick={(e) => { e.stopPropagation(); onBack(); }} className="mt-4 text-xs text-stone-500 hover:text-white underline">
                      Volver al Menú
                  </button>
              </div>
          </div>
      )}

      {/* GAME OVER SCREEN */}
      {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30 animate-zoom-in backdrop-blur-sm">
              <div className="bg-stone-900 p-6 rounded-2xl border-4 border-red-900 shadow-2xl text-center w-[280px]">
                  <div className="text-xs font-bold text-stone-500 mb-2 tracking-widest">GAME OVER</div>
                  
                  <div className="flex justify-center gap-4 mb-6">
                      <div className="flex flex-col items-center bg-black/50 p-3 rounded-lg w-24">
                          <span className="text-[10px] text-stone-400 uppercase">Puntos</span>
                          <span className="text-2xl font-black text-white">{score}</span>
                      </div>
                      <div className="flex flex-col items-center bg-black/50 p-3 rounded-lg w-24 border border-yellow-500/30">
                          <span className="text-[10px] text-yellow-500 uppercase flex items-center gap-1"><Crown size={8} /> Mejor</span>
                          <span className="text-2xl font-black text-yellow-400">{Math.max(score, highScore)}</span>
                      </div>
                  </div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); startGame(); }}
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl shadow-[0_4px_0_#9a3412] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2"
                  >
                      <RotateCcw size={18} />
                      REINTENTAR
                  </button>
                  
                  <button onClick={(e) => { e.stopPropagation(); onBack(); }} className="mt-4 text-xs text-stone-500 hover:text-white underline">
                      Salir
                  </button>
              </div>
          </div>
      )}

      {/* Instructions Footer */}
      <div className="absolute bottom-4 w-full text-center pointer-events-none opacity-70">
          <p className="text-[10px] text-white font-mono bg-black/30 inline-block px-2 rounded">
             Escribe "JUMP" en el chat para volar
          </p>
      </div>

    </div>
  );
};

export default RhythmGame;
