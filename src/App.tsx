import React, { useState } from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  const [score, setScore] = useState(0);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4 font-sans selection:bg-cyan-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-gray-950 to-gray-950 -z-10"></div>
      
      <header className="mb-8 text-center">
        <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] mb-2">
          NEON SNAKE
        </h1>
        <div className="text-cyan-400 font-mono text-xl tracking-widest drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">
          SCORE: {score.toString().padStart(4, '0')}
        </div>
      </header>

      <main className="flex flex-col lg:flex-row gap-8 items-center justify-center w-full max-w-6xl">
        <div className="flex-1 flex justify-center w-full">
          <SnakeGame setScore={setScore} />
        </div>
        
        <div className="w-full lg:w-80 flex-shrink-0">
          <MusicPlayer />
        </div>
      </main>
    </div>
  );
}
