import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Keyboard } from "lucide-react";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";

// ── Types ──────────────────────────────────────────────────────────────
interface AcronymEntry {
  acronym: string;
  definition: string[];
}

interface Level {
  name: string;
  entries: AcronymEntry[];
  requiredCorrect: number;
}

type GameState = "start" | "levelIntro" | "playing" | "win" | "gameover";

// ── Data ───────────────────────────────────────────────────────────────
const LEVELS: Level[] = [
  {
    name: "The Junior PM",
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
    name: "The Data-Driven PM",
    requiredCorrect: 5,
    entries: [
      { acronym: "KPI", definition: ["Key", "Performance", "Indicator"] },
      { acronym: "OKR", definition: ["Objectives", "and", "Key", "Results"] },
      { acronym: "MAU", definition: ["Monthly", "Active", "Users"] },
      { acronym: "DAU", definition: ["Daily", "Active", "Users"] },
      { acronym: "NPS", definition: ["Net", "Promoter", "Score"] },
      { acronym: "CTR", definition: ["Click", "-", "Through", "Rate"] },
      { acronym: "LTV", definition: ["Lifetime", "Value"] },
      { acronym: "CAC", definition: ["Customer", "Acquisition", "Cost"] },
    ],
  },
  {
    name: "The Agile Master",
    requiredCorrect: 5,
    entries: [
      { acronym: "RICE", definition: ["Reach,", "Impact,", "Confidence,", "Effort"] },
      { acronym: "GTM", definition: ["Go", "-", "To", "-", "Market"] },
      { acronym: "MoSCoW", definition: ["Must", "Should", "Could", "Won't"] },
      { acronym: "B2B", definition: ["Business", "to", "Business"] },
      { acronym: "B2C", definition: ["Business", "to", "Consumer"] },
      { acronym: "API", definition: ["Application", "Programming", "Interface"] },
      { acronym: "SDK", definition: ["Software", "Development", "Kit"] },
    ],
  },
  {
    name: "The Product Leader",
    requiredCorrect: 5,
    entries: [
      { acronym: "TAM", definition: ["Total", "Addressable", "Market"] },
      { acronym: "PLG", definition: ["Product", "-", "Led", "Growth"] },
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
  const [inputValue, setInputValue] = useState("");
  const [inputFlash, setInputFlash] = useState<"none" | "correct" | "wrong">("none");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [totalMisses, setTotalMisses] = useState(0);
  const [levelCorrect, setLevelCorrect] = useState(0);
  const [levelMisses, setLevelMisses] = useState(0);
  const [highScore, setHighScore] = useState<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      try { fn(getAudioCtx()); } catch {}
    },
    [getAudioCtx]
  );

  const advanceEntry = useCallback((wasCorrect: boolean, newCorrect: number, newMisses: number, newTotalMisses: number, lvlIdx: number, entryIdx: number) => {
    const nextIdx = entryIdx + 1;
    const lvl = LEVELS[lvlIdx];

    if (nextIdx >= lvl.entries.length) {
      if (newCorrect >= lvl.requiredCorrect) {
        if (lvlIdx + 1 >= LEVELS.length) {
          const prev = localStorage.getItem("decipherHighScore");
          const prevBest = prev ? parseInt(prev, 10) : Infinity;
          if (newTotalMisses < prevBest) {
            localStorage.setItem("decipherHighScore", newTotalMisses.toString());
            setHighScore(newTotalMisses);
          }
          playSound(playVictoryFanfare);
          confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
          setGameState("win");
        } else {
          playSound(playLevelComplete);
          setCurrentLevel(lvlIdx + 1);
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
      const nextEntry = lvl.entries[nextIdx];
      const initialRevealed = new Array(nextEntry.definition.length).fill(false);
      let idx = 0;
      while (idx < nextEntry.definition.length && nextEntry.definition[idx] === "-") {
        initialRevealed[idx] = true;
        idx++;
      }
      setCurrentEntryIndex(nextIdx);
      setWordIndex(idx);
      setRevealedWords(initialRevealed);
      setInputValue("");
      setFeedbackMsg("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [playSound]);

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

  const startLevel = useCallback(() => {
    const e = LEVELS[currentLevel].entries[0];
    const initialRevealed = new Array(e.definition.length).fill(false);
    // Skip leading hyphens
    let idx = 0;
    while (idx < e.definition.length && e.definition[idx] === "-") {
      initialRevealed[idx] = true;
      idx++;
    }
    setRevealedWords(initialRevealed);
    setWordIndex(idx);
    setInputValue("");
    setFeedbackMsg("");
    setCurrentEntryIndex(0);
    setGameState("playing");
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [currentLevel]);

  // Enter key on level intro
  useEffect(() => {
    if (gameState !== "levelIntro") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        startLevel();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gameState, startLevel]);

  // Auto-skip hyphens helper: advances wordIndex past any "-" entries
  const skipHyphens = useCallback((currentWordIdx: number, currentRevealed: boolean[], def: string[]) => {
    let idx = currentWordIdx;
    const revealed = [...currentRevealed];
    while (idx < def.length && def[idx] === "-") {
      revealed[idx] = true;
      idx++;
    }
    return { newWordIndex: idx, newRevealed: revealed };
  }, []);

  const handleSubmitWord = () => {
    if (!entry || gameState !== "playing") return;
    const typed = inputValue.trim();
    if (!typed) return;

    const expected = entry.definition[wordIndex];
    const normalize = (s: string) => s.replace(/[,.:;!?']/g, "").toLowerCase();
    const SPELLING_VARIANTS: Record<string, string[]> = {
      amortization: ["amortisation"],
      "won't": ["wont"],
    };

    const normalizedExpected = normalize(expected);
    const normalizedTyped = normalize(typed);
    const variants = SPELLING_VARIANTS[normalizedExpected] || [];
    const isCorrect = normalizedTyped === normalizedExpected || variants.includes(normalizedTyped);

    if (isCorrect) {
      const newRevealed = [...revealedWords];
      newRevealed[wordIndex] = true;
      setInputValue("");
      setInputFlash("correct");
      setTimeout(() => setInputFlash("none"), 300);

      const nextRaw = wordIndex + 1;
      const { newWordIndex, newRevealed: skippedRevealed } = skipHyphens(nextRaw, newRevealed, entry.definition);
      setRevealedWords(skippedRevealed);

      if (newWordIndex >= entry.definition.length) {
        // Full acronym correct
        const newCorrect = levelCorrect + 1;
        setLevelCorrect(newCorrect);
        setFeedbackMsg(randomPick(CORRECT_MESSAGES));
        playSound(playFullCorrect);
        setTimeout(() => advanceEntry(true, newCorrect, levelMisses, totalMisses, currentLevel, currentEntryIndex), 1000);
      } else {
        setWordIndex(newWordIndex);
        playSound(playCorrectWord);
      }
    } else {
      // Wrong answer — count as miss, advance to next acronym
      setInputValue("");
      setInputFlash("wrong");
      playSound(playWrong);
      const newMisses = levelMisses + 1;
      const newTotalMisses = totalMisses + 1;
      setLevelMisses(newMisses);
      setTotalMisses(newTotalMisses);
      setFeedbackMsg(randomPick(INCORRECT_MESSAGES));
      setTimeout(() => {
        setInputFlash("none");
        advanceEntry(false, levelCorrect, newMisses, newTotalMisses, currentLevel, currentEntryIndex);
      }, 1200);
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
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Games
        </button>
        {highScore !== null && (
          <span className="text-xs text-muted-foreground">
            Best: {highScore} miss{highScore !== 1 ? "es" : ""}
          </span>
        )}
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
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Your stakeholders are speaking in riddles. Decode the acronyms to keep the project on track and secure your seat at the table.
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
          <h2 className="font-serif text-2xl mb-4">{level.name}</h2>
          <p className="text-xs text-muted-foreground mb-6">
            {currentLevel === 3
              ? `Get ${level.requiredCorrect} of ${level.entries.length} correct to gain promotion!`
              : `Get ${level.requiredCorrect} of ${level.entries.length} correct to advance`}
          </p>
          <Button onClick={startLevel} className="bg-primary hover:bg-primary/90">
            Ready
          </Button>
        </motion.div>
      )}

      {/* Playing */}
      {gameState === "playing" && entry && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <span>Level {currentLevel + 1}: {level.name}</span>
            <span>
              Acronym {currentEntryIndex + 1}/{level.entries.length} · ✓ {levelCorrect} · ✗ {levelMisses}
            </span>
          </div>

          <div className="border border-border rounded-xl bg-background p-8 md:p-12 text-center">
            <div
              className="font-serif font-bold text-5xl md:text-6xl mb-8 select-none"
              style={{
                color: "hsl(var(--primary))",
                textShadow: "0 2px 12px hsl(var(--primary) / 0.3)",
              }}
            >
              {entry.acronym}
            </div>

            <div className="flex flex-wrap gap-1 justify-center mb-6 min-h-[2rem] items-center">
              {entry.definition.map((word, i) => (
                word === "-" ? (
                  <span key={i} className="text-muted-foreground font-mono text-sm">-</span>
                ) : (
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
                )
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
          <h2 className="font-serif text-2xl md:text-3xl font-medium mb-2">You have been promoted!</h2>
          <p className="text-lg font-serif mt-4 mb-1">Your new title:</p>
          <p className="text-xl font-bold text-primary mb-6">
            {getPromotionTitle(totalMisses)}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={startGame} variant="outline">
              Play Again
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link to="/contact">Contact Dale</Link>
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
          <p className="text-sm text-muted-foreground mt-2 mb-6 italic">
            "Let's circle back in the next sprint."
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={startGame} variant="outline">
              Play Again
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link to="/contact">Contact Dale</Link>
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ScopeCreepSurvivor;
