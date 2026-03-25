import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw } from 'lucide-react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };

interface Point {
  x: number;
  y: number;
}

export default function SnakeGame({ setScore }: { setScore: (score: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  
  const snakeRef = useRef<Point[]>(INITIAL_SNAKE);
  const directionRef = useRef<Point>(INITIAL_DIRECTION);
  const nextDirectionRef = useRef<Point>(INITIAL_DIRECTION);
  const foodRef = useRef<Point>({ x: 5, y: 5 });
  const scoreRef = useRef(0);
  const gameLoopRef = useRef<number>();
  const lastRenderTimeRef = useRef<number>(0);
  const SNAKE_SPEED = 10; // moves per second

  const generateFood = useCallback(() => {
    let newFood: Point;
    let isOccupied = true;
    while (isOccupied) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      isOccupied = snakeRef.current.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
    }
    foodRef.current = newFood!;
  }, []);

  const resetGame = useCallback(() => {
    snakeRef.current = INITIAL_SNAKE;
    directionRef.current = INITIAL_DIRECTION;
    nextDirectionRef.current = INITIAL_DIRECTION;
    scoreRef.current = 0;
    setScore(0);
    setIsGameOver(false);
    setIsPlaying(true);
    generateFood();
  }, [generateFood, setScore]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#030712'; // gray-950
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid lines (optional, for neon effect)
    ctx.strokeStyle = '#1f2937'; // gray-800
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= CANVAS_SIZE; i += CELL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
      ctx.stroke();
    }

    // Draw food
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#d946ef'; // fuchsia-500
    ctx.fillStyle = '#d946ef';
    ctx.beginPath();
    ctx.arc(
      foodRef.current.x * CELL_SIZE + CELL_SIZE / 2,
      foodRef.current.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      2 * Math.PI
    );
    ctx.fill();

    // Draw snake
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#22d3ee'; // cyan-400
    ctx.fillStyle = '#22d3ee';
    
    snakeRef.current.forEach((segment, index) => {
      if (index === 0) {
        // Head
        ctx.fillStyle = '#67e8f9'; // cyan-300
      } else {
        ctx.fillStyle = '#0891b2'; // cyan-600
      }
      
      // Slightly smaller than cell to show grid
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    });
    
    // Reset shadow
    ctx.shadowBlur = 0;
  }, []);

  const update = useCallback(() => {
    if (isGameOver || !isPlaying) return;

    directionRef.current = nextDirectionRef.current;
    const head = snakeRef.current[0];
    const newHead = {
      x: head.x + directionRef.current.x,
      y: head.y + directionRef.current.y,
    };

    // Check wall collision
    if (
      newHead.x < 0 ||
      newHead.x >= GRID_SIZE ||
      newHead.y < 0 ||
      newHead.y >= GRID_SIZE
    ) {
      setIsGameOver(true);
      setIsPlaying(false);
      return;
    }

    // Check self collision
    if (
      snakeRef.current.some(
        (segment) => segment.x === newHead.x && segment.y === newHead.y
      )
    ) {
      setIsGameOver(true);
      setIsPlaying(false);
      return;
    }

    const newSnake = [newHead, ...snakeRef.current];

    // Check food collision
    if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
      scoreRef.current += 10;
      setScore(scoreRef.current);
      generateFood();
    } else {
      newSnake.pop();
    }

    snakeRef.current = newSnake;
  }, [isGameOver, isPlaying, generateFood, setScore]);

  const gameLoop = useCallback(
    (currentTime: number) => {
      if (isPlaying && !isGameOver) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        
        const secondsSinceLastRender = (currentTime - lastRenderTimeRef.current) / 1000;
        if (secondsSinceLastRender < 1 / SNAKE_SPEED) return;
        
        lastRenderTimeRef.current = currentTime;
        update();
        draw();
      }
    },
    [isPlaying, isGameOver, update, draw]
  );

  useEffect(() => {
    if (isPlaying) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [isPlaying, gameLoop]);

  useEffect(() => {
    draw(); // Initial draw
  }, [draw]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (!isPlaying && !isGameOver && e.key === ' ') {
        setIsPlaying(true);
        return;
      }
      
      if (isGameOver && e.key === ' ') {
        resetGame();
        return;
      }

      const dir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (dir.y !== 1) nextDirectionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (dir.y !== -1) nextDirectionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (dir.x !== 1) nextDirectionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (dir.x !== -1) nextDirectionRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver, resetGame]);

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative bg-gray-950 rounded-xl border border-gray-800 p-4 shadow-2xl overflow-hidden">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="bg-gray-950 rounded border border-gray-800/50"
          style={{ display: 'block' }}
        />
        
        {(!isPlaying || isGameOver) && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            {isGameOver ? (
              <>
                <h2 className="text-3xl font-bold text-fuchsia-500 mb-2 drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]">GAME OVER</h2>
                <p className="text-cyan-400 font-mono mb-6">FINAL SCORE: {scoreRef.current}</p>
                <button
                  onClick={resetGame}
                  className="flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-cyan-400 text-cyan-400 rounded-full hover:bg-cyan-400 hover:text-gray-950 transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] font-bold tracking-wider"
                >
                  <RotateCcw size={20} />
                  PLAY AGAIN
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsPlaying(true)}
                className="flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-cyan-400 text-cyan-400 rounded-full hover:bg-cyan-400 hover:text-gray-950 transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] font-bold tracking-wider"
              >
                <Play size={24} fill="currentColor" />
                START GAME
              </button>
            )}
            <p className="text-gray-500 text-sm mt-6 font-mono">Press SPACE to start, WASD/Arrows to move</p>
          </div>
        )}
      </div>
    </div>
  );
}
