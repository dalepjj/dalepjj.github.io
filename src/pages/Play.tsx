import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { User, Bug, Maximize2, Ban, Coffee, MessageCircle } from "lucide-react";
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

const GAME_WIDTH = 800;
const GAME_HEIGHT = 300;
const GROUND_Y = GAME_HEIGHT - 60;
const PLAYER_SIZE = 40;
const GRAVITY = 0.8;
const JUMP_FORCE = -14;
const INITIAL_SPEED = 5;
const WIN_SCORE = 1000;

const Play = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastSpeedIncreaseRef = useRef<number>(0);
  
  const [gameState, setGameState] = useState<GameState>("start");
  const [score, setScore] = useState(0);
  const [playerY, setPlayerY] = useState(GROUND_Y - PLAYER_SIZE);
  const [velocity, setVelocity] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [gameTime, setGameTime] = useState(0);

  const playerYRef = useRef(playerY);
  const velocityRef = useRef(velocity);
  const isJumpingRef = useRef(isJumping);
  const objectsRef = useRef(objects);
  const speedRef = useRef(speed);
  const scoreRef = useRef(score);
  const gameTimeRef = useRef(gameTime);
  const gameStateRef = useRef(gameState);

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
      setVelocity(JUMP_FORCE);
      setIsJumping(true);
    }
  }, []);

  const spawnObject = useCallback(() => {
    const rand = Math.random();
    let type: GameObject["type"];
    let y: number;
    
    if (rand < 0.2) {
      // Collectibles (floating)
      type = rand < 0.1 ? "coffee" : "insight";
      y = GROUND_Y - PLAYER_SIZE - 40 - Math.random() * 60;
    } else {
      // Obstacles (on ground)
      const obstacleRand = Math.random();
      if (obstacleRand < 0.33) type = "bug";
      else if (obstacleRand < 0.66) type = "scope";
      else type = "blocker";
      y = GROUND_Y - 30;
    }

    return {
      x: GAME_WIDTH + 50,
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
  };

  const startGame = () => {
    resetGame();
    setGameState("playing");
  };

  const gameLoop = useCallback(() => {
    if (gameStateRef.current !== "playing") return;

    // Update game time
    setGameTime(prev => {
      const newTime = prev + 16.67; // ~60fps
      
      // Increase speed every 10 seconds
      if (Math.floor(newTime / 10000) > Math.floor(lastSpeedIncreaseRef.current / 10000)) {
        setSpeed(s => Math.min(s + 0.5, 12));
        lastSpeedIncreaseRef.current = newTime;
      }
      
      return newTime;
    });

    // Update player physics
    setVelocity(prev => prev + GRAVITY);
    setPlayerY(prev => {
      const newY = prev + velocityRef.current;
      if (newY >= GROUND_Y - PLAYER_SIZE) {
        setIsJumping(false);
        setVelocity(0);
        return GROUND_Y - PLAYER_SIZE;
      }
      return newY;
    });

    // Update score (distance)
    setScore(prev => {
      const newScore = prev + 0.1;
      if (newScore >= WIN_SCORE) {
        setGameState("win");
        triggerConfetti();
        return WIN_SCORE;
      }
      return newScore;
    });

    // Spawn objects randomly
    if (Math.random() < 0.02) {
      setObjects(prev => [...prev, spawnObject()]);
    }

    // Update objects
    setObjects(prev => {
      const player = { x: 60, y: playerYRef.current, width: PLAYER_SIZE, height: PLAYER_SIZE };
      
      return prev
        .map(obj => ({ ...obj, x: obj.x - speedRef.current }))
        .filter(obj => {
          if (obj.x < -50) return false;
          
          if (checkCollision(player, obj)) {
            if (obj.type === "coffee" || obj.type === "insight") {
              setScore(s => s + 10);
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
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, gameLoop]);

  useEffect(() => {
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

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, jump]);

  const handleTouch = () => {
    if (gameState === "playing") {
      jump();
    }
  };

  const renderIcon = (type: GameObject["type"]) => {
    const iconClass = "w-full h-full";
    switch (type) {
      case "bug":
        return <Bug className={`${iconClass} text-destructive`} />;
      case "scope":
        return <Maximize2 className={`${iconClass} text-destructive`} />;
      case "blocker":
        return <Ban className={`${iconClass} text-destructive`} />;
      case "coffee":
        return <Coffee className={`${iconClass} text-primary`} />;
      case "insight":
        return <MessageCircle className={`${iconClass} text-primary`} />;
    }
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
              Navigate the chaos of product development. Dodge bugs and scope creep to achieve product-market fit!
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
              className="relative bg-card border border-border rounded-2xl overflow-hidden select-none"
              style={{ 
                width: "100%", 
                maxWidth: GAME_WIDTH, 
                height: GAME_HEIGHT,
                touchAction: "none"
              }}
              onClick={handleTouch}
            >
              {/* Score */}
              <div className="absolute top-4 right-4 text-sm font-medium text-foreground">
                Users Acquired: <span className="text-primary font-bold">{Math.floor(score)}</span>
              </div>

              {/* Ground */}
              <div 
                className="absolute left-0 right-0 border-b-2 border-foreground/20"
                style={{ top: GROUND_Y }}
              />

              {/* Player */}
              <div
                className="absolute transition-none"
                style={{
                  left: 60,
                  top: playerY,
                  width: PLAYER_SIZE,
                  height: PLAYER_SIZE,
                }}
              >
                <div className="w-full h-full bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
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
                  }}
                >
                  {renderIcon(obj.type)}
                </div>
              ))}

              {/* Start Screen */}
              {gameState === "start" && (
                <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center z-10">
                  <h2 className="font-serif text-2xl md:text-3xl font-medium mb-2">Ready for the Sprint?</h2>
                  <p className="text-muted-foreground text-sm mb-6">Dodge bugs and scope creep to launch!</p>
                  <Button onClick={startGame} className="bg-primary hover:bg-primary/90">
                    Start Game
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4">Press Space or Tap to Jump</p>
                </div>
              )}

              {/* Game Over Screen */}
              {gameState === "gameover" && (
                <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center z-10">
                  <h2 className="font-serif text-2xl md:text-3xl font-medium mb-2 text-destructive">Sprint Failed!</h2>
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
            <p>
              <Coffee className="inline w-4 h-4 mr-1" /> Coffee & 
              <MessageCircle className="inline w-4 h-4 mx-1" /> Insights = +10 Users | 
              Avoid <Bug className="inline w-4 h-4 mx-1" /> Bugs, 
              <Maximize2 className="inline w-4 h-4 mx-1" /> Scope Creep & 
              <Ban className="inline w-4 h-4 mx-1" /> Blockers
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Play;
