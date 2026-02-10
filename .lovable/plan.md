

# The Scope Creep Survivor -- Implementation Plan

## Overview
Add a bullet-hell arcade survival game to the Play page, incorporating the "Prioritize" mechanic (suggestion 2) and progressive wave patterns (suggestion 3). Also update the desktop nav tooltip from "Sprint Runner" to "Play".

## Architecture

### File Changes

**New Files:**
- `src/components/SprintRunner.tsx` -- Extract all existing Sprint Runner game code from Play.tsx (move as-is, no logic changes)
- `src/components/ScopeCreepSurvivor.tsx` -- New bullet-hell game component (~500 lines)

**Modified Files:**
- `src/pages/Play.tsx` -- Rewrite as a game selector hub that renders either game
- `src/components/Header.tsx` -- Change tooltip text from "Sprint Runner" to "Play"

---

## Game Selector Hub (Play.tsx)

The Play page becomes a selection screen with two game cards:

- **Sprint Runner** -- "Navigate the chaos of product development" with a Play button
- **Scope Creep Survivor** -- "Dodge feature requests and ship your MVP" with a Play button

Selecting a game renders that component. A "Back to Games" link returns to the selector. State managed via a simple `useState<'select' | 'sprint' | 'scope'>`.

---

## Scope Creep Survivor -- Game Design

### Core Mechanics
- **Canvas**: 640x300, same responsive scaling as Sprint Runner
- **Player**: A North Star icon (SVG), starts small at center. Controlled by arrow keys / WASD (desktop) and touch-drag (mobile)
- **Enemies**: Labeled "feature request" tickets fly in from all four edges, drifting toward the player with slight homing
- **MVP Progress Bar**: Fills steadily while the player is alive and not overly bloated. Displayed at bottom of game area
- **Bloat**: Each hit increases player size by ~15% and slows MVP bar by 20%. After 5 hits, game over ("Scope Creep Won")
- **"Saying NO" Power-up**: Spawns every 15-20 seconds. Collecting it clears all on-screen requests and reduces bloat by one tier
- **Win**: Fill MVP bar to 100%. Triggers confetti with "Product Launched! (Only 2 months late)." Score = User Satisfaction based on hits avoided
- **High score**: Saved to localStorage under `scopeCreepHighScore`

### Suggestion 2: "Prioritize" Mechanic
- Rare green-labeled requests spawn occasionally (~10% of spawns): "Fix critical bug", "User research", "Accessibility audit", "Performance fix"
- Collecting a green request gives an MVP bar boost (+5-8%)
- Missing a green request has no penalty -- it just drifts off-screen
- Adds strategic depth: players must decide whether to risk moving toward a good request while dodging bad ones

### Suggestion 3: Progressive Wave Patterns
The game progresses through distinct phases as the MVP bar fills:

| MVP Progress | Phase | Spawn Behavior |
|---|---|---|
| 0-25% | **Random Drift** | Requests spawn from random edges, float gently toward center |
| 25-50% | **Stream Waves** | Requests come in horizontal/vertical streams with gaps to dodge through |
| 50-75% | **Spiral Patterns** | Requests spiral inward in arcs, requiring circular dodging |
| 75-100% | **Wall Rush** | Dense walls of requests with narrow gaps, high speed |

Each phase transition triggers a brief "Phase 2: Stream Waves" label flash and a screen-edge glow effect.

### Feature Request Labels (rotating pool)
Bad (red/orange tickets):
- "Can we make it pop?"
- "The CEO's cousin had an idea..."
- "Blockchain integration?"
- "Dark mode (High Priority)"
- "Legacy Support (IE11)"
- "AI-powered everything"
- "Can we pivot to Web3?"
- "Make it like TikTok"
- "Add a chatbot"
- "One more stakeholder review"

Good (green tickets -- Prioritize mechanic):
- "Fix critical bug"
- "User research"
- "Accessibility audit"
- "Performance optimization"

### Visual Style
- Minimalist vector matching Sprint Runner
- Feature requests: small rounded-rect "tickets" with truncated text labels
- North Star player: a simple star SVG with a subtle glow, grows visually with bloat
- "Saying NO" power-up: red circle with bold "NO" text
- Green requests: green-bordered tickets with a subtle pulse

### Audio
- Reuses existing `AudioContext` system and `createBeep` helper from Sprint Runner (will be extracted to a shared utility or duplicated in the component)
- Hit: low descending tone
- "NO" collect: ascending chord
- Green request collect: bright rising arpeggio
- Win: reuse victory fanfare
- Game over: reuse descending tones

### Input
- **Desktop**: Arrow keys / WASD for 8-directional movement. Mouse movement also supported
- **Mobile**: Touch-drag to move the star. Touch position relative to game area mapped to player position
- Movement clamped to game boundaries

---

## Header Tooltip Update

In `src/components/Header.tsx`, change the tooltip content from:

```
<p>Sprint Runner</p>
```

to:

```
<p>Play</p>
```

---

## Technical Details

### Sprint Runner Extraction
- All code from the current `Play.tsx` (constants, types, audio helpers, component logic, JSX) moves into `SprintRunner.tsx`
- The component wraps itself in a simple `div` (no Layout/SEO -- those stay in Play.tsx)
- Accepts an `onBack` callback prop to return to the game selector

### Scope Creep Survivor Structure
- Uses `requestAnimationFrame` with delta-time game loop (same pattern as Sprint Runner)
- All positions in 640x300 game-space, rendered with `scaleFactor`
- AABB collision detection with padding
- Wave pattern system driven by a `getWavePhase()` function based on MVP progress percentage
- Spawn functions vary by phase: `spawnRandom()`, `spawnStream()`, `spawnSpiral()`, `spawnWall()`

### Game Selector Hub
- Clean card-based UI with game title, one-line description, and Play button per game
- Animated entrance with framer-motion
- Remembers nothing between selections (each game resets on mount)

