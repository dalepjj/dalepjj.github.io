import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import confetti from "canvas-confetti";

const GAME_WIDTH = 640;
const GAME_HEIGHT = 300;
const INITIAL_PLAYER_SIZE = 24;
const MAX_HITS = 5;
const HIGH_SCORE_KEY = 'scopeCreepHighScore';

const BAD_LABELS = [
  "Can we make it pop?",
  "CEO's cousin had an idea...",
  "Blockchain integration?",
  "Dark mode (High Priority)",
  "Legacy Support (IE11)",
  "AI-powered everything",
  "Can we pivot to Web3?",
  "Make it like TikTok",
  "Add a chatbot",
  "One more stakeholder review",
];

const GOOD_LABELS = [
  "Fix critical bug",
  "User research",
  "Accessibility audit",
  "Performance optimization",
];

const PHASE_NAMES = ["Random Drift", "Stream Waves", "Spiral Patterns", "Wall Rush"];

interface FeatureRequest {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  label: string;
  isGood: boolean;
  width: number;
  height: number;
}

interface PowerUp {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

type GameState = "start" | "playing" | "gameover" | "win";

let audioContext: AudioContext | null = null;
const getAudioContext = (): AudioContext | null => {
  try {
    if (!audioContext) audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();
    return audioContext;
  } catch { return null; }
};
const createBeep = (frequency: number, duration: number, volume = 0.1) => {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = frequency;
  osc.type = "square";
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
};

const playHitSound = () => { createBeep(300, 0.15, 0.1); setTimeout(() => createBeep(200, 0.15, 0.08), 100); };
const playNoSound = () => { createBeep(523, 0.1, 0.08); setTimeout(() => createBeep(784, 0.1, 0.08), 80); setTimeout(() => createBeep(1047, 0.15, 0.1), 160); };
const playGreenSound = () => { createBeep(659, 0.08, 0.08); setTimeout(() => createBeep(784, 0.08, 0.08), 60); setTimeout(() => createBeep(1047, 0.12, 0.1), 120); };
const playWinSound = () => { createBeep(523, 0.12, 0.1); setTimeout(() => createBeep(659, 0.12, 0.1), 100); setTimeout(() => createBeep(784, 0.12, 0.1), 200); setTimeout(() => createBeep(1047, 0.3, 0.12), 300); };
const playGameOverSound = () => { createBeep(400, 0.15, 0.1); setTimeout(() => createBeep(300, 0.15, 0.1), 150); setTimeout(() => createBeep(200, 0.2, 0.08), 300); };

interface ScopeCreepSurvivorProps {
  onBack: () => void;
}

const ScopeCreepSurvivor = ({ onBack }: ScopeCreepSurvivorProps) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const powerUpTimerRef = useRef<number>(0);
  const nextIdRef = useRef(0);

  const [gameState, setGameState] = useState<GameState>("start");
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2);
  const [playerY, setPlayerY] = useState(GAME_HEIGHT / 2);
  const [requests, setRequests] = useState<FeatureRequest[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [mvpProgress, setMvpProgress] = useState(0);
  const [hits, setHits] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [phaseLabel, setPhaseLabel] = useState("");
  const [containerWidth, setContainerWidth] = useState(GAME_WIDTH);
  const [edgeGlow, setEdgeGlow] = useState(false);

  const scaleFactor = containerWidth / GAME_WIDTH;
  const playerSize = INITIAL_PLAYER_SIZE * (1 + hits * 0.15);
  const mvpSpeed = Math.max(0.02, 0.06 - hits * 0.012);

  const playerXRef = useRef(playerX);
  const playerYRef = useRef(playerY);
  const requestsRef = useRef(requests);
  const powerUpsRef = useRef(powerUps);
  const mvpProgressRef = useRef(mvpProgress);
  const hitsRef = useRef(hits);
  const gameStateRef = useRef(gameState);
  const playerSizeRef = useRef(playerSize);

  useEffect(() => { playerXRef.current = playerX; }, [playerX]);
  useEffect(() => { playerYRef.current = playerY; }, [playerY]);
  useEffect(() => { requestsRef.current = requests; }, [requests]);
  useEffect(() => { powerUpsRef.current = powerUps; }, [powerUps]);
  useEffect(() => { mvpProgressRef.current = mvpProgress; }, [mvpProgress]);
  useEffect(() => { hitsRef.current = hits; }, [hits]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { playerSizeRef.current = playerSize; }, [playerSize]);

  useEffect(() => {
    const updateSize = () => { if (gameRef.current) setContainerWidth(gameRef.current.clientWidth); };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(HIGH_SCORE_KEY);
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const getPhase = (progress: number) => {
    if (progress < 25) return 0;
    if (progress < 50) return 1;
    if (progress < 75) return 2;
    return 3;
  };

  const lastPhaseRef = useRef(-1);

  const spawnRequest = useCallback((progress: number) => {
    const phase = getPhase(progress);
    const isGood = Math.random() < 0.10;
    const label = isGood
      ? GOOD_LABELS[Math.floor(Math.random() * GOOD_LABELS.length)]
      : BAD_LABELS[Math.floor(Math.random() * BAD_LABELS.length)];
    const w = 90;
    const h = 24;
    const id = nextIdRef.current++;

    let x: number, y: number, vx: number, vy: number;
    const px = playerXRef.current;
    const py = playerYRef.current;
    const baseSpeed = 1.2 + phase * 0.4;

    if (phase === 0) {
      // Random drift
      const edge = Math.floor(Math.random() * 4);
      if (edge === 0) { x = -w; y = Math.random() * GAME_HEIGHT; }
      else if (edge === 1) { x = GAME_WIDTH; y = Math.random() * GAME_HEIGHT; }
      else if (edge === 2) { x = Math.random() * GAME_WIDTH; y = -h; }
      else { x = Math.random() * GAME_WIDTH; y = GAME_HEIGHT; }
      const angle = Math.atan2(py - y, px - x) + (Math.random() - 0.5) * 1.2;
      vx = Math.cos(angle) * baseSpeed;
      vy = Math.sin(angle) * baseSpeed;
    } else if (phase === 1) {
      // Stream waves - horizontal or vertical
      const horizontal = Math.random() < 0.5;
      if (horizontal) {
        x = Math.random() < 0.5 ? -w : GAME_WIDTH;
        y = 30 + Math.random() * (GAME_HEIGHT - 60);
        vx = x < 0 ? baseSpeed * 1.3 : -baseSpeed * 1.3;
        vy = 0;
      } else {
        x = 30 + Math.random() * (GAME_WIDTH - 60);
        y = Math.random() < 0.5 ? -h : GAME_HEIGHT;
        vx = 0;
        vy = y < 0 ? baseSpeed * 1.3 : -baseSpeed * 1.3;
      }
    } else if (phase === 2) {
      // Spiral patterns
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.max(GAME_WIDTH, GAME_HEIGHT) * 0.6;
      x = GAME_WIDTH / 2 + Math.cos(angle) * radius;
      y = GAME_HEIGHT / 2 + Math.sin(angle) * radius;
      const spiralAngle = angle + Math.PI + 0.5;
      vx = Math.cos(spiralAngle) * baseSpeed * 1.2;
      vy = Math.sin(spiralAngle) * baseSpeed * 1.2;
    } else {
      // Wall rush - dense walls with gaps
      const horizontal = Math.random() < 0.5;
      if (horizontal) {
        x = Math.random() < 0.5 ? -w : GAME_WIDTH;
        y = Math.floor(Math.random() * 5) * (GAME_HEIGHT / 5);
        vx = x < 0 ? baseSpeed * 1.8 : -baseSpeed * 1.8;
        vy = 0;
      } else {
        x = Math.floor(Math.random() * 6) * (GAME_WIDTH / 6);
        y = Math.random() < 0.5 ? -h : GAME_HEIGHT;
        vx = 0;
        vy = y < 0 ? baseSpeed * 1.8 : -baseSpeed * 1.8;
      }
    }

    return { id, x, y, vx, vy, label, isGood, width: w, height: h };
  }, []);

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#EEC7C4', '#E48981', '#C3A19E'] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#EEC7C4', '#E48981', '#C3A19E'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const startGame = () => {
    setGameState("playing");
    setPlayerX(GAME_WIDTH / 2);
    setPlayerY(GAME_HEIGHT / 2);
    setRequests([]);
    setPowerUps([]);
    setMvpProgress(0);
    setHits(0);
    setIsNewHighScore(false);
    setPhaseLabel("");
    spawnTimerRef.current = 0;
    powerUpTimerRef.current = 0;
    lastPhaseRef.current = -1;
    lastTimeRef.current = 0;
    nextIdRef.current = 0;
    getAudioContext();
  };

  const gameLoop = useCallback((timestamp: number) => {
    if (gameStateRef.current !== "playing") return;

    const dt = lastTimeRef.current ? Math.min((timestamp - lastTimeRef.current) / 16.67, 3) : 1;
    lastTimeRef.current = timestamp;

    // MVP progress
    setMvpProgress(prev => {
      const newP = Math.min(prev + mvpSpeed * dt, 100);
      // Phase transitions
      const phase = getPhase(newP);
      if (phase !== lastPhaseRef.current) {
        lastPhaseRef.current = phase;
        setPhaseLabel(`Phase ${phase + 1}: ${PHASE_NAMES[phase]}`);
        setEdgeGlow(true);
        setTimeout(() => setPhaseLabel(""), 2000);
        setTimeout(() => setEdgeGlow(false), 1000);
      }
      if (newP >= 100) {
        // Win!
        playWinSound();
        triggerConfetti();
        const satisfaction = Math.max(0, 100 - hitsRef.current * 20);
        if (satisfaction > highScore) {
          setHighScore(satisfaction);
          setIsNewHighScore(true);
          localStorage.setItem(HIGH_SCORE_KEY, satisfaction.toString());
        }
        setGameState("win");
        return 100;
      }
      return newP;
    });

    // Spawning
    spawnTimerRef.current += dt;
    const progress = mvpProgressRef.current;
    const phase = getPhase(progress);
    const spawnInterval = Math.max(8, 30 - phase * 6);

    if (spawnTimerRef.current > spawnInterval) {
      spawnTimerRef.current = 0;
      const batchSize = phase === 3 ? 3 : phase === 2 ? 2 : 1;
      setRequests(prev => {
        const newReqs = [];
        for (let i = 0; i < batchSize; i++) {
          newReqs.push(spawnRequest(progress));
        }
        return [...prev, ...newReqs];
      });
    }

    // Power-up spawning
    powerUpTimerRef.current += dt;
    if (powerUpTimerRef.current > 60 * (15 + Math.random() * 5) / 16.67) {
      powerUpTimerRef.current = 0;
      setPowerUps(prev => [...prev, {
        id: nextIdRef.current++,
        x: 50 + Math.random() * (GAME_WIDTH - 100),
        y: 30 + Math.random() * (GAME_HEIGHT - 80),
        width: 36,
        height: 36,
      }]);
    }

    // Move requests
    setRequests(prev => {
      const px = playerXRef.current;
      const py = playerYRef.current;
      const ps = playerSizeRef.current;
      const half = ps / 2;
      let hitOccurred = false;
      let goodCollected = false;

      const updated = prev
        .map(r => ({ ...r, x: r.x + r.vx * dt, y: r.y + r.vy * dt }))
        .filter(r => {
          // Off-screen check
          if (r.x < -120 || r.x > GAME_WIDTH + 120 || r.y < -60 || r.y > GAME_HEIGHT + 60) return false;

          // Collision
          const overlap =
            px - half < r.x + r.width &&
            px + half > r.x &&
            py - half < r.y + r.height &&
            py + half > r.y;

          if (overlap) {
            if (r.isGood) {
              goodCollected = true;
              playGreenSound();
              setMvpProgress(p => Math.min(p + 6, 100));
              return false;
            } else {
              hitOccurred = true;
              return false;
            }
          }
          return true;
        });

      if (hitOccurred) {
        playHitSound();
        setHits(h => {
          const newHits = h + 1;
          if (newHits >= MAX_HITS) {
            playGameOverSound();
            const satisfaction = Math.max(0, 100 - newHits * 20);
            if (satisfaction > highScore) {
              setHighScore(satisfaction);
              setIsNewHighScore(true);
              localStorage.setItem(HIGH_SCORE_KEY, satisfaction.toString());
            }
            setGameState("gameover");
          }
          return newHits;
        });
      }

      return updated;
    });

    // Power-up collision
    setPowerUps(prev => {
      const px = playerXRef.current;
      const py = playerYRef.current;
      const ps = playerSizeRef.current;
      const half = ps / 2;

      return prev.filter(p => {
        const overlap =
          px - half < p.x + p.width &&
          px + half > p.x &&
          py - half < p.y + p.height &&
          py + half > p.y;

        if (overlap) {
          playNoSound();
          setRequests([]);
          setHits(h => Math.max(0, h - 1));
          return false;
        }
        return true;
      });
    });

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [spawnRequest, mvpSpeed, highScore]);

  useEffect(() => {
    if (gameState === "playing") {
      lastTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [gameState, gameLoop]);

  // Keyboard input
  useEffect(() => {
    const keys = new Set<string>();
    const speed = 4;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space'].includes(e.code)) {
        e.preventDefault();
        keys.add(e.code);
      }
      if (e.code === 'Space' && gameState === 'start') startGame();
    };
    const handleKeyUp = (e: KeyboardEvent) => keys.delete(e.code);

    let moveFrame: number;
    const moveLoop = () => {
      if (gameStateRef.current === 'playing') {
        let dx = 0, dy = 0;
        if (keys.has('ArrowLeft') || keys.has('KeyA')) dx -= speed;
        if (keys.has('ArrowRight') || keys.has('KeyD')) dx += speed;
        if (keys.has('ArrowUp') || keys.has('KeyW')) dy -= speed;
        if (keys.has('ArrowDown') || keys.has('KeyS')) dy += speed;
        if (dx !== 0 || dy !== 0) {
          setPlayerX(x => Math.max(12, Math.min(GAME_WIDTH - 12, x + dx)));
          setPlayerY(y => Math.max(12, Math.min(GAME_HEIGHT - 12, y + dy)));
        }
      }
      moveFrame = requestAnimationFrame(moveLoop);
    };
    moveFrame = requestAnimationFrame(moveLoop);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(moveFrame);
    };
  }, [gameState]);

  // Touch/mouse input
  useEffect(() => {
    const el = gameRef.current;
    if (!el) return;

    const mapToGame = (clientX: number, clientY: number) => {
      const rect = el.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * GAME_WIDTH;
      const y = ((clientY - rect.top) / rect.height) * GAME_HEIGHT;
      return {
        x: Math.max(12, Math.min(GAME_WIDTH - 12, x)),
        y: Math.max(12, Math.min(GAME_HEIGHT - 12, y)),
      };
    };

    const onTouchMove = (e: TouchEvent) => {
      if (gameStateRef.current !== 'playing') return;
      e.preventDefault();
      const t = e.touches[0];
      const pos = mapToGame(t.clientX, t.clientY);
      setPlayerX(pos.x);
      setPlayerY(pos.y);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (gameStateRef.current !== 'playing') return;
      const pos = mapToGame(e.clientX, e.clientY);
      setPlayerX(pos.x);
      setPlayerY(pos.y);
    };

    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('mousemove', onMouseMove);
    return () => {
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  const satisfaction = Math.max(0, 100 - hits * 20);
  const phase = getPhase(mvpProgress);

  const gameStyles = `
    @keyframes ticket-pulse { 0%, 100% { box-shadow: 0 0 4px rgba(34, 197, 94, 0.4); } 50% { box-shadow: 0 0 12px rgba(34, 197, 94, 0.8); } }
    @keyframes no-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
  `;

  return (
    <div>
      <style>{gameStyles}</style>
      <div className="text-center mb-8">
        <button onClick={onBack} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Games
        </button>
        <h1 className="section-title mb-4">Scope Creep Survivor</h1>
        <p className="body-text max-w-xl mx-auto">
          Dodge feature requests and ship your MVP. Collect green tickets for a boost!
        </p>
      </div>

      <div className="flex justify-center">
        <div
          ref={gameRef}
          role="application"
          aria-label="Scope Creep Survivor - Use arrow keys or mouse to dodge"
          className="relative border border-slate-300 rounded-2xl overflow-hidden select-none cursor-none"
          style={{
            width: "100%",
            maxWidth: GAME_WIDTH,
            aspectRatio: `${GAME_WIDTH} / ${GAME_HEIGHT}`,
            touchAction: "none",
            background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
          }}
        >
          {/* Edge glow on phase transition */}
          {edgeGlow && (
            <div className="absolute inset-0 pointer-events-none z-20" style={{ boxShadow: 'inset 0 0 40px 15px rgba(228, 137, 129, 0.4)', transition: 'opacity 0.3s' }} />
          )}

          {/* Phase label */}
          <AnimatePresence>
            {phaseLabel && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
              >
                <div className="bg-foreground/80 text-background px-4 py-2 rounded-lg font-serif text-lg font-medium">
                  {phaseLabel}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MVP Progress Bar */}
          {gameState === "playing" && (
            <div className="absolute bottom-2 left-4 right-4 z-10">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-slate-500 whitespace-nowrap">MVP</span>
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-200"
                    style={{
                      width: `${mvpProgress}%`,
                      background: mvpProgress > 75 ? '#22c55e' : mvpProgress > 50 ? '#eab308' : '#EEC7C4',
                    }}
                  />
                </div>
                <span className="text-[10px] font-medium text-slate-500">{Math.floor(mvpProgress)}%</span>
              </div>
            </div>
          )}

          {/* HUD */}
          {gameState === "playing" && (
            <>
              <div className="absolute top-3 left-3 z-10">
                <div className="text-[10px] text-slate-500 font-medium">
                  Bloat: {hits}/{MAX_HITS}
                </div>
              </div>
              <div className="absolute top-3 right-3 z-10 text-right">
                <div className="text-[10px] text-slate-500 font-medium">
                  Satisfaction: {satisfaction}%
                </div>
                {highScore > 0 && (
                  <div className="text-[9px] text-slate-400">Best: {highScore}%</div>
                )}
              </div>
            </>
          )}

          {/* Feature requests */}
          {requests.map(r => (
            <div
              key={r.id}
              className="absolute pointer-events-none"
              style={{
                left: r.x * scaleFactor,
                top: r.y * scaleFactor,
                width: r.width * scaleFactor,
                height: r.height * scaleFactor,
                willChange: 'transform',
              }}
            >
              <div
                className={`w-full h-full rounded px-1 flex items-center justify-center text-white font-medium overflow-hidden ${
                  r.isGood ? 'border-2 border-green-500 bg-green-600' : 'bg-red-500/90'
                }`}
                style={{
                  fontSize: `${Math.max(7, 9 * scaleFactor)}px`,
                  animation: r.isGood ? 'ticket-pulse 1.5s ease-in-out infinite' : undefined,
                }}
              >
                <span className="truncate">{r.label}</span>
              </div>
            </div>
          ))}

          {/* Power-ups */}
          {powerUps.map(p => (
            <div
              key={p.id}
              className="absolute pointer-events-none"
              style={{
                left: p.x * scaleFactor,
                top: p.y * scaleFactor,
                width: p.width * scaleFactor,
                height: p.height * scaleFactor,
                animation: 'no-pulse 1s ease-in-out infinite',
              }}
            >
              <div className="w-full h-full rounded-full bg-red-600 flex items-center justify-center border-2 border-red-300">
                <span className="text-white font-black" style={{ fontSize: `${Math.max(8, 11 * scaleFactor)}px` }}>NO</span>
              </div>
            </div>
          ))}

          {/* Player - North Star */}
          {gameState === "playing" && (
            <div
              className="absolute pointer-events-none z-10"
              style={{
                left: (playerX - playerSize / 2) * scaleFactor,
                top: (playerY - playerSize / 2) * scaleFactor,
                width: playerSize * scaleFactor,
                height: playerSize * scaleFactor,
                transition: 'width 0.3s, height 0.3s',
              }}
            >
              <svg viewBox="0 0 40 40" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 6px rgba(238, 199, 196, 0.8))' }}>
                <polygon
                  points="20,2 24,14 37,14 27,22 31,35 20,27 9,35 13,22 3,14 16,14"
                  fill="#EEC7C4"
                  stroke="#E48981"
                  strokeWidth="1.5"
                />
                <polygon
                  points="20,8 22,15 30,15 24,20 26,28 20,23 14,28 16,20 10,15 18,15"
                  fill="white"
                  opacity="0.4"
                />
              </svg>
            </div>
          )}

          {/* Start screen */}
          {gameState === "start" && (
            <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center z-10 gap-3">
              <Button onClick={startGame} className="bg-primary hover:bg-primary/90 px-8 py-3 text-lg">
                Start Game
              </Button>
              <p className="text-xs text-muted-foreground max-w-xs text-center">
                Arrow keys / WASD to move, or use mouse / touch
              </p>
            </div>
          )}

          {/* Game over */}
          {gameState === "gameover" && (
            <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center z-10">
              <h2 className="font-serif text-2xl md:text-3xl font-medium mb-2 text-primary">Scope Creep Won!</h2>
              <p className="text-muted-foreground text-sm mb-1">
                MVP Progress: <span className="font-bold text-foreground">{Math.floor(mvpProgress)}%</span>
              </p>
              <p className="text-muted-foreground text-sm mb-1">
                User Satisfaction: <span className="font-bold text-foreground">{satisfaction}%</span>
              </p>
              {isNewHighScore && (
                <motion.p initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-coral font-bold text-sm mb-2">
                  🎉 New Best!
                </motion.p>
              )}
              <p className="text-muted-foreground text-sm mb-6 max-w-xs text-center">
                Sometimes you need someone who knows when to say NO. That's Dale.
              </p>
              <div className="flex gap-3">
                <Button onClick={startGame} variant="outline">Try Again</Button>
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link to="/contact">Contact Dale</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Win screen */}
          {gameState === "win" && (
            <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center z-10">
              <h2 className="font-serif text-xl md:text-2xl font-medium mb-2">🚀 Product Launched!</h2>
              <p className="text-muted-foreground text-sm mb-1">(Only 2 months late)</p>
              <p className="text-muted-foreground text-sm mb-1">
                User Satisfaction: <span className="font-bold text-foreground">{satisfaction}%</span>
              </p>
              {isNewHighScore && (
                <motion.p initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-coral font-bold text-sm mb-2">
                  🎉 New Best!
                </motion.p>
              )}
              <p className="text-muted-foreground text-sm mb-6 max-w-xs text-center">
                You know how to stay focused and ship. So does Dale.
              </p>
              <div className="flex gap-3">
                <Button onClick={startGame} variant="outline">Play Again</Button>
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link to="/contact">Let's Build Something Real</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      {gameState !== "start" && (
        <div className="text-center mt-6 text-xs text-muted-foreground space-y-1">
          <p><span className="inline-block w-3 h-3 bg-red-500/90 rounded mr-1 align-middle" /> Bad requests = dodge them</p>
          <p><span className="inline-block w-3 h-3 bg-green-600 rounded mr-1 align-middle border border-green-400" /> Good requests = collect for MVP boost</p>
          <p><span className="inline-block w-4 h-4 bg-red-600 rounded-full mr-1 align-middle text-[8px] text-white font-black leading-4 text-center">N</span> "Saying NO" = clears screen & reduces bloat</p>
        </div>
      )}
    </div>
  );
};

export default ScopeCreepSurvivor;
