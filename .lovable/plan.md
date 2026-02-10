

# Replace "Scope Creep Survivor" with "The Decipher"

## Overview
Replace the bullet-hell game with a typing game where PM acronyms fall from the top of the screen and players must type out the full definition before they reach the bottom. The game selector hub and routing remain unchanged.

## Files Changed

**Replace:** `src/components/ScopeCreepSurvivor.tsx` -- completely rewritten as "The Decipher"

**Modify:** `src/pages/Play.tsx` -- update the second game card (title, description, icon) from "Scope Creep Survivor" to "The Decipher"

## Game Design

### Core Loop
- An acronym (e.g., "MVP") appears at the top of the 640x300 game area and falls downward at a steady pace
- Below the game area, the full definition is shown with blanks for missing words (e.g., "M______ V_____ P_______")
- The player types each word in sequence. A text input is focused and each word is checked on Space or Enter
- If all words are typed correctly before the acronym reaches the bottom, it counts as a success
- If the acronym hits the bottom, it counts as a miss

### Levels and Progression
The game has 4 levels. Each level presents all its acronyms one at a time. The player must complete a minimum number (e.g., 4 out of 6) to advance. Fall speed increases each level.

| Level | Title | Acronyms |
|---|---|---|
| 1 | The Basics ("Junior PM") | MVP, UX, UI, QA, PRD, SaaS |
| 2 | The Metrics ("Data-Driven") | KPI, OKR, MAU, DAU, NPS, CTR, LTV, CAC |
| 3 | Frameworks and Process ("Agile Master") | RICE, GTM, MoSCoW, B2B, B2C, API, SDK |
| 4 | The Deep Cuts ("Product Leader") | TAM, PLG, ARR, MRR, ARPU, SLA, EBITDA |

### Typing Mechanics
- Input is case-insensitive
- Each word of the definition is validated individually (typed one at a time, confirmed with Space/Enter)
- Correctly typed words are revealed in the hint display with a green highlight
- Wrong words trigger a brief red flash on the input and a witty "incorrect" message
- For multi-part words like "Go-To-Market", the player types each hyphenated segment as one word (i.e., "Go-To-Market" is one typed entry)

### Witty Feedback
Shown as a brief toast/label after each acronym attempt:

**Correct pool:**
- "Stakeholders are nodding!"
- "Engineering actually understood you!"
- "That's going in the release notes."
- "The board is impressed."
- "Ship it!"

**Incorrect pool:**
- "Let's take this offline."
- "Let's circle back in the next sprint."
- "We'll add it to the backlog."
- "Maybe we need a workshop for that."
- "Parking lot item."

### Win State and Promotion Titles
Completing all 4 levels triggers confetti and awards a title based on performance:

| Misses | Title |
|---|---|
| 0 | "Chief Acronym Officer" |
| 1-3 | "Senior Director of Alphabet Soup" |
| 4-6 | "VP of Verbose Phrases" |
| 7+ | "Junior Associate of Jargon" |

High score (fewest misses) saved to localStorage under `decipherHighScore`.

### Visual Design
- Falling acronym: large bold text descending smoothly from top to bottom
- Definition hint: word slots displayed below the game area, revealed as typed
- Level banner: shown at the start of each level with the level title (e.g., "Level 2: The Metrics")
- Progress indicator: shows "Acronym 3/6" within the current level
- Clean minimalist style matching Sprint Runner -- no canvas, uses DOM elements with framer-motion for the falling animation

### Audio
- Correct word: bright ascending beep (reuses AudioContext pattern)
- Full acronym correct: chord flourish
- Wrong word: low buzz
- Level complete: rising arpeggio
- Game over: descending tones
- Final win: victory fanfare with confetti

### Input
- **Desktop**: Auto-focused text input. Type and press Space/Enter to submit each word
- **Mobile**: Same text input with on-screen keyboard. The game area is compact enough to remain visible above the keyboard

## Game Selector Hub Update (Play.tsx)

Update the second card:
- **Title**: "The Decipher"
- **Description**: "PMs love acronyms. Type the full definition before time runs out. Can you earn a promotion?"
- **Icon**: A keyboard/text icon (e.g., Lucide `Keyboard` icon) instead of the star

The view type `"scope"` can be renamed to `"decipher"` for clarity, and the import updated from `ScopeCreepSurvivor` to `TheDecipher`.

## Technical Details

### Component Structure
- `TheDecipher` component (~350-400 lines), accepting `onBack: () => void` prop
- Game state machine: `start` | `playing` | `levelIntro` | `win` | `gameover`
- Falling animation driven by `requestAnimationFrame` with delta-time (same pattern as Sprint Runner) updating a Y position from 0 to GAME_HEIGHT
- Fall speed: starts at ~0.8px/frame, increases ~25% per level
- Each acronym gets a time window based on fall distance / speed
- No complex collision detection needed -- purely time-based (acronym reaches bottom = miss)

### Data Structure
```
interface AcronymEntry {
  acronym: string;        // e.g., "MVP"
  definition: string[];   // e.g., ["Minimum", "Viable", "Product"]
}

interface Level {
  name: string;           // e.g., "The Basics"
  title: string;          // e.g., "Junior PM"
  entries: AcronymEntry[];
  requiredCorrect: number;
}
```

### localStorage
- Key: `decipherHighScore`
- Value: fewest total misses across all levels (lower is better)
