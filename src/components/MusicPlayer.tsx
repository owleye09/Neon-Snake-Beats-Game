import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: "Neon Horizon",
    artist: "AI Synthwave",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    color: "from-cyan-400 to-blue-500"
  },
  {
    id: 2,
    title: "Cybernetic Dreams",
    artist: "Neural Network",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    color: "from-fuchsia-500 to-purple-600"
  },
  {
    id: 3,
    title: "Digital Rain",
    artist: "Algorithm",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    color: "from-emerald-400 to-cyan-500"
  }
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleTrackEnd = () => {
    nextTrack();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setProgress(value);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (value / 100) * audioRef.current.duration;
    }
  };

  return (
    <div className="relative group w-full">
      <div className={`absolute -inset-1 bg-gradient-to-r ${currentTrack.color} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000`}></div>
      <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 shadow-2xl flex flex-col items-center">
        
        {/* Album Art Placeholder */}
        <div className={`w-32 h-32 rounded-xl mb-6 flex items-center justify-center bg-gradient-to-br ${currentTrack.color} shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/20"></div>
          <Music size={48} className="text-white/80 drop-shadow-lg z-10" />
          
          {/* Equalizer animation when playing */}
          {isPlaying && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1 px-4 z-10">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-2 bg-white/80 rounded-t-sm animate-pulse"
                  style={{ 
                    height: `${Math.random() * 20 + 10}px`,
                    animationDuration: `${Math.random() * 0.5 + 0.3}s`,
                    animationDirection: 'alternate-reverse'
                  }}
                ></div>
              ))}
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="text-center mb-6 w-full">
          <h3 className="text-xl font-bold text-white truncate px-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
            {currentTrack.title}
          </h3>
          <p className="text-gray-400 text-sm font-mono mt-1 truncate">
            {currentTrack.artist}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full mb-6 group/progress">
          <input
            type="range"
            min="0"
            max="100"
            value={progress || 0}
            onChange={handleSeek}
            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-fuchsia-400 transition-colors"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between w-full px-2">
          <button 
            onClick={toggleMute}
            className="text-gray-400 hover:text-cyan-400 transition-colors p-2"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          <div className="flex items-center gap-4">
            <button 
              onClick={prevTrack}
              className="text-white hover:text-fuchsia-400 transition-colors drop-shadow-[0_0_5px_rgba(255,255,255,0.3)] hover:drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]"
            >
              <SkipBack size={24} fill="currentColor" />
            </button>
            
            <button 
              onClick={togglePlay}
              className="w-14 h-14 flex items-center justify-center bg-white text-gray-900 rounded-full hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.5)]"
            >
              {isPlaying ? (
                <Pause size={24} fill="currentColor" />
              ) : (
                <Play size={24} fill="currentColor" className="ml-1" />
              )}
            </button>
            
            <button 
              onClick={nextTrack}
              className="text-white hover:text-cyan-400 transition-colors drop-shadow-[0_0_5px_rgba(255,255,255,0.3)] hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
            >
              <SkipForward size={24} fill="currentColor" />
            </button>
          </div>

          <div className="w-9"></div> {/* Spacer for balance */}
        </div>

        <audio
          ref={audioRef}
          src={currentTrack.url}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleTrackEnd}
          loop={false}
        />
      </div>
    </div>
  );
}
