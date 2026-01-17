import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useAnimationFrame } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";

type GameState = "start" | "playing" | "gameover" | "win";

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "bug" | "hippo" | "insight";
}

interface Cloud {
  x: number;
  y: number;
  size: number;
  speed: number;
}

interface GroundSegment {
  x: number;
  height: number;
  width: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  type: 'dust' | 'sparkle';
  color: string;
}

interface TrailPosition {
  x: number;
  y: number;
  opacity: number;
}

// Time-of-day theme definitions
interface TimeTheme {
  bgFrom: string;
  bgTo: string;
  cloudColor: string;
  cloudOpacity: number;
}

const TIME_THEMES: TimeTheme[] = [
  { bgFrom: '#dbeafe', bgTo: '#fef3c7', cloudColor: '#9ca3af', cloudOpacity: 0.4 }, // Morning
  { bgFrom: '#e0f2fe', bgTo: '#ffffff', cloudColor: '#d1d5db', cloudOpacity: 0.5 }, // Day
  { bgFrom: '#fed7aa', bgTo: '#e9d5ff', cloudColor: '#fb923c', cloudOpacity: 0.6 }, // Sunset
  { bgFrom: '#e9d5ff', bgTo: '#cbd5e1', cloudColor: '#a78bfa', cloudOpacity: 0.5 }, // Dusk
];

const GAME_WIDTH = 640;
const GAME_HEIGHT = 300;
const GROUND_Y = GAME_HEIGHT - 60;
const PLAYER_SIZE = 40;
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const INITIAL_SPEED = 6.2;
const WIN_SCORE = 1000;
const MIN_OBJECT_SPACING = 240;
const HIGH_SCORE_KEY = 'sprintRunnerHighScore';
const HAS_PLAYED_KEY = 'sprintRunnerHasPlayed';

// Persistent audio context for mobile compatibility
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    return audioContext;
  } catch (e) {
    return null;
  }
};

const createBeep = (frequency: number, duration: number, volume: number = 0.1) => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = "square";
  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
};

const playJumpBeep = () => {
  createBeep(600, 0.08, 0.08);
};

const playMilestoneBeep = () => {
  createBeep(800, 0.15, 0.1);
  setTimeout(() => createBeep(1000, 0.15, 0.1), 100);
};

// New sound effects
const playCollectSound = () => {
  // Rising arpeggio C5 → E5 → G5
  createBeep(523, 0.08, 0.08);  // C5
  setTimeout(() => createBeep(659, 0.08, 0.08), 60);  // E5
  setTimeout(() => createBeep(784, 0.12, 0.1), 120);  // G5
};

const playGameOverSound = () => {
  // Descending tones
  createBeep(400, 0.15, 0.1);
  setTimeout(() => createBeep(300, 0.15, 0.1), 150);
  setTimeout(() => createBeep(200, 0.2, 0.08), 300);
};

const playWinSound = () => {
  // Victory fanfare C5 → E5 → G5 → C6
  createBeep(523, 0.12, 0.1);  // C5
  setTimeout(() => createBeep(659, 0.12, 0.1), 100);  // E5
  setTimeout(() => createBeep(784, 0.12, 0.1), 200);  // G5
  setTimeout(() => createBeep(1047, 0.3, 0.12), 300); // C6
};

const Play = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastSpeedIncreaseRef = useRef<number>(0);
  const lastMilestoneRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const particleIdRef = useRef(0);
  
  const [isLoading, setIsLoading] = useState(true);
  const [gameState, setGameState] = useState<GameState>("start");
  const [score, setScore] = useState(0);
  const [playerY, setPlayerY] = useState(GROUND_Y - PLAYER_SIZE);
  const [velocity, setVelocity] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [gameTime, setGameTime] = useState(0);
  const [clouds, setClouds] = useState<Cloud[]>([]);
  const [groundSegments, setGroundSegments] = useState<GroundSegment[]>([]);
  const [legPhase, setLegPhase] = useState(0);
  const lastSpawnXRef = useRef<number>(GAME_WIDTH);
  
  // New state for enhancements
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [trailPositions, setTrailPositions] = useState<TrailPosition[]>([]);
  const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 });
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hasPlayedBefore, setHasPlayedBefore] = useState(true);
  const [hasJumpedThisGame, setHasJumpedThisGame] = useState(false);
  
  // Container size tracking for responsive scaling
  const [containerWidth, setContainerWidth] = useState(GAME_WIDTH);
  const scaleFactor = containerWidth / GAME_WIDTH;

  // Track container size for proportional scaling
  useEffect(() => {
    const updateSize = () => {
      if (gameRef.current) {
        setContainerWidth(gameRef.current.clientWidth);
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Load high score and played status on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem(HIGH_SCORE_KEY);
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
    const hasPlayed = localStorage.getItem(HAS_PLAYED_KEY);
    setHasPlayedBefore(hasPlayed === 'true');
  }, []);

  // Initialize loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      getAudioContext();
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const playerYRef = useRef(playerY);
  const velocityRef = useRef(velocity);
  const isJumpingRef = useRef(isJumping);
  const objectsRef = useRef(objects);
  const speedRef = useRef(speed);
  const scoreRef = useRef(score);
  const gameTimeRef = useRef(gameTime);
  const gameStateRef = useRef(gameState);
  const levelRef = useRef(level);

  // Initialize clouds and ground
  useEffect(() => {
    const initialClouds: Cloud[] = [];
    for (let i = 0; i < 4; i++) {
      initialClouds.push({
        x: Math.random() * GAME_WIDTH,
        y: 30 + Math.random() * 60,
        size: 20 + Math.random() * 30,
        speed: 0.5 + Math.random() * 0.5
      });
    }
    setClouds(initialClouds);

    const initialGround: GroundSegment[] = [];
    let x = 0;
    while (x < GAME_WIDTH + 100) {
      const width = 20 + Math.random() * 40;
      initialGround.push({
        x,
        height: 2 + Math.random() * 6,
        width
      });
      x += width;
    }
    setGroundSegments(initialGround);
  }, []);

  useEffect(() => {
    playerYRef.current = playerY;
    velocityRef.current = velocity;
    isJumpingRef.current = isJumping;
    objectsRef.current = objects;
    speedRef.current = speed;
    scoreRef.current = score;
    gameTimeRef.current = gameTime;
    gameStateRef.current = gameState;
    levelRef.current = level;
  }, [playerY, velocity, isJumping, objects, speed, score, gameTime, gameState, level]);

  // Calculate current time theme based on game time
  const getTimeTheme = useCallback(() => {
    const phase = Math.min(Math.floor(gameTime / 15000), 3);
    const nextPhase = Math.min(phase + 1, 3);
    const progress = (gameTime % 15000) / 15000;
    
    const current = TIME_THEMES[phase];
    const next = TIME_THEMES[nextPhase];
    
    // Interpolate between themes
    return {
      bgFrom: current.bgFrom,
      bgTo: current.bgTo,
      cloudColor: current.cloudColor,
      cloudOpacity: current.cloudOpacity + (next.cloudOpacity - current.cloudOpacity) * progress
    };
  }, [gameTime]);

  // Spawn particles
  const spawnParticles = useCallback((x: number, y: number, type: 'dust' | 'sparkle', count: number) => {
    const newParticles: Particle[] = [];
    const colors = type === 'dust' 
      ? ['#9ca3af', '#6b7280', '#d1d5db']
      : ['#EEC7C4', '#E48981', '#fbbf24', '#f59e0b'];
    
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: particleIdRef.current++,
        x,
        y,
        vx: (Math.random() - 0.5) * (type === 'dust' ? 2 : 6),
        vy: type === 'dust' ? -Math.random() * 2 : -Math.random() * 4 - 2,
        life: type === 'dust' ? 20 : 40,
        maxLife: type === 'dust' ? 20 : 40,
        type,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // Trigger screen shake
  const triggerShake = useCallback(() => {
    const shake = () => {
      let intensity = 3;
      let duration = 200;
      const startTime = Date.now();
      
      const shakeFrame = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed < duration) {
          const decay = 1 - elapsed / duration;
          setShakeOffset({
            x: (Math.random() - 0.5) * intensity * decay,
            y: (Math.random() - 0.5) * intensity * decay
          });
          requestAnimationFrame(shakeFrame);
        } else {
          setShakeOffset({ x: 0, y: 0 });
        }
      };
      shakeFrame();
    };
    shake();
  }, []);

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#EEC7C4', '#E48981', '#C3A19E']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#EEC7C4', '#E48981', '#C3A19E']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const jump = useCallback(() => {
    if (!isJumpingRef.current && gameStateRef.current === "playing") {
      playJumpBeep();
      setVelocity(JUMP_FORCE);
      setIsJumping(true);
      setHasJumpedThisGame(true);
      setShowHint(false);
    }
  }, []);

  const spawnObject = useCallback(() => {
    const rand = Math.random();
    let type: GameObject["type"];
    let y: number;
    
    if (rand < 0.20) {
      // Collectible: lightbulb (user insight)
      type = "insight";
      y = GROUND_Y - PLAYER_SIZE - 50 - Math.random() * 40;
    } else {
      // Obstacles: 50% bug, 50% hippo
      type = Math.random() < 0.5 ? "bug" : "hippo";
      y = GROUND_Y - 30;
    }

    const spawnX = GAME_WIDTH + 50;
    lastSpawnXRef.current = spawnX;

    return {
      x: spawnX,
      y,
      width: 30,
      height: 30,
      type
    };
  }, []);

  const checkCollision = (player: { x: number; y: number; width: number; height: number }, obj: GameObject) => {
    const padding = 8;
    return (
      player.x < obj.x + obj.width - padding &&
      player.x + player.width > obj.x + padding &&
      player.y < obj.y + obj.height - padding &&
      player.y + player.height > obj.y + padding
    );
  };

  const resetGame = () => {
    setScore(0);
    setPlayerY(GROUND_Y - PLAYER_SIZE);
    setVelocity(0);
    setIsJumping(false);
    setObjects([]);
    setSpeed(INITIAL_SPEED);
    setGameTime(0);
    setLevel(1);
    setIsNewHighScore(false);
    setParticles([]);
    setTrailPositions([]);
    setShowLevelUp(false);
    setHasJumpedThisGame(false);
    lastSpeedIncreaseRef.current = 0;
    lastSpawnXRef.current = GAME_WIDTH;
    lastMilestoneRef.current = 0;
  };

  const startGame = () => {
    resetGame();
    setGameState("playing");
    
    // Show hint for first-time players
    if (!hasPlayedBefore) {
      setShowHint(true);
      localStorage.setItem(HAS_PLAYED_KEY, 'true');
      setHasPlayedBefore(true);
      
      // Auto-hide hint after 3 seconds
      setTimeout(() => {
        setShowHint(false);
      }, 3000);
    }
  };

  // Handle game over - check and save high score
  const handleGameOver = useCallback(() => {
    playGameOverSound();
    const finalScore = Math.floor(scoreRef.current);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      setIsNewHighScore(true);
      localStorage.setItem(HIGH_SCORE_KEY, finalScore.toString());
    }
    setGameState("gameover");
  }, [highScore]);

  // Handle win
  const handleWin = useCallback(() => {
    playWinSound();
    triggerConfetti();
    const finalScore = WIN_SCORE;
    if (finalScore > highScore) {
      setHighScore(finalScore);
      setIsNewHighScore(true);
      localStorage.setItem(HIGH_SCORE_KEY, finalScore.toString());
    }
    setGameState("win");
  }, [highScore]);

  const gameLoop = useCallback((timestamp: number) => {
    if (gameStateRef.current !== "playing") return;

    const deltaTime = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 16.67 : 1;
    lastTimeRef.current = timestamp;

    // Animate legs
    setLegPhase(prev => (prev + 0.3 * deltaTime) % (Math.PI * 2));

    // Update clouds
    setClouds(prev => prev.map(cloud => ({
      ...cloud,
      x: cloud.x - cloud.speed * deltaTime < -50 ? GAME_WIDTH + 50 : cloud.x - cloud.speed * deltaTime
    })));

    // Update ground segments
    setGroundSegments(prev => {
      const newSegments = prev.map(seg => ({
        ...seg,
        x: seg.x - speedRef.current * deltaTime
      }));
      
      const filtered = newSegments.filter(seg => seg.x + seg.width > -50);
      const rightmost = Math.max(...filtered.map(s => s.x + s.width));
      
      if (rightmost < GAME_WIDTH + 50) {
        filtered.push({
          x: rightmost,
          height: 2 + Math.random() * 6,
          width: 20 + Math.random() * 40
        });
      }
      
      return filtered;
    });

    // Update game time and check for level up
    setGameTime(prev => {
      const newTime = prev + 16.67 * deltaTime;
      
      if (Math.floor(newTime / 15000) > Math.floor(lastSpeedIncreaseRef.current / 15000)) {
        setSpeed(s => Math.min(s + 0.44, 12.8));
        lastSpeedIncreaseRef.current = newTime;
        
        // Level up!
        setLevel(l => {
          const newLevel = l + 1;
          setShowLevelUp(true);
          triggerShake();
          playMilestoneBeep();
          setTimeout(() => setShowLevelUp(false), 1500);
          return newLevel;
        });
      }
      
      return newTime;
    });

    // Update particles
    setParticles(prev => prev
      .map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vy: p.vy + 0.15,
        life: p.life - 1
      }))
      .filter(p => p.life > 0)
    );

    // Spawn dust particles while on ground
    if (!isJumpingRef.current && Math.random() < 0.3) {
      spawnParticles(60 + PLAYER_SIZE / 2, GROUND_Y - 2, 'dust', 1);
    }

    // Update jump trail
    if (isJumpingRef.current) {
      setTrailPositions(prev => {
        const newTrail = [
          { x: 60, y: playerYRef.current, opacity: 0.6 },
          ...prev.slice(0, 3).map(t => ({ ...t, opacity: t.opacity * 0.6 }))
        ];
        return newTrail.filter(t => t.opacity > 0.1);
      });
    } else {
      setTrailPositions([]);
    }

    // Update player physics
    setVelocity(prev => prev + GRAVITY * deltaTime);
    setPlayerY(prev => {
      const newY = prev + velocityRef.current * deltaTime;
      if (newY >= GROUND_Y - PLAYER_SIZE) {
        setIsJumping(false);
        setVelocity(0);
        return GROUND_Y - PLAYER_SIZE;
      }
      return newY;
    });

    // Update score
    setScore(prev => {
      const newScore = prev + 0.1 * deltaTime;
      
      // Check for 100-user milestones
      const currentMilestone = Math.floor(newScore / 100);
      if (currentMilestone > lastMilestoneRef.current && newScore < WIN_SCORE) {
        lastMilestoneRef.current = currentMilestone;
      }
      
      if (newScore >= WIN_SCORE) {
        handleWin();
        return WIN_SCORE;
      }
      return newScore;
    });

    // Spawn objects
    const rightmostObject = objectsRef.current.reduce((max, obj) => Math.max(max, obj.x), 0);
    const canSpawn = rightmostObject < GAME_WIDTH - MIN_OBJECT_SPACING;
    
    if (canSpawn && Math.random() < 0.02) {
      setObjects(prev => [...prev, spawnObject()]);
    }

    // Update objects
    setObjects(prev => {
      const player = { x: 60, y: playerYRef.current, width: PLAYER_SIZE, height: PLAYER_SIZE };
      
      return prev
        .map(obj => ({ ...obj, x: obj.x - speedRef.current * deltaTime }))
        .filter(obj => {
          if (obj.x < -50) return false;
          
          if (checkCollision(player, obj)) {
            if (obj.type === "insight") {
              playCollectSound();
              spawnParticles(obj.x + obj.width / 2, obj.y + obj.height / 2, 'sparkle', 8);
              setScore(s => s + 50);
              return false;
            } else {
              handleGameOver();
              return false;
            }
          }
          return true;
        });
    });

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [spawnObject, spawnParticles, triggerShake, handleGameOver, handleWin]);

  useEffect(() => {
    if (gameState === "playing") {
      lastTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, gameLoop]);

  // Global click/tap handler for jumping
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isNavigationOrButton = target.closest('a') || target.closest('button');
      
      if (gameState === "playing" && !isNavigationOrButton) {
        e.preventDefault();
        jump();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (gameState === "playing") {
          jump();
        } else if (gameState === "start") {
          startGame();
        }
      }
    };

    window.addEventListener("click", handleGlobalClick);
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameState, jump]);

  // Custom illustrated Bug icon to match HiPPO style
  const BugIcon = ({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) => (
    <svg viewBox="0 0 40 40" className={`w-full h-full ${className}`} style={style}>
      {/* Body segments */}
      <ellipse cx="20" cy="28" rx="10" ry="8" fill="#7f1d1d" />
      <ellipse cx="20" cy="18" rx="8" ry="7" fill="#991b1b" />
      <ellipse cx="20" cy="10" rx="6" ry="5" fill="#b91c1c" />
      {/* Shell pattern on back */}
      <ellipse cx="17" cy="26" rx="3" ry="4" fill="#991b1b" />
      <ellipse cx="23" cy="26" rx="3" ry="4" fill="#991b1b" />
      {/* Eyes - big googly eyes */}
      <circle cx="15" cy="8" r="4" fill="white" />
      <circle cx="25" cy="8" r="4" fill="white" />
      <circle cx="16" cy="9" r="2" fill="#1f2937" />
      <circle cx="26" cy="9" r="2" fill="#1f2937" />
      <circle cx="17" cy="8" r="0.8" fill="white" />
      <circle cx="27" cy="8" r="0.8" fill="white" />
      {/* Antennae */}
      <line x1="14" y1="4" x2="10" y2="0" stroke="#7f1d1d" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="26" y1="4" x2="30" y2="0" stroke="#7f1d1d" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="0" r="1.5" fill="#b91c1c" />
      <circle cx="30" cy="0" r="1.5" fill="#b91c1c" />
      {/* Legs */}
      <line x1="12" y1="20" x2="4" y2="18" stroke="#7f1d1d" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="26" x2="4" y2="28" stroke="#7f1d1d" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="32" x2="6" y2="38" stroke="#7f1d1d" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="20" x2="36" y2="18" stroke="#7f1d1d" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="26" x2="36" y2="28" stroke="#7f1d1d" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="32" x2="34" y2="38" stroke="#7f1d1d" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  // Custom illustrated Lightbulb icon to match HiPPO style
  const LightbulbIcon = ({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) => (
    <svg viewBox="0 0 40 40" className={`w-full h-full ${className}`} style={style}>
      {/* Glow rays */}
      <line x1="20" y1="0" x2="20" y2="4" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <line x1="6" y1="12" x2="10" y2="14" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <line x1="34" y1="12" x2="30" y2="14" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <line x1="8" y1="4" x2="12" y2="8" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="32" y1="4" x2="28" y2="8" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      {/* Bulb glass */}
      <ellipse cx="20" cy="16" rx="11" ry="12" fill="#fef3c7" />
      <ellipse cx="20" cy="16" rx="11" ry="12" fill="url(#bulbGradient)" />
      {/* Inner glow */}
      <ellipse cx="20" cy="14" rx="7" ry="8" fill="#fde68a" opacity="0.7" />
      {/* Filament */}
      <path d="M16 18 Q18 12 20 18 Q22 12 24 18" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
      {/* Screw base */}
      <rect x="14" y="27" width="12" height="3" rx="1" fill="#9ca3af" />
      <rect x="15" y="30" width="10" height="2" rx="0.5" fill="#6b7280" />
      <rect x="16" y="32" width="8" height="2" rx="0.5" fill="#9ca3af" />
      <rect x="17" y="34" width="6" height="2" rx="1" fill="#6b7280" />
      {/* Highlight on glass */}
      <ellipse cx="15" cy="12" rx="2" ry="3" fill="white" opacity="0.5" />
      {/* Gradient definition */}
      <defs>
        <radialGradient id="bulbGradient" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="100%" stopColor="#fcd34d" />
        </radialGradient>
      </defs>
    </svg>
  );

  // HiPPO (Highest Paid Person's Opinion) custom icon
  const HippoIcon = ({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) => (
    <svg viewBox="0 0 40 40" className={`w-full h-full ${className}`} style={style}>
      {/* Body - round hippo shape */}
      <ellipse cx="20" cy="26" rx="14" ry="10" fill="#6b7280" />
      {/* Head */}
      <circle cx="20" cy="14" r="10" fill="#6b7280" />
      {/* Snout */}
      <ellipse cx="20" cy="18" rx="6" ry="4" fill="#9ca3af" />
      {/* Nostrils */}
      <circle cx="17" cy="17" r="1.5" fill="#4b5563" />
      <circle cx="23" cy="17" r="1.5" fill="#4b5563" />
      {/* Eyes */}
      <circle cx="14" cy="11" r="2" fill="white" />
      <circle cx="26" cy="11" r="2" fill="white" />
      <circle cx="14" cy="11" r="1" fill="#1f2937" />
      <circle cx="26" cy="11" r="1" fill="#1f2937" />
      {/* Ears */}
      <ellipse cx="10" cy="6" rx="3" ry="2" fill="#6b7280" />
      <ellipse cx="30" cy="6" rx="3" ry="2" fill="#6b7280" />
      {/* Tie (the executive touch) */}
      <polygon points="20,26 17,30 20,40 23,30" fill="#EF4444" />
    </svg>
  );

  const renderIcon = (type: GameObject["type"]) => {
    switch (type) {
      case "bug":
        return (
          <BugIcon style={{ animation: 'wiggle 0.3s ease-in-out infinite' }} />
        );
      case "hippo":
        return <HippoIcon style={{ animation: 'hippo-bob 0.5s ease-in-out infinite' }} />;
      case "insight":
        return (
          <LightbulbIcon 
            style={{ 
              filter: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.7))',
              animation: 'glow-pulse 1.5s ease-in-out infinite'
            }}
          />
        );
    }
  };

  // CSS keyframes injected as style tag
  const gameStyles = `
    @keyframes wiggle {
      0%, 100% { transform: rotate(-5deg); }
      50% { transform: rotate(5deg); }
    }
    @keyframes hippo-bob {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-2px); }
    }
    @keyframes glow-pulse {
      0%, 100% { filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.5)); }
      50% { filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.9)); }
    }
  `;

  // Running person with bobbing animation
  const RunningPerson = ({ bobOffset = 0, rotation = 0 }: { bobOffset?: number; rotation?: number }) => {
    const legSwing = Math.sin(legPhase) * 25;
    const armSwing = Math.sin(legPhase) * 20;
    
    return (
      <svg 
        viewBox="0 0 40 40" 
        className="w-full h-full"
        style={{ transform: `translateY(${bobOffset}px) rotate(${rotation}deg)` }}
      >
        {/* Head */}
        <circle cx="20" cy="8" r="6" fill="#6b7280" />
        {/* Body */}
        <line x1="20" y1="14" x2="20" y2="26" stroke="#6b7280" strokeWidth="3" strokeLinecap="round" />
        {/* Left arm */}
        <line 
          x1="20" y1="18" 
          x2={16 - armSwing * 0.15} 
          y2={24 + Math.abs(armSwing) * 0.1} 
          stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" 
        />
        {/* Right arm */}
        <line 
          x1="20" y1="18" 
          x2={24 + armSwing * 0.15} 
          y2={24 - Math.abs(armSwing) * 0.1} 
          stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" 
        />
        {/* Left leg */}
        <line 
          x1="20" y1="26" 
          x2={16 + legSwing * 0.3} 
          y2={38} 
          stroke="#6b7280" strokeWidth="3" strokeLinecap="round" 
        />
        {/* Right leg */}
        <line 
          x1="20" y1="26" 
          x2={24 - legSwing * 0.3} 
          y2={38} 
          stroke="#6b7280" strokeWidth="3" strokeLinecap="round" 
        />
      </svg>
    );
  };

  // Calculate player animation values
  const bobOffset = !isJumping ? Math.sin(legPhase * 2) * 2 : 0;
  const jumpRotation = isJumping ? (velocity < 0 ? -10 : 5) : 0;
  
  // Get current background theme
  const theme = getTimeTheme();

  return (
    <Layout>
      <style>{gameStyles}</style>
      <SEO 
        title="Sprint Runner"
        description="A fun side-scrolling game about navigating the chaos of product development. Jump over bugs, scope creep, and blockers to achieve product-market fit!"
        path="/play"
      />
      <div className="pt-32 pb-20">
        <div className="content-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="section-title mb-4">Sprint Runner</h1>
            <p className="body-text max-w-xl mx-auto">
              Navigate the chaos of product development and acquire 1,000 users to achieve product-market fit.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <div
              ref={gameRef}
              role="application"
              aria-label="Sprint Runner game - Press Space or click/tap to jump"
              className="game-container relative border border-slate-300 rounded-2xl overflow-hidden select-none"
              style={{ 
                width: "100%", 
                maxWidth: GAME_WIDTH, 
                aspectRatio: `${GAME_WIDTH} / ${GAME_HEIGHT}`,
                touchAction: "none",
                background: `linear-gradient(to bottom, ${theme.bgFrom}, ${theme.bgTo})`,
                transition: 'background 2s ease',
                transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px)`
              }}
            >
              {/* Level-up edge flash */}
              {showLevelUp && (
                <div 
                  className="absolute inset-0 pointer-events-none z-20"
                  style={{
                    boxShadow: 'inset 0 0 30px 10px rgba(228, 137, 129, 0.5)',
                    animation: 'pulse 0.3s ease-out'
                  }}
                />
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="absolute inset-0 bg-background flex flex-col items-center justify-center z-20">
                  <div className="w-12 h-12 rounded-full border-4 border-coral/30 border-t-coral animate-spin mb-4" />
                  <p className="text-muted-foreground text-sm">Loading game...</p>
                </div>
              )}

              {/* Clouds with dynamic theming */}
              {clouds.map((cloud, index) => (
                <div
                  key={`cloud-${index}`}
                  className="absolute transition-opacity duration-1000"
                  style={{
                    left: cloud.x * scaleFactor,
                    top: cloud.y * scaleFactor,
                    width: cloud.size * scaleFactor,
                    height: cloud.size * 0.6 * scaleFactor,
                    opacity: theme.cloudOpacity
                  }}
                >
                  <svg viewBox="0 0 100 60" className="w-full h-full">
                    <ellipse cx="30" cy="40" rx="25" ry="18" fill={theme.cloudColor} />
                    <ellipse cx="55" cy="35" rx="30" ry="22" fill={theme.cloudColor} />
                    <ellipse cx="75" cy="42" rx="20" ry="15" fill={theme.cloudColor} />
                  </svg>
                </div>
              ))}

              {/* Level indicator */}
              {gameState === "playing" && (
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                    showLevelUp ? 'bg-coral text-white scale-110' : 'bg-slate-200 text-slate-600'
                  }`}>
                    ⚡ Sprint {level}
                  </div>
                </div>
              )}

              {/* Score and High Score - hidden on start screen */}
              {gameState !== "start" && (
                <div className="absolute top-4 right-4 text-sm font-medium text-slate-600 text-right">
                  <div>
                    Users: <span className="text-slate-800 font-bold">{Math.floor(score)}</span>
                  </div>
                  {highScore > 0 && (
                    <div className="text-xs text-slate-500">
                      Best: {highScore}
                    </div>
                  )}
                </div>
              )}

              {/* Tutorial hint */}
              {showHint && !hasJumpedThisGame && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute z-30 flex items-center gap-2"
                  style={{ left: 60 * scaleFactor, top: (playerY - 50) * scaleFactor }}
                >
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg text-sm font-medium text-slate-700">
                    Tap or Space to Jump!
                  </div>
                  <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="text-coral"
                  >
                    ↓
                  </motion.div>
                </motion.div>
              )}

              {/* Particles */}
              {particles.map(particle => (
                <div
                  key={particle.id}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    left: particle.x * scaleFactor,
                    top: particle.y * scaleFactor,
                    width: (particle.type === 'dust' ? 3 : 6) * scaleFactor,
                    height: (particle.type === 'dust' ? 3 : 6) * scaleFactor,
                    backgroundColor: particle.color,
                    opacity: particle.life / particle.maxLife,
                    transform: particle.type === 'sparkle' ? 'rotate(45deg)' : undefined
                  }}
                />
              ))}

              {/* Ground with uneven terrain */}
              <div className="absolute left-0 right-0" style={{ top: GROUND_Y * scaleFactor }}>
                {groundSegments.map((seg, index) => (
                  <div
                    key={`ground-${index}`}
                    className="absolute bg-slate-400"
                    style={{
                      left: seg.x * scaleFactor,
                      top: (-seg.height / 2) * scaleFactor,
                      width: seg.width * scaleFactor,
                      height: seg.height * scaleFactor,
                      borderRadius: '1px'
                    }}
                  />
                ))}
                <div className="absolute left-0 right-0 h-0.5 bg-slate-400" />
              </div>

              {/* Jump trail */}
              {trailPositions.map((trail, index) => (
                <div
                  key={`trail-${index}`}
                  className="absolute pointer-events-none"
                  style={{
                    left: (trail.x - index * 8) * scaleFactor,
                    top: trail.y * scaleFactor,
                    width: PLAYER_SIZE * scaleFactor,
                    height: PLAYER_SIZE * scaleFactor,
                    opacity: trail.opacity * 0.3
                  }}
                >
                  <RunningPerson bobOffset={0} rotation={jumpRotation} />
                </div>
              ))}

              {/* Player - Running Person */}
              <div
                className="absolute"
                style={{
                  left: 60 * scaleFactor,
                  top: playerY * scaleFactor,
                  width: PLAYER_SIZE * scaleFactor,
                  height: PLAYER_SIZE * scaleFactor,
                  willChange: 'transform',
                  transform: 'translateZ(0)'
                }}
              >
                <RunningPerson bobOffset={bobOffset} rotation={jumpRotation} />
              </div>

              {/* Objects */}
              {objects.map((obj, index) => (
                <div
                  key={index}
                  className="absolute"
                  style={{
                    left: obj.x * scaleFactor,
                    top: obj.y * scaleFactor,
                    width: obj.width * scaleFactor,
                    height: obj.height * scaleFactor,
                    willChange: 'transform',
                    transform: 'translateZ(0)'
                  }}
                >
                  {renderIcon(obj.type)}
                </div>
              ))}

              {/* Start Screen */}
              {gameState === "start" && !isLoading && (
                <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center z-10 gap-4">
                  <Button onClick={startGame} className="bg-primary hover:bg-primary/90 px-8 py-3 text-lg" aria-label="Start the game">
                    Start Game
                  </Button>
                  <p className="text-xs text-muted-foreground">Press Space or Tap to Jump</p>
                </div>
              )}

              {/* Game Over Screen */}
              {gameState === "gameover" && (
                <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center z-10">
                  <h2 className="font-serif text-2xl md:text-3xl font-medium mb-2 text-primary">Sprint Failed!</h2>
                  <p className="text-muted-foreground text-sm mb-1">
                    You acquired <span className="font-bold text-foreground">{Math.floor(score)}</span> users
                  </p>
                  {isNewHighScore && (
                    <motion.p
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-coral font-bold text-sm mb-2"
                    >
                      🎉 New Best!
                    </motion.p>
                  )}
                  <p className="text-muted-foreground text-sm mb-6 max-w-xs text-center">
                    Product Management is hard. Hiring Dale makes it easier.
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={startGame} variant="outline" aria-label="Try the game again">
                      Try Again
                    </Button>
                    <Button asChild className="bg-primary hover:bg-primary/90">
                      <Link to="/contact" aria-label="Contact Dale about product management">Contact Dale</Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* Win Screen */}
              {gameState === "win" && (
                <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center z-10">
                  <h2 className="font-serif text-2xl md:text-3xl font-medium mb-2">🚀 Product-Market Fit Achieved!</h2>
                  {isNewHighScore && (
                    <motion.p
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-coral font-bold text-sm mb-2"
                    >
                      🎉 New Best!
                    </motion.p>
                  )}
                  <p className="text-muted-foreground text-sm mb-6 max-w-xs text-center">
                    You clearly know how to navigate a product launch. So do I.
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={startGame} variant="outline" aria-label="Play another game">
                      Play Another Sprint
                    </Button>
                    <Button asChild className="bg-primary hover:bg-primary/90">
                      <Link to="/contact" aria-label="Let's collaborate on building something together">Let's Build Something Real</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Legend - shown after first game or for returning players */}
          {(hasPlayedBefore || gameState !== "start") && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center mt-6 text-xs text-muted-foreground"
            >
              <p className="mb-3 flex items-center justify-center gap-1">
                <span className="inline-block w-5 h-5">
                  <svg viewBox="0 0 40 40" className="w-full h-full">
                    <line x1="20" y1="0" x2="20" y2="4" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                    <line x1="6" y1="12" x2="10" y2="14" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                    <line x1="34" y1="12" x2="30" y2="14" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                    <ellipse cx="20" cy="16" rx="11" ry="12" fill="#fef3c7" />
                    <ellipse cx="20" cy="14" rx="7" ry="8" fill="#fde68a" opacity="0.7" />
                    <path d="M16 18 Q18 12 20 18 Q22 12 24 18" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
                    <rect x="14" y="27" width="12" height="3" rx="1" fill="#9ca3af" />
                    <rect x="15" y="30" width="10" height="2" rx="0.5" fill="#6b7280" />
                    <rect x="16" y="32" width="8" height="2" rx="0.5" fill="#9ca3af" />
                    <rect x="17" y="34" width="6" height="2" rx="1" fill="#6b7280" />
                    <ellipse cx="15" cy="12" rx="2" ry="3" fill="white" opacity="0.5" />
                  </svg>
                </span>
                User Insights = +50 Users
              </p>
              <p className="flex items-center justify-center gap-1">
                Avoid
                <span className="inline-block w-5 h-5 mx-1">
                  <svg viewBox="0 0 40 40" className="w-full h-full">
                    <ellipse cx="20" cy="28" rx="10" ry="8" fill="#7f1d1d" />
                    <ellipse cx="20" cy="18" rx="8" ry="7" fill="#991b1b" />
                    <ellipse cx="20" cy="10" rx="6" ry="5" fill="#b91c1c" />
                    <circle cx="15" cy="8" r="4" fill="white" />
                    <circle cx="25" cy="8" r="4" fill="white" />
                    <circle cx="16" cy="9" r="2" fill="#1f2937" />
                    <circle cx="26" cy="9" r="2" fill="#1f2937" />
                    <line x1="14" y1="4" x2="10" y2="0" stroke="#7f1d1d" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="26" y1="4" x2="30" y2="0" stroke="#7f1d1d" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="10" cy="0" r="1.5" fill="#b91c1c" />
                    <circle cx="30" cy="0" r="1.5" fill="#b91c1c" />
                  </svg>
                </span>
                Bugs &
                <span className="inline-block w-5 h-5 mx-1">
                  <svg viewBox="0 0 40 40" className="w-full h-full">
                    <ellipse cx="20" cy="26" rx="14" ry="10" fill="#6b7280" />
                    <circle cx="20" cy="14" r="10" fill="#6b7280" />
                    <ellipse cx="20" cy="18" rx="6" ry="4" fill="#9ca3af" />
                    <circle cx="17" cy="17" r="1.5" fill="#4b5563" />
                    <circle cx="23" cy="17" r="1.5" fill="#4b5563" />
                    <circle cx="14" cy="11" r="2" fill="white" />
                    <circle cx="26" cy="11" r="2" fill="white" />
                    <circle cx="14" cy="11" r="1" fill="#1f2937" />
                    <circle cx="26" cy="11" r="1" fill="#1f2937" />
                    <ellipse cx="10" cy="6" rx="3" ry="2" fill="#6b7280" />
                    <ellipse cx="30" cy="6" rx="3" ry="2" fill="#6b7280" />
                    <polygon points="20,26 17,30 20,40 23,30" fill="#EF4444" />
                  </svg>
                </span>
                HiPPOs
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Play;
