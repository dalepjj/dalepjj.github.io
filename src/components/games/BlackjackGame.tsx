import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Rocket, HelpCircle, X } from "lucide-react";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";

// Types
type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
type GamePhase = "betting" | "playing" | "retrospective" | "gameOver" | "gameWon";

interface Card {
  suit: Suit;
  value: string;
  numericValue: number;
  ticketId: string;
}

interface GameStats {
  bestStreak: number;
  currentStreak: number;
  highestConfidence: number;
  totalSprints: number;
}

// Constants
const INITIAL_CONFIDENCE = 100;
const WIN_CONFIDENCE = 1000;
const BLACKJACK_STATS_KEY = 'sprintBlackjackStats';
const BLACKJACK_TUTORIAL_KEY = 'sprintBlackjackTutorialSeen';

// Persistent audio context
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

// Sound effects
const playDealSound = () => createBeep(440, 0.05, 0.08);
const playIterateSound = () => createBeep(500, 0.08, 0.08);
const playShipItSound = () => {
  createBeep(600, 0.06, 0.08);
  setTimeout(() => createBeep(800, 0.08, 0.08), 50);
};
const playWinSound = () => {
  createBeep(523, 0.12, 0.1);
  setTimeout(() => createBeep(659, 0.12, 0.1), 100);
  setTimeout(() => createBeep(784, 0.12, 0.1), 200);
};
const playLoseSound = () => {
  createBeep(400, 0.15, 0.1);
  setTimeout(() => createBeep(300, 0.15, 0.1), 150);
  setTimeout(() => createBeep(200, 0.2, 0.08), 300);
};
const playUnicornSound = () => {
  createBeep(523, 0.1, 0.1);
  setTimeout(() => createBeep(659, 0.1, 0.1), 80);
  setTimeout(() => createBeep(784, 0.1, 0.1), 160);
  setTimeout(() => createBeep(1047, 0.25, 0.12), 240);
};
const playBustSound = () => createBeep(200, 0.2, 0.1);

// Helper functions
const getTicketId = (value: string): string => {
  if (value === 'A') return 'EPIC-1';
  const num = parseInt(value);
  if (num >= 2 && num <= 4) return `BUG-${num}`;
  if (num >= 5 && num <= 7) return `TASK-${num}`;
  if (num >= 8 && num <= 10) return `STORY-${num}`;
  if (value === 'J') return 'SPIKE-J';
  if (value === 'Q') return 'FEATURE-Q';
  if (value === 'K') return 'FEATURE-K';
  return `TICKET-${value}`;
};

const createDeck = (): Card[] => {
  const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const value of values) {
      let numericValue: number;
      if (value === 'A') numericValue = 11;
      else if (['J', 'Q', 'K'].includes(value)) numericValue = 10;
      else numericValue = parseInt(value);

      deck.push({
        suit,
        value,
        numericValue,
        ticketId: getTicketId(value)
      });
    }
  }
  return deck;
};

const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const calculateHandValue = (hand: Card[]): number => {
  let value = 0;
  let aces = 0;

  for (const card of hand) {
    if (card.value === 'A') {
      aces++;
      value += 11;
    } else {
      value += card.numericValue;
    }
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
};

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

// Card Component
const PlayingCard = ({ 
  card, 
  faceDown = false, 
  index = 0,
  isDealing = false
}: { 
  card: Card; 
  faceDown?: boolean;
  index?: number;
  isDealing?: boolean;
}) => {
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const suitSymbol = {
    spades: '♠',
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣'
  }[card.suit];

  return (
    <motion.div
      initial={isDealing ? { x: 100, opacity: 0, rotateY: faceDown ? 180 : 0 } : false}
      animate={{ x: 0, opacity: 1, rotateY: faceDown ? 180 : 0 }}
      transition={{ delay: index * 0.15, duration: 0.3 }}
      className="relative w-16 h-24 sm:w-20 sm:h-28 perspective-1000"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Card Front */}
      <div 
        className={`absolute inset-0 rounded-lg border-2 bg-card shadow-md flex flex-col justify-between p-1.5 sm:p-2 backface-hidden ${
          faceDown ? 'invisible' : ''
        }`}
        style={{ 
          borderColor: isRed ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
          backfaceVisibility: 'hidden'
        }}
      >
        <div className="flex justify-between items-start text-xs">
          <span className="font-mono text-[10px] sm:text-xs text-muted-foreground truncate max-w-[70%]">
            {card.ticketId}
          </span>
          <span className={isRed ? 'text-primary' : 'text-foreground'}>
            {suitSymbol}
          </span>
        </div>
        <div className={`text-2xl sm:text-3xl font-bold text-center ${isRed ? 'text-primary' : 'text-foreground'}`}>
          {card.value}
        </div>
        <div className="text-[10px] sm:text-xs text-muted-foreground text-center">
          {card.numericValue === 11 ? '1 or 11' : card.numericValue} pts
        </div>
      </div>

      {/* Card Back */}
      <div 
        className={`absolute inset-0 rounded-lg border-2 border-muted bg-muted shadow-md flex items-center justify-center backface-hidden ${
          faceDown ? '' : 'invisible'
        }`}
        style={{ 
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)'
        }}
      >
        <div className="text-[10px] sm:text-xs font-mono text-muted-foreground text-center px-1">
          BACKLOG
        </div>
      </div>
    </motion.div>
  );
};

// Tutorial Overlay
const TutorialOverlay = ({ onDismiss }: { onDismiss: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-background/95 z-50 flex items-center justify-center p-4 rounded-xl"
    >
      <div className="text-center max-w-sm">
        <h3 className="text-xl font-serif font-semibold mb-4">Welcome to Sprint Blackjack!</h3>
        <div className="text-sm text-muted-foreground space-y-2 mb-6">
          <p><strong className="text-foreground">You</strong> = The Product Manager</p>
          <p><strong className="text-foreground">Dealer</strong> = The Deadline</p>
          <p><strong className="text-foreground">Hand Value</strong> = Your Velocity</p>
          <p><strong className="text-foreground">Hit 21</strong> = THE UNICORN! 🦄</p>
          <p><strong className="text-foreground">Over 21</strong> = SCOPE CREEP! 💥</p>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Reach 1,000 Stakeholder Confidence to win!
        </p>
        <Button onClick={onDismiss} size="sm">Got it!</Button>
      </div>
    </motion.div>
  );
};

// Main Game Component
const BlackjackGame = () => {
  const [phase, setPhase] = useState<GamePhase>("betting");
  const [confidence, setConfidence] = useState(INITIAL_CONFIDENCE);
  const [currentBet, setCurrentBet] = useState(0);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>(() => shuffleDeck(createDeck()));
  const [message, setMessage] = useState("");
  const [hasDoubledDown, setHasDoubledDown] = useState(false);
  const [showDealerCard, setShowDealerCard] = useState(false);
  const [isDealing, setIsDealing] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [stats, setStats] = useState<GameStats>({
    bestStreak: 0,
    currentStreak: 0,
    highestConfidence: INITIAL_CONFIDENCE,
    totalSprints: 0
  });

  // Load stats and tutorial state
  useEffect(() => {
    const savedStats = localStorage.getItem(BLACKJACK_STATS_KEY);
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
    
    const tutorialSeen = localStorage.getItem(BLACKJACK_TUTORIAL_KEY);
    if (!tutorialSeen) {
      setShowTutorial(true);
    }
  }, []);

  // Save stats
  const saveStats = useCallback((newStats: GameStats) => {
    setStats(newStats);
    localStorage.setItem(BLACKJACK_STATS_KEY, JSON.stringify(newStats));
  }, []);

  // Dismiss tutorial
  const dismissTutorial = useCallback(() => {
    setShowTutorial(false);
    localStorage.setItem(BLACKJACK_TUTORIAL_KEY, 'true');
  }, []);

  // Draw a card from the deck
  const drawCard = useCallback((): Card => {
    let currentDeck = deck;
    if (currentDeck.length < 15) {
      currentDeck = shuffleDeck(createDeck());
    }
    const card = currentDeck[0];
    setDeck(currentDeck.slice(1));
    return card;
  }, [deck]);

  // Place bet and start dealing
  const placeBet = useCallback((amount: number) => {
    if (amount > confidence) return;
    
    setCurrentBet(amount);
    setIsDealing(true);
    setHasDoubledDown(false);
    setShowDealerCard(false);

    // Deal cards with delays for animation
    const playerCard1 = drawCard();
    const dealerCard1 = drawCard();
    const playerCard2 = drawCard();
    const dealerCard2 = drawCard();

    setTimeout(() => {
      playDealSound();
      setPlayerHand([playerCard1]);
    }, 100);

    setTimeout(() => {
      playDealSound();
      setDealerHand([dealerCard1]);
    }, 250);

    setTimeout(() => {
      playDealSound();
      setPlayerHand([playerCard1, playerCard2]);
    }, 400);

    setTimeout(() => {
      playDealSound();
      setDealerHand([dealerCard1, dealerCard2]);
      setIsDealing(false);
      setPhase("playing");

      // Check for blackjack
      const playerValue = calculateHandValue([playerCard1, playerCard2]);
      if (playerValue === 21) {
        setTimeout(() => handleBlackjack(), 300);
      }
    }, 550);
  }, [confidence, drawCard]);

  // Handle player getting blackjack
  const handleBlackjack = useCallback(() => {
    playUnicornSound();
    setShowDealerCard(true);
    setMessage("THE UNICORN! 🦄 Double confidence!");
    
    const winnings = currentBet * 2;
    const newConfidence = confidence + winnings;
    setConfidence(newConfidence);

    const newStats = {
      ...stats,
      currentStreak: stats.currentStreak + 1,
      bestStreak: Math.max(stats.bestStreak, stats.currentStreak + 1),
      highestConfidence: Math.max(stats.highestConfidence, newConfidence),
      totalSprints: stats.totalSprints + 1
    };
    saveStats(newStats);

    if (newConfidence >= WIN_CONFIDENCE) {
      setTimeout(() => {
        triggerConfetti();
        setPhase("gameWon");
      }, 500);
    } else {
      setPhase("retrospective");
    }
  }, [currentBet, confidence, stats, saveStats]);

  // Iterate (Hit)
  const iterate = useCallback(() => {
    if (phase !== "playing") return;
    
    playIterateSound();
    const newCard = drawCard();
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);

    const value = calculateHandValue(newHand);
    if (value > 21) {
      setTimeout(() => handleBust(), 300);
    } else if (hasDoubledDown) {
      setTimeout(() => shipIt(), 300);
    }
  }, [phase, playerHand, drawCard, hasDoubledDown]);

  // Ship It (Stand)
  const shipIt = useCallback(() => {
    if (phase !== "playing") return;
    
    playShipItSound();
    setShowDealerCard(true);
    
    // Dealer plays
    let currentDealerHand = [...dealerHand];
    
    const dealerPlay = () => {
      const dealerValue = calculateHandValue(currentDealerHand);
      
      if (dealerValue < 17) {
        setTimeout(() => {
          playDealSound();
          const newCard = drawCard();
          currentDealerHand = [...currentDealerHand, newCard];
          setDealerHand(currentDealerHand);
          dealerPlay();
        }, 500);
      } else {
        setTimeout(() => resolveRound(currentDealerHand), 500);
      }
    };

    setTimeout(dealerPlay, 300);
  }, [phase, dealerHand, drawCard]);

  // Double Down
  const doubleDown = useCallback(() => {
    if (phase !== "playing" || playerHand.length !== 2) return;
    if (confidence < currentBet) return;

    setConfidence(prev => prev - currentBet);
    setCurrentBet(prev => prev * 2);
    setHasDoubledDown(true);
    iterate();
  }, [phase, playerHand.length, confidence, currentBet, iterate]);

  // Handle bust
  const handleBust = useCallback(() => {
    playBustSound();
    setMessage("SCOPE CREEP! 💥 You overcommitted.");
    setShowDealerCard(true);
    
    const newConfidence = confidence - currentBet;
    setConfidence(newConfidence);

    const newStats = {
      ...stats,
      currentStreak: 0,
      totalSprints: stats.totalSprints + 1
    };
    saveStats(newStats);

    if (newConfidence <= 0) {
      setPhase("gameOver");
    } else {
      setPhase("retrospective");
    }
  }, [confidence, currentBet, stats, saveStats]);

  // Resolve round after dealer plays
  const resolveRound = useCallback((finalDealerHand: Card[]) => {
    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(finalDealerHand);
    
    let newConfidence = confidence;
    let won = false;
    let push = false;

    if (dealerValue > 21) {
      playWinSound();
      setMessage("The Deadline crumbled! Stakeholders rejoice! 🎉");
      newConfidence = confidence + currentBet;
      won = true;
    } else if (playerValue > dealerValue) {
      playWinSound();
      setMessage("The stakeholders are happy! Confidence increased. 📈");
      newConfidence = confidence + currentBet;
      won = true;
    } else if (playerValue < dealerValue) {
      playLoseSound();
      setMessage("You missed the deadline. Trust eroded. 📉");
      newConfidence = confidence - currentBet;
    } else {
      setMessage("The sprint ended in a standoff. Confidence returned. 🤝");
      push = true;
    }

    setConfidence(newConfidence);

    const newStats = {
      ...stats,
      currentStreak: won ? stats.currentStreak + 1 : 0,
      bestStreak: won ? Math.max(stats.bestStreak, stats.currentStreak + 1) : stats.bestStreak,
      highestConfidence: Math.max(stats.highestConfidence, newConfidence),
      totalSprints: stats.totalSprints + 1
    };
    saveStats(newStats);

    if (newConfidence >= WIN_CONFIDENCE) {
      triggerConfetti();
      setPhase("gameWon");
    } else if (newConfidence <= 0) {
      setPhase("gameOver");
    } else {
      setPhase("retrospective");
    }
  }, [playerHand, confidence, currentBet, stats, saveStats]);

  // Start new sprint
  const planNextSprint = useCallback(() => {
    setPlayerHand([]);
    setDealerHand([]);
    setCurrentBet(0);
    setMessage("");
    setShowDealerCard(false);
    setHasDoubledDown(false);
    setPhase("betting");
  }, []);

  // Restart game
  const restartGame = useCallback(() => {
    setConfidence(INITIAL_CONFIDENCE);
    setDeck(shuffleDeck(createDeck()));
    const newStats = { ...stats, currentStreak: 0 };
    saveStats(newStats);
    planNextSprint();
  }, [stats, saveStats, planNextSprint]);

  const playerValue = calculateHandValue(playerHand);
  const dealerValue = calculateHandValue(dealerHand);
  const canDoubleDown = phase === "playing" && playerHand.length === 2 && confidence >= currentBet && !hasDoubledDown;

  return (
    <div className="relative w-full max-w-2xl mx-auto bg-card rounded-xl border shadow-lg overflow-hidden">
      {/* Tutorial Overlay */}
      <AnimatePresence>
        {showTutorial && <TutorialOverlay onDismiss={dismissTutorial} />}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground">Stakeholder Confidence:</span>
          <span className="font-bold text-lg sm:text-xl">{confidence}</span>
        </div>
        <button
          onClick={() => setShowTutorial(true)}
          className="p-1.5 rounded-full hover:bg-muted transition-colors"
          aria-label="Show tutorial"
        >
          <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Game Area */}
      <div className="p-4 sm:p-6 min-h-[400px] flex flex-col">
        {/* Betting Phase */}
        <AnimatePresence mode="wait">
          {phase === "betting" && (
            <motion.div
              key="betting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col items-center justify-center gap-6"
            >
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-serif font-semibold mb-2">Sprint Planning</h2>
                <p className="text-sm text-muted-foreground">Choose your commitment level</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                <Button
                  onClick={() => placeBet(10)}
                  disabled={confidence < 10}
                  variant="outline"
                  className="flex-1 h-auto py-3 flex flex-col"
                >
                  <span className="font-semibold">Quick Fixes</span>
                  <span className="text-xs text-muted-foreground">10 • Safe & Steady</span>
                </Button>
                <Button
                  onClick={() => placeBet(25)}
                  disabled={confidence < 25}
                  variant="outline"
                  className="flex-1 h-auto py-3 flex flex-col"
                >
                  <span className="font-semibold">New Feature</span>
                  <span className="text-xs text-muted-foreground">25 • Standard Velocity</span>
                </Button>
                <Button
                  onClick={() => placeBet(50)}
                  disabled={confidence < 50}
                  variant="outline"
                  className="flex-1 h-auto py-3 flex flex-col"
                >
                  <span className="font-semibold">Moonshot</span>
                  <span className="text-xs text-muted-foreground">50 • High Risk</span>
                </Button>
              </div>

              {stats.totalSprints > 0 && (
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Best Streak: {stats.bestStreak}</span>
                  <span>Peak: {stats.highestConfidence}</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Playing Phase */}
          {phase === "playing" && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col gap-4"
            >
              {/* Dealer Hand */}
              <div className="text-center">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">THE DEADLINE</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Velocity: {showDealerCard ? dealerValue : '??'}
                </p>
                <div className="flex justify-center gap-2">
                  {dealerHand.map((card, i) => (
                    <PlayingCard 
                      key={`${card.suit}-${card.value}-${i}`} 
                      card={card} 
                      faceDown={i === 1 && !showDealerCard}
                      index={i}
                      isDealing={isDealing}
                    />
                  ))}
                </div>
              </div>

              <div className="border-t my-2" />

              {/* Player Hand */}
              <div className="text-center">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">THE PRODUCT MANAGER</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Velocity: <span className={playerValue > 21 ? 'text-destructive' : ''}>{playerValue}</span>
                </p>
                <div className="flex justify-center gap-2 flex-wrap">
                  {playerHand.map((card, i) => (
                    <PlayingCard 
                      key={`${card.suit}-${card.value}-${i}`} 
                      card={card}
                      index={i}
                      isDealing={isDealing && i < 2}
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-2 mt-auto pt-4">
                <Button onClick={iterate} variant="outline" disabled={isDealing}>
                  Iterate
                </Button>
                <Button onClick={shipIt} disabled={isDealing}>
                  <Rocket className="w-4 h-4 mr-1" />
                  Ship It!
                </Button>
                {canDoubleDown && (
                  <Button onClick={doubleDown} variant="secondary" disabled={isDealing}>
                    All-In
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* Retrospective Phase */}
          {phase === "retrospective" && (
            <motion.div
              key="retrospective"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-4"
            >
              {/* Show hands */}
              <div className="flex gap-8 mb-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">Deadline: {dealerValue}</p>
                  <div className="flex gap-1">
                    {dealerHand.map((card, i) => (
                      <PlayingCard key={`${card.suit}-${card.value}-${i}`} card={card} />
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">You: {playerValue}</p>
                  <div className="flex gap-1">
                    {playerHand.map((card, i) => (
                      <PlayingCard key={`${card.suit}-${card.value}-${i}`} card={card} />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-center text-lg font-medium">{message}</p>
              
              <Button onClick={planNextSprint} className="mt-4">
                Plan Next Sprint
              </Button>
            </motion.div>
          )}

          {/* Game Over */}
          {phase === "gameOver" && (
            <motion.div
              key="gameOver"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center gap-4 text-center"
            >
              <h2 className="text-2xl font-serif font-semibold">Game Over</h2>
              <p className="text-muted-foreground">Your stakeholder confidence has evaporated.</p>
              
              <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                <span>Sprints: {stats.totalSprints}</span>
                <span>Best Streak: {stats.bestStreak}</span>
              </div>

              <div className="flex gap-3 mt-4">
                <Button onClick={restartGame} variant="outline">Try Again</Button>
                <Button asChild>
                  <Link to="/contact">Contact Dale</Link>
                </Button>
              </div>
            </motion.div>
          )}

          {/* Game Won */}
          {phase === "gameWon" && (
            <motion.div
              key="gameWon"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center gap-4 text-center"
            >
              <h2 className="text-2xl font-serif font-semibold">🦄 You Won! 🦄</h2>
              <p className="text-muted-foreground">You mastered the roadmap. Time to update your LinkedIn.</p>
              
              <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                <span>Final Confidence: {confidence}</span>
                <span>Best Streak: {stats.bestStreak}</span>
              </div>

              <div className="flex gap-3 mt-4">
                <Button onClick={restartGame} variant="outline">Play Again</Button>
                <Button asChild>
                  <Link to="/contact">Contact Dale</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer with current bet */}
      {(phase === "playing" || phase === "retrospective") && currentBet > 0 && (
        <div className="border-t p-2 text-center text-xs text-muted-foreground bg-muted/30">
          Current Sprint: {currentBet} confidence at stake
        </div>
      )}
    </div>
  );
};

export default BlackjackGame;
