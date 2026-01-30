
# Sprint Blackjack - Enhanced Product Management Themed Card Game

## Overview
A PM-themed Blackjack mini-game where players use "Stakeholder Confidence" as currency to bet on sprints, playing against "The Deadline" (dealer). Cards are styled as Jira tickets, and all terminology is re-skinned with product management jargon.

## Game Concept

The player starts with 100 Stakeholder Confidence points and must work their way up to 1,000 to win (mastering the roadmap). Going to 0 means losing all stakeholder trust.

### PM Terminology Mapping
| Blackjack Term | PM Term |
|----------------|---------|
| Currency/Chips | Stakeholder Confidence |
| Dealer | The Deadline |
| Player | The Product Manager |
| Hand Value | Velocity |
| Hit | Iterate |
| Stand | Ship It! (with rocket icon) |
| Double Down | All-In on this Feature |
| Bust | SCOPE CREEP! |
| Blackjack (21) | THE UNICORN! |

---

## Enhanced Features (Your Recommended Improvements)

### 1. Double Down Mechanic - "All-In on this Feature"
- Available only on initial hand (2 cards)
- Player doubles their current bet
- Receives exactly one more card, then automatically stands
- Button appears alongside "Iterate" and "Ship It!" during initial deal only
- Disabled if player doesn't have enough confidence to double

### 2. Persistent Statistics via localStorage
- **Best Streak**: Consecutive wins in a row
- **Highest Confidence**: Peak confidence ever reached
- **Total Sprints Played**: Cumulative rounds played
- Stats displayed subtly on the betting screen
- Uses same pattern as Sprint Runner's `HIGH_SCORE_KEY` storage

### 3. PM-Themed Card IDs
Cards display ticket-style IDs based on their value:

| Card Value | Ticket ID Pattern | Theme |
|------------|------------------|-------|
| Ace | `EPIC-1` | Epics are flexible (1 or 11) |
| 2-4 | `BUG-{value}` | Low-value bug fixes |
| 5-7 | `TASK-{value}` | Standard tasks |
| 8-10 | `STORY-{value}` | User stories |
| Jack | `SPIKE-J` | Technical investigation |
| Queen | `FEATURE-Q` | Feature work |
| King | `FEATURE-K` | Feature work |

### 4. Audio Integration (Matching Sprint Runner)
Reuse the existing `getAudioContext()` and `createBeep()` system:

| Action | Sound |
|--------|-------|
| Card Deal | Quick click (440Hz, 0.05s) |
| Iterate (Hit) | Rising tone (500Hz, 0.08s) |
| Ship It (Stand) | Whoosh (600-800Hz sweep) |
| Win Round | Victory arpeggio (C5-E5-G5) |
| Lose Round | Descending tones (400-300-200Hz) |
| Blackjack/Unicorn | Special fanfare (C5-E5-G5-C6) |
| Game Won | Win sound + confetti |
| Bust/Scope Creep | Low thud (200Hz, 0.2s) |

### 5. First-Play Tutorial Overlay
- Shows on first visit (tracked via localStorage)
- Explains the PM terminology mapping
- Semi-transparent overlay with the key terms
- "Got it!" button to dismiss
- Auto-dismisses after 5 seconds

---

## Architecture

### New Files
```text
src/pages/SprintBlackjack.tsx       - Main game page (direct URL only)
src/components/games/BlackjackGame.tsx - Reusable game container component
```

### Route Setup
- Add `/sprint-blackjack` route to `App.tsx`
- NOT added to Header navigation (direct URL access only for now)

---

## Visual Design

### Card Design (Jira Ticket Style)
Cards styled as minimalist Jira tickets with the site's color palette:

```text
+-------------------+
| EPIC-1       [hearts]  |
|                   |
|         A         |
|      (large)      |
|                   |
| Story Points: 11  |
+-------------------+
```

- **Coral accent** for hearts/diamonds
- **Charcoal** for spades/clubs
- **Face-down cards** show a "BACKLOG" pattern
- Rounded corners matching site aesthetic
- Subtle shadow for depth

### Responsive Layout
- Full-width container on mobile
- Card sizes scale proportionally (same aspect-ratio approach as Sprint Runner)
- Touch-friendly button sizing (min 44px tap targets)
- Stacked layout for hands on smaller screens
- Container matches Sprint Runner dimensions (640x300 aspect ratio)

---

## Game Phases

### Phase A: Sprint Planning (Betting)
Three betting buttons styled as sprint commitment levels:

| Button | Bet Amount | Label |
|--------|------------|-------|
| Quick Fixes | 10 | "Safe and Steady" |
| New Feature | 25 | "Standard Velocity" |
| Moonshot | 50 | "High Risk, High Reward" |

Stats display (after first game):
- Best Streak: X wins
- Peak Confidence: XXX

### Phase B: The Sprint (Playing)
- Deal 2 cards to player (face up)
- Deal 2 cards to dealer (1 face up, 1 face down)
- Show action buttons:
  - "Iterate" (Hit)
  - "Ship It!" with rocket icon (Stand)
  - "All-In on this Feature" (Double Down) - only on initial hand
- Display current Velocity (hand value)
- Confidence score in top-right corner

### Phase C: Retrospective (Round End)
- Reveal dealer's hidden card with animation
- Dealer hits on 16 and below, stands on 17+
- Show outcome message:
  - **Win**: "The stakeholders are happy! Confidence increased."
  - **Lose**: "You missed the deadline. Trust eroded."
  - **Push/Tie**: "The sprint ended in a standoff. Confidence returned."
  - **Blackjack**: "THE UNICORN! Double confidence!"
  - **Bust**: "SCOPE CREEP! You overcommitted."
- "Plan Next Sprint" button to restart

---

## Win/Loss Conditions

### Game Over (Lose) - 0 Confidence
- Message: "Your stakeholder confidence has evaporated."
- Show final stats (sprints played, best streak)
- Buttons:
  - "Try Again" (secondary) - restarts with 100 confidence
  - "Contact Dale" (primary) - links to /contact

### Game Won - 1,000 Confidence
- Message: "You mastered the roadmap. Time to update your LinkedIn."
- Confetti animation (same as Sprint Runner, reusing `triggerConfetti`)
- Show achievement stats
- Buttons:
  - "Play Again" (secondary) - restarts with 100 confidence
  - "Contact Dale" (primary) - links to /contact

---

## Technical Details

### State Management
```typescript
type GamePhase = "betting" | "playing" | "retrospective" | "gameOver" | "gameWon";

interface Card {
  suit: 'spades' | 'hearts' | 'diamonds' | 'clubs';
  value: string; // 'A', '2'-'10', 'J', 'Q', 'K'
  numericValue: number;
  ticketId: string; // e.g., 'EPIC-1', 'BUG-3', 'FEATURE-K'
}

interface GameState {
  phase: GamePhase;
  confidence: number;
  currentBet: number;
  playerHand: Card[];
  dealerHand: Card[];
  deck: Card[];
  message: string;
  hasDoubledDown: boolean;
}

interface GameStats {
  bestStreak: number;
  currentStreak: number;
  highestConfidence: number;
  totalSprints: number;
}
```

### Deck Management
- Standard 52-card deck, shuffled using Fisher-Yates algorithm
- Re-shuffle when deck runs low (less than 15 cards)
- Ace handling: automatically counts as 11 unless it would bust, then counts as 1

### localStorage Keys
```typescript
const BLACKJACK_STATS_KEY = 'sprintBlackjackStats';
const BLACKJACK_TUTORIAL_KEY = 'sprintBlackjackTutorialSeen';
```

---

## UI Layout

```text
+----------------------------------------+
|    Stakeholder Confidence: 100    [?]  |
+----------------------------------------+
|                                        |
|  THE DEADLINE                          |
|  Velocity: ??                          |
|  [Card] [????]                         |
|                                        |
+----------------------------------------+
|                                        |
|  THE PRODUCT MANAGER                   |
|  Velocity: 18                          |
|  [Card] [Card]                         |
|                                        |
|  [Iterate] [Ship It!] [All-In]        |
|                                        |
+----------------------------------------+
```

---

## Animation Details
- Card deal: Slide in from right with slight rotation
- Card flip (dealer reveal): 3D flip animation using Framer Motion
- Button hover: Subtle scale and shadow
- Win/Loss: Fade overlay with message
- Confetti: Reuse Sprint Runner's confetti implementation

---

## Implementation Order
1. Create the route and basic page structure
2. Implement deck and card logic with ticket IDs
3. Build card visual components (Jira ticket style)
4. Create betting phase UI with stats display
5. Implement playing phase with hit/stand/double down
6. Add dealer AI logic (hit on 16, stand on 17)
7. Build retrospective phase with animations
8. Add audio integration using existing sound system
9. Implement persistent stats with localStorage
10. Add first-play tutorial overlay
11. Add win/loss conditions with confetti
12. Polish animations and responsive design
13. Test on mobile devices

---

## Future Scope (Deferred)
These features are intentionally left for a future version:
- **Split** ("Fork the Backlog") - Complex UI for managing two hands
- **Insurance** ("Hedge Your Roadmap") - Adds betting complexity
- **Multiple decks** - Not needed for casual play
