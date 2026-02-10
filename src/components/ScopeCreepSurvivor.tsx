import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Keyboard, Trophy, Volume2, VolumeX } from "lucide-react";
import confetti from "canvas-confetti";

// ── Types ──────────────────────────────────────────────────────────────
interface AcronymEntry {
  acronym: string;
  definition: string[];
}

interface Level {
  name: string;
  title: string;
  entries: AcronymEntry[];
  requiredCorrect: number;
}

type GameState = "start" | "levelIntro" | "playing" | "win" | "gameover";

// ── Data ───────────────────────────────────────────────────────────────
const LEVELS: Level[] = [
  {
    name: "The Basics",
    title: "Junior PM",
    requiredCorrect: 4,
    entries: [
      { acronym: "MVP", definition: ["Minimum", "Viable", "Product"] },
      { acronym: "UX", definition: ["User", "Experience"] },
      { acronym: "UI", definition: ["User", "Interface"] },
      { acronym: "QA", definition: ["Quality", "Assurance"] },
      { acronym: "PRD", definition: ["Product", "Requirements", "Document"] },
      { acronym: "SaaS", definition: ["Software", "as", "a", "Service"] },
    ],
  },
  {
    name: "The Metrics",
    title: "Data-Driven",
    requiredCorrect: 5,
    entries: [
      { acronym: "KPI", definition: ["Key", "Performance", "Indicator"] },
      { acronym: "OKR", definition: ["Objectives", "and", "Key", "Results"] },
      { acronym: "MAU", definition: ["Monthly", "Active", "Users"] },
      { acronym: "DAU", definition: ["Daily", "Active", "Users"] },
      { acronym: "NPS", definition: ["Net", "Promoter", "Score"] },
      { acronym: "CTR", definition: ["Click-Through", "Rate"] },
      { acronym: "LTV", definition: ["Lifetime", "Value"] },
      { acronym: "CAC", definition: ["Customer", "Acquisition", "Cost"] },
    ],
  },
  {
    name: "Frameworks & Process",
    title: "Agile Master",
    requiredCorrect: 5,
    entries: [
      { acronym: "RICE", definition: ["Reach,", "Impact,", "Confidence,", "Effort"] },
      { acronym: "GTM", definition: ["Go-To-Market"] },
      { acronym: "MoSCoW", definition: ["Must", "have,", "Should", "have,", "Could", "have,", "Won't", "have"] },
      { acronym: "B2B", definition: ["Business", "to", "Business"] },
      { acronym: "B2C", definition: ["Business", "to", "Consumer"] },
      { acronym: "API", definition: ["Application", "Programming", "Interface"] },
      { acronym: "SDK", definition: ["Software", "Development", "Kit"] },
    ],
  },
  {
    name: "The Deep Cuts",
    title: "Product Leader",
    requiredCorrect: 5,
    entries: [
      { acronym: "TAM", definition: ["Total", "Addressable", "Market"] },
      { acronym: "PLG", definition: ["Product-Led", "Growth"] },
      { acronym: "ARR", definition: ["Annual", "Recurring", "Revenue"] },
      { acronym: "MRR", definition: ["Monthly", "Recurring", "Revenue"] },
      { acronym: "ARPU", definition: ["Average", "Revenue", "Per", "User"] },
      { acronym: "SLA", definition: ["Service", "Level", "Agreement"] },
      { acronym: "EBITDA", definition: ["Earnings", "Before", "Interest,", "Taxes,", "Depreciation,", "and", "Amortization"] },
    ],
  },
];

const CORRECT_MESSAGES = [
  "Stakeholders are nodding!",
  "Engineering actually understood you!",
  "That's going in the release notes.",
  "The board is impressed.",
  "Ship it!",
];

const INCORRECT_MESSAGES = [
  "Let's take this offline.",
  "Let's circle back in the next sprint.",
  "We'll add it to the backlog.",
  "Maybe we need a workshop for that.",
  "Parking lot item.",
];

const GAME_HEIGHT = 300;
const BASE_FALL_SPEED = 0.6;

function getPromotionTitle(misses: number) {
  if (misses === 0) return "Chief Acronym Officer";
  if (misses <= 3) return "Senior Director of Alphabet Soup";
  if (misses <= 6) return "VP of Verbose Phrases";
  return "Junior Associate of Jargon";
}

function makeHint(word: string): string {
  if (word.length <= 1) return word;
  return word[0] + "·".repeat(word.length - 1);
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Audio ──────────────────────────────────────────────────────────────
function createAudioContext() {
  return new (window.AudioContext || (window as any).webkitAudioContext)();
}

function playBeep(ctx: AudioContext, freq: number, duration: number, type: OscillatorType = "sine", gain = 0.12) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start();
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.stop(ctx.currentTime + duration);
}

function playCorrectWord(ctx: AudioContext) {
  playBeep(ctx, 660, 0.12, "sine", 0.1);
}

function playFullCorrect(ctx: AudioContext) {
  [0, 80, 160].forEach((d, i) =>
    setTimeout(() => playBeep(ctx, 520 + i * 130, 0.2, "sine", 0.1), d)
  );
}

function playWrong(ctx: AudioContext) {
  playBeep(ctx, 180, 0.25, "sawtooth", 0.08);
}

function playLevelComplete(ctx: AudioContext) {
  [0, 100, 200, 300].forEach((d, i) =>
    setTimeout(() => playBeep(ctx, 400 + i * 100, 0.15, "sine", 0.1), d)
  );
}

function playGameOverSound(ctx: AudioContext) {
  [0, 150, 300].forEach((d, i) =>
    setTimeout(() => playBeep(ctx, 500 - i * 120, 0.3, "sawtooth", 0.08), d)
  );
}

function playVictoryFanfare(ctx: AudioContext) {
  const notes = [523, 587, 659, 784, 880, 1047];
  notes.forEach((f, i) =>
    setTimeout(() => playBeep(ctx, f, 0.25, "sine", 0.1), i * 120)
  );
}

// ── Component ──────────────────────────────────────────────────────────
interface Props {
  onBack: () => void;
}

const ScopeCreepSurvivor = ({ onBack }: Props) => {
  const [gameState, setGameState] = useState<GameState>("start");
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [revealedWords, setRevealedWords] = useState<boolean[]>([]);
  const [fallY, setFallY] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [inputFlash, setInputFlash] = useState<"none" | "correct" | "wrong">("none");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [totalMisses, setTotalMisses] = useState(0);
  const [levelCorrect, setLevelCorrect] = useState(0);
  const [levelMisses, setLevelMisses] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [highScore, setHighScore] = useState<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const fallYRef = useRef(0);
  const activeRef = useRef(false);

  // Refs for stable callbacks in animation loop
  const stateRef = useRef({
    currentLevel: 0,
    currentEntryIndex: 0,
    levelCorrect: 0,
    levelMisses: 0,
    totalMisses: 0,
    soundOn: true,
  });
  stateRef.current = {
    currentLevel,
    currentEntryIndex,
    levelCorrect,
    levelMisses,
    totalMisses,
    soundOn,
  };

  const level = LEVELS[currentLevel];
  const entry = level?.entries[currentEntryIndex];

  useEffect(() => {
    const stored = localStorage.getItem("decipherHighScore");
    if (stored) setHighScore(parseInt(stored, 10));
  }, []);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) audioCtxRef.current = createAudioContext();
    return audioCtxRef.current;
  }, []);

  const playSound = useCallback(
    (fn: (ctx: AudioContext) => void) => {
      if (!stateRef.current.soundOn) return;
      try { fn(getAudioCtx()); } catch {}
    },
    [getAudioCtx]
  );

  const stopFalling = useCallback(() => {
    activeRef.current = false;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, []);

  // advanceEntry & handleMiss use refs so they're always current in the animation loop
  const advanceEntryRef = useRef<(wasCorrect: boolean) => void>(() => {});
  const handleMissRef = useRef<() => void>(() => {});

  const startFallingForLevel = useCallback((lvl: number) => {
    fallYRef.current = 0;
    setFallY(0);
    activeRef.current = true;
    lastTimeRef.current = performance.now();
    const spd = BASE_FALL_SPEED * (1 + lvl * 0.25);

    const loop = (now: number) => {
      if (!activeRef.current) return;
      const delta = (now - lastTimeRef.current) / 16.67;
      lastTimeRef.current = now;
      fallYRef.current += spd * delta;
      setFallY(fallYRef.current);
      if (fallYRef.current >= GAME_HEIGHT) {
        activeRef.current = false;
        handleMissRef.current();
        return;
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => () => { stopFalling(); }, [stopFalling]);

  // Define advanceEntry
  advanceEntryRef.current = (wasCorrect: boolean) => {
    const s = stateRef.current;
    const newCorrect = wasCorrect ? s.levelCorrect + 1 : s.levelCorrect;
    if (wasCorrect) setLevelCorrect(newCorrect);

    const nextIdx = s.currentEntryIndex + 1;
    const lvl = LEVELS[s.currentLevel];

    if (nextIdx >= lvl.entries.length) {
      if (newCorrect >= lvl.requiredCorrect) {
        if (s.currentLevel + 1 >= LEVELS.length) {
          const finalMisses = s.totalMisses;
          const prev = localStorage.getItem("decipherHighScore");
          const prevBest = prev ? parseInt(prev, 10) : Infinity;
          if (finalMisses < prevBest) {
            localStorage.setItem("decipherHighScore", finalMisses.toString());
            setHighScore(finalMisses);
          }
          playSound(playVictoryFanfare);
          confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
          setGameState("win");
        } else {
          playSound(playLevelComplete);
          const nextLevel = s.currentLevel + 1;
          setCurrentLevel(nextLevel);
          setCurrentEntryIndex(0);
          setLevelCorrect(0);
          setLevelMisses(0);
          setGameState("levelIntro");
        }
      } else {
        playSound(playGameOverSound);
        setGameState("gameover");
      }
    } else {
      setCurrentEntryIndex(nextIdx);
      setWordIndex(0);
      setRevealedWords(new Array(lvl.entries[nextIdx].definition.length).fill(false));
      setInputValue("");
      setFeedbackMsg("");
      setTimeout(() => {
        startFallingForLevel(s.currentLevel);
        inputRef.current?.focus();
      }, 500);
    }
  };

  handleMissRef.current = () => {
    stopFalling();
    setTotalMisses((p) => p + 1);
    setLevelMisses((p) => p + 1);
    setFeedbackMsg(randomPick(INCORRECT_MESSAGES));
    playSound(playGameOverSound);
    setTimeout(() => advanceEntryRef.current(false), 1200);
  };

  const startGame = () => {
    setCurrentLevel(0);
    setCurrentEntryIndex(0);
    setWordIndex(0);
    setTotalMisses(0);
    setLevelCorrect(0);
    setLevelMisses(0);
    setFeedbackMsg("");
    setInputValue("");
    setRevealedWords(new Array(LEVELS[0].entries[0].definition.length).fill(false));
    setGameState("levelIntro");
  };

  const startLevel = () => {
    const e = LEVELS[currentLevel].entries[0];
    setRevealedWords(new Array(e.definition.length).fill(false));
    setWordIndex(0);
    setInputValue("");
    setFeedbackMsg("");
    setCurrentEntryIndex(0);
    setGameState("playing");
    setTimeout(() => {
      startFallingForLevel(currentLevel);
      inputRef.current?.focus();
    }, 100);
  };

  const handleSubmitWord = () => {
    if (!entry || gameState !== "playing") return;
    const typed = inputValue.trim();
    if (!typed) return;

    const expected = entry.definition[wordIndex];
    const normalize = (s: string) => s.replace(/[,.:;!?]/g, "").toLowerCase();

    if (normalize(typed) === normalize(expected)) {
      const newRevealed = [...revealedWords];
      newRevealed[wordIndex] = true;
      setRevealedWords(newRevealed);
      setInputValue("");
      setInputFlash("correct");
      setTimeout(() => setInputFlash("none"), 300);

      if (wordIndex + 1 >= entry.definition.length) {
        stopFalling();
        setFeedbackMsg(randomPick(CORRECT_MESSAGES));
        playSound(playFullCorrect);
        setTimeout(() => advanceEntryRef.current(true), 1000);
      } else {
        setWordIndex(wordIndex + 1);
        playSound(playCorrectWord);
      }
    } else {
      setInputValue("");
      setInputFlash("wrong");
      playSound(playWrong);
      setFeedbackMsg(randomPick(INCORRECT_MESSAGES));
      setTimeout(() => {
        setInputFlash("none");
        setFeedbackMsg("");
      }, 800);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSubmitWord();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => { stopFalling(); onBack(); }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Games
        </button>
        <div className="flex items-center gap-3">
          {highScore !== null && (
            <span className="text-xs text-muted-foreground">
              Best: {highScore} miss{highScore !== 1 ? "es" : ""}
            </span>
          )}
          <button
            onClick={() => setSoundOn(!soundOn)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </div>

      {/* Start Screen */}
      {gameState === "start" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Keyboard className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h2 className="font-serif text-3xl mb-3">The Decipher</h2>
          <p className="text-muted-foreground mb-2 max-w-md mx-auto">
            PMs love acronyms. Type the full definition before it hits the bottom.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            4 levels · {LEVELS.reduce((a, l) => a + l.entries.length, 0)} acronyms · Can you earn a promotion?
          </p>
          <Button onClick={startGame} className="bg-primary hover:bg-primary/90">
            Start Game
          </Button>
        </motion.div>
      )}

      {/* Level Intro */}
      {gameState === "levelIntro" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <p className="text-sm text-muted-foreground mb-2">Level {currentLevel + 1}</p>
          <h2 className="font-serif text-2xl mb-1">{level.name}</h2>
          <p className="text-muted-foreground mb-6">The "{level.title}" Level</p>
          <p className="text-xs text-muted-foreground mb-6">
            Get {level.requiredCorrect} of {level.entries.length} correct to advance
          </p>
          <Button onClick={startLevel} className="bg-primary hover:bg-primary/90">
            Ready
          </Button>
        </motion.div>
      )}

      {/* Playing */}
      {gameState === "playing" && entry && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Level {currentLevel + 1}: {level.name}</span>
            <span>
              Acronym {currentEntryIndex + 1}/{level.entries.length} · ✓ {levelCorrect} · ✗ {levelMisses}
            </span>
          </div>

          <div
            className="relative border border-border rounded-xl overflow-hidden bg-background"
            style={{ height: GAME_HEIGHT, maxWidth: 640 }}
          >
            <div
              className="absolute left-1/2 -translate-x-1/2 font-serif font-bold text-4xl md:text-5xl select-none"
              style={{
                top: Math.min(fallY, GAME_HEIGHT - 40),
                color: "hsl(var(--primary))",
                textShadow: "0 2px 12px hsl(var(--primary) / 0.3)",
              }}
            >
              {entry.acronym}
            </div>
            <div
              className="absolute bottom-0 left-0 right-0 h-1"
              style={{ background: "hsl(var(--destructive) / 0.5)" }}
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center mt-4 mb-3 min-h-[2rem]">
            {entry.definition.map((word, i) => (
              <span
                key={i}
                className={`px-2 py-1 rounded text-sm font-mono transition-colors ${
                  revealedWords[i]
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : i === wordIndex
                    ? "bg-muted border border-primary/40 text-foreground"
                    : "bg-muted/50 text-muted-foreground border border-transparent"
                }`}
              >
                {revealedWords[i] ? word : makeHint(word)}
              </span>
            ))}
          </div>

          <div className="flex gap-2 max-w-md mx-auto">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type the next word..."
              autoComplete="off"
              autoCapitalize="off"
              className={`flex-1 h-10 rounded-md border bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm transition-colors ${
                inputFlash === "correct"
                  ? "border-green-500 ring-2 ring-green-500/30"
                  : inputFlash === "wrong"
                  ? "border-destructive ring-2 ring-destructive/30"
                  : "border-input"
              }`}
            />
            <Button onClick={handleSubmitWord} size="sm" className="bg-primary hover:bg-primary/90">
              Enter
            </Button>
          </div>

          <AnimatePresence>
            {feedbackMsg && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center text-sm text-muted-foreground mt-3 italic"
              >
                "{feedbackMsg}"
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Win Screen */}
      {gameState === "win" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <Trophy className="mx-auto mb-4 text-yellow-500" size={48} />
          <h2 className="font-serif text-2xl mb-2">Product Launched!</h2>
          <p className="text-muted-foreground mb-1">(Only 2 months late)</p>
          <p className="text-lg font-serif mt-4 mb-1">Your new title:</p>
          <p className="text-xl font-bold text-primary mb-4">
            {getPromotionTitle(totalMisses)}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Total misses: {totalMisses}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={startGame} className="bg-primary hover:bg-primary/90">
              Play Again
            </Button>
            <Button onClick={onBack} variant="outline">
              Back to Games
            </Button>
          </div>
        </motion.div>
      )}

      {/* Game Over */}
      {gameState === "gameover" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <h2 className="font-serif text-2xl mb-2">The Jargon Won</h2>
          <p className="text-muted-foreground mb-1">
            You needed {level.requiredCorrect} correct but only got {levelCorrect} on Level {currentLevel + 1}.
          </p>
          <p className="text-sm text-muted-foreground mt-2 mb-6 italic">
            "Let's circle back in the next sprint."
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={startGame} className="bg-primary hover:bg-primary/90">
              Try Again
            </Button>
            <Button onClick={onBack} variant="outline">
              Back to Games
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ScopeCreepSurvivor;
