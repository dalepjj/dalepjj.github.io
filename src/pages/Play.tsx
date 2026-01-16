import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useAnimationFrame } from "framer-motion";
import { Bug, Bomb, ShieldOff, Sparkles, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";
import Layout from "@/components/Layout";

type GameState = "start" | "playing" | "gameover" | "win";

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "bug" | "scope" | "blocker" | "coffee" | "insight";
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

const GAME_WIDTH = 800;
const GAME_HEIGHT = 300;
const GROUND_Y = GAME_HEIGHT - 60;
const PLAYER_SIZE = 40;
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const INITIAL_SPEED = 5.82; // 15% faster than 5.06
const WIN_SCORE = 1000;
const MIN_OBJECT_SPACING = 300;

// Persistent audio context for mobile compatibility
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Resume context if suspended (required for mobile after user interaction)
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

const Play = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastSpeedIncreaseRef = useRef<number>(0);
  const lastMilestoneRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  
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

  const playerYRef = useRef(playerY);
  const velocityRef = useRef(velocity);
  const isJumpingRef = useRef(isJumping);
  const objectsRef = useRef(objects);
  const speedRef = useRef(speed);
  const scoreRef = useRef(score);
  const gameTimeRef = useRef(gameTime);
  const gameStateRef = useRef(gameState);

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
  }, [playerY, velocity, isJumping, objects, speed, score, gameTime, gameState]);

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
    }
  }, []);

  const spawnObject = useCallback(() => {
    const rand = Math.random();
    let type: GameObject["type"];
    let y: number;
    
    if (rand < 0.25) {
      type = rand < 0.125 ? "coffee" : "insight";
      y = GROUND_Y - PLAYER_SIZE - 50 - Math.random() * 40;
    } else {
      const obstacleRand = Math.random();
      if (obstacleRand < 0.33) type = "bug";
      else if (obstacleRand < 0.66) type = "scope";
      else type = "blocker";
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
    lastSpeedIncreaseRef.current = 0;
    lastSpawnXRef.current = GAME_WIDTH;
    lastMilestoneRef.current = 0;
  };

  const startGame = () => {
    resetGame();
    setGameState("playing");
  };

  const gameLoop = useCallback((timestamp: number) => {
    if (gameStateRef.current !== "playing") return;

    // Calculate delta time for smooth animation
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
      
      // Remove segments that are off screen and add new ones
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

    // Update game time
    setGameTime(prev => {
      const newTime = prev + 16.67 * deltaTime;
      
      if (Math.floor(newTime / 15000) > Math.floor(lastSpeedIncreaseRef.current / 15000)) {
        setSpeed(s => Math.min(s + 0.44, 12.8)); // 15% faster progression
        lastSpeedIncreaseRef.current = newTime;
      }
      
      return newTime;
    });

    // Update player physics with deltaTime
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

    // Update score (distance)
    setScore(prev => {
      const newScore = prev + 0.1 * deltaTime;
      
      // Check for 100-user milestones
      const currentMilestone = Math.floor(newScore / 100);
      if (currentMilestone > lastMilestoneRef.current && newScore < WIN_SCORE) {
        lastMilestoneRef.current = currentMilestone;
        playMilestoneBeep();
      }
      
      if (newScore >= WIN_SCORE) {
        setGameState("win");
        triggerConfetti();
        return WIN_SCORE;
      }
      return newScore;
    });

    // Spawn objects with proper spacing
    const rightmostObject = objectsRef.current.reduce((max, obj) => Math.max(max, obj.x), 0);
    const canSpawn = rightmostObject < GAME_WIDTH - MIN_OBJECT_SPACING;
    
    if (canSpawn && Math.random() < 0.015) {
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
            if (obj.type === "coffee" || obj.type === "insight") {
              setScore(s => s + 20); // Changed to +20
              return false;
            } else {
              setGameState("gameover");
              return false;
            }
          }
          return true;
        });
    });

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [spawnObject]);

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
      // Check if click is on a navigation link or button (except the game area during play)
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

  const renderIcon = (type: GameObject["type"]) => {
    const iconClass = "w-full h-full";
    switch (type) {
      case "bug":
        return <Bug className={`${iconClass} text-slate-500`} />;
      case "scope":
        return <Bomb className={`${iconClass} text-slate-500`} />;
      case "blocker":
        return <ShieldOff className={`${iconClass} text-slate-500`} />;
      case "coffee":
        return <Sparkles className={`${iconClass} text-slate-500`} />;
      case "insight":
        return <Lightbulb className={`${iconClass} text-slate-500`} />;
    }
  };

  // Running person SVG with animated legs
  const RunningPerson = () => {
    const legSwing = Math.sin(legPhase) * 25;
    const armSwing = Math.sin(legPhase) * 20;
    
    return (
      <svg viewBox="0 0 40 40" className="w-full h-full">
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

  return (
    <Layout>
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
              Navigate the chaos of product development.
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
              className="relative bg-slate-100 border border-slate-300 rounded-2xl overflow-hidden select-none"
              style={{ 
                width: "100%", 
                maxWidth: GAME_WIDTH, 
                height: GAME_HEIGHT,
                touchAction: "none"
              }}
            >
              {/* Clouds */}
              {clouds.map((cloud, index) => (
                <div
                  key={`cloud-${index}`}
                  className="absolute opacity-40"
                  style={{
                    left: cloud.x,
                    top: cloud.y,
                    width: cloud.size,
                    height: cloud.size * 0.6,
                  }}
                >
                  <svg viewBox="0 0 100 60" className="w-full h-full">
                    <ellipse cx="30" cy="40" rx="25" ry="18" fill="#9ca3af" />
                    <ellipse cx="55" cy="35" rx="30" ry="22" fill="#9ca3af" />
                    <ellipse cx="75" cy="42" rx="20" ry="15" fill="#9ca3af" />
                  </svg>
                </div>
              ))}

              {/* Score */}
              <div className="absolute top-4 right-4 text-sm font-medium text-slate-600">
                Users Acquired: <span className="text-slate-800 font-bold">{Math.floor(score)}</span>
              </div>

              {/* Ground with uneven terrain */}
              <div className="absolute left-0 right-0" style={{ top: GROUND_Y }}>
                {groundSegments.map((seg, index) => (
                  <div
                    key={`ground-${index}`}
                    className="absolute bg-slate-400"
                    style={{
                      left: seg.x,
                      top: -seg.height / 2,
                      width: seg.width,
                      height: seg.height,
                      borderRadius: '1px'
                    }}
                  />
                ))}
                {/* Base ground line */}
                <div className="absolute left-0 right-0 h-0.5 bg-slate-400" />
              </div>

              {/* Player - Running Person */}
              <div
                className="absolute"
                style={{
                  left: 60,
                  top: playerY,
                  width: PLAYER_SIZE,
                  height: PLAYER_SIZE,
                  willChange: 'transform',
                  transform: 'translateZ(0)'
                }}
              >
                <RunningPerson />
              </div>

              {/* Objects */}
              {objects.map((obj, index) => (
                <div
                  key={index}
                  className="absolute"
                  style={{
                    left: obj.x,
                    top: obj.y,
                    width: obj.width,
                    height: obj.height,
                    willChange: 'transform',
                    transform: 'translateZ(0)'
                  }}
                >
                  {renderIcon(obj.type)}
                </div>
              ))}

              {/* Start Screen */}
              {gameState === "start" && (
                <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center z-10">
                  <h2 className="font-serif text-2xl md:text-3xl font-medium mb-2">Ready for the Sprint?</h2>
                  <p className="text-muted-foreground text-sm mb-6">Acquire 1,000 users to achieve product-market fit!</p>
                  <Button onClick={startGame} className="bg-primary hover:bg-primary/90">
                    Start Game
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4">Press Space or Tap to Jump</p>
                </div>
              )}

              {/* Game Over Screen */}
              {gameState === "gameover" && (
                <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center z-10">
                  <h2 className="font-serif text-2xl md:text-3xl font-medium mb-2 text-primary">Sprint Failed!</h2>
                  <p className="text-muted-foreground text-sm mb-2">
                    You acquired <span className="font-bold text-foreground">{Math.floor(score)}</span> users
                  </p>
                  <p className="text-muted-foreground text-sm mb-6 max-w-xs text-center">
                    Product Management is hard. Hiring Dale makes it easier.
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={startGame} variant="outline">
                      Try Again
                    </Button>
                    <Button asChild className="bg-primary hover:bg-primary/90">
                      <Link to="/contact">Contact Dale</Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* Win Screen */}
              {gameState === "win" && (
                <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center z-10">
                  <h2 className="font-serif text-2xl md:text-3xl font-medium mb-2">🚀 Product-Market Fit Achieved!</h2>
                  <p className="text-muted-foreground text-sm mb-6 max-w-xs text-center">
                    You clearly know how to navigate a product launch. So do I.
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={startGame} variant="outline">
                      Play Another Sprint
                    </Button>
                    <Button asChild className="bg-primary hover:bg-primary/90">
                      <Link to="/contact">Let's Build Something Real</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-6 text-xs text-muted-foreground"
          >
            <p className="mb-3">
              <Sparkles className="inline w-4 h-4 mr-1" /> Automation & 
              <Lightbulb className="inline w-4 h-4 mx-1" /> Insights = +20 Users
            </p>
            <p>
              Avoid <Bug className="inline w-4 h-4 mx-1" /> Bugs, 
              <Bomb className="inline w-4 h-4 mx-1" /> Scope Creep & 
              <ShieldOff className="inline w-4 h-4 mx-1" /> Blockers
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Play;
