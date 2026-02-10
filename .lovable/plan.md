

# The Decipher -- Refinements and Routing Update

## Overview
Eight changes to The Decipher game, plus routing updates so each game has its own URL and the nav bar always links to the `/play` selector hub.

## 1. Routing: Give Each Game Its Own URL

**Files: `src/App.tsx`, `src/pages/Play.tsx`**

- Add two new routes in `App.tsx`: `/play/sprint-runner` and `/play/the-decipher`
- Create two new thin page components (or render inline) that wrap each game component in `Layout` + `SEO`
- `/play` remains the game selector hub (no more `useState` view toggling)
- Each game's "Back to Games" button uses `useNavigate` to go to `/play` (or a `Link`)
- The Header gamepad icon continues linking to `/play`
- Sprint Runner and Decipher `onBack` props change to navigate to `/play` via react-router

**New files:**
- `src/pages/PlaySprintRunner.tsx` -- Layout + SEO wrapper rendering `<SprintRunner onBack={...} />`
- `src/pages/PlayTheDecipher.tsx` -- Layout + SEO wrapper rendering `<ScopeCreepSurvivor onBack={...} />`

**Modified:** `src/pages/Play.tsx` -- remove `useState` view logic, keep only the selector cards with `Link` to sub-routes

## 2. Simplify Game Selector Cards

**File: `src/pages/Play.tsx`**

- Sprint Runner subtext: "Navigate the chaos of product development."
- The Decipher subtext: "PMs love acronyms. Type the full definition before time runs out."
- Cards link to `/play/sprint-runner` and `/play/the-decipher` respectively
- Remove the "Can you earn a promotion?" text and "Jump over bugs..." detail

## 3. Sprint Runner Icon Color

**File: `src/pages/Play.tsx`**

Change the Sprint Runner SVG icon wrapper from `text-muted-foreground` to `text-coral` to match The Decipher's keyboard icon.

## 4. Level Titles

**File: `src/components/ScopeCreepSurvivor.tsx`**

Update the `LEVELS` data:
- Level 1: `name: "The Junior PM"`, remove separate title display
- Level 2: `name: "The Data-Driven PM"`
- Level 3: `name: "The Agile Master"`
- Level 4: `name: "The Product Leader"`

Remove the `title` field usage -- the level intro screen will show just "Level N" and the level name (no more `The "Junior PM" Level` format).

## 5. Remove Volume Toggle

**File: `src/components/ScopeCreepSurvivor.tsx`**

- Remove `soundOn` state and the toggle button from the header
- Remove `Volume2`/`VolumeX` imports
- Sound is always on (remove the `if (!stateRef.current.soundOn) return;` guard in `playSound`)

## 6. Remove Falling Time Limit

**File: `src/components/ScopeCreepSurvivor.tsx`**

This is the biggest change. Remove the entire falling animation system:
- Remove `fallY`, `fallYRef`, `activeRef`, `animFrameRef`, `lastTimeRef`, `startFallingForLevel`, `stopFalling`, `handleMissRef`, `GAME_HEIGHT`, `BASE_FALL_SPEED`
- Remove the 640x300 game container with the falling acronym and red bottom line
- Instead, show the acronym prominently (centered, large serif text) with the word hints and input all together in a single clean container
- On wrong answer: immediately advance to the next acronym (count as a miss), show witty feedback briefly
- On correct full answer: advance to next acronym (count as correct), show witty feedback
- The flow becomes: acronym displayed -> player types words -> right = next acronym (correct) / wrong = next acronym (miss)

## 7. Simplify Game Over Screen

**File: `src/components/ScopeCreepSurvivor.tsx`**

Current:
```
"The Jargon Won"
"You needed X correct but only got Y on Level Z."
"Let's circle back in the next sprint."
```

Change to:
```
"The Jargon Won"
"Let's circle back in the next sprint."
```

Remove the line explaining required vs achieved counts.

## 8. Simplify Start Screen

**File: `src/components/ScopeCreepSurvivor.tsx`**

Current:
```
"PMs love acronyms. Type the full definition before it hits the bottom."
"4 levels . 28 acronyms . Can you earn a promotion?"
```

Change to:
```
"Your stakeholders are speaking in riddles. Decode the acronyms to keep the project on track and secure your seat at the table."
```

Remove the stats subtext line entirely.

## Technical Summary

| File | Action |
|---|---|
| `src/App.tsx` | Add routes `/play/sprint-runner` and `/play/the-decipher` |
| `src/pages/Play.tsx` | Simplify to card links (no state management), update subtexts, coral icon |
| `src/pages/PlaySprintRunner.tsx` | New page wrapper for Sprint Runner |
| `src/pages/PlayTheDecipher.tsx` | New page wrapper for The Decipher |
| `src/components/ScopeCreepSurvivor.tsx` | Remove falling mechanic, volume toggle, update level titles, simplify start/gameover screens |
| `src/components/SprintRunner.tsx` | Update `onBack` to use `useNavigate` instead of callback |

