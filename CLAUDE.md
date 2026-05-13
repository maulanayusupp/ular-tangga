# Snakes & Ladders — Project Notes

Vue 3 + Vite mobile-first Snakes & Ladders game. Modes: vs AI (1 bot) or pass-and-play (2–4 players). English UI. Repo folder is `ular-tangga` (Indonesian name for the game) — kept for the package identifier, but all user-facing strings and SEO are English.

## Architecture

- **`src/composables/useGameState.js`** — single source of truth for game state (`players`, `currentTurn`, `dice`, `mode`, `winner`). Exposes `startGame`, `rollDice`, `goToMenu`. The async `movePlayer` loop fires sound effects in sync with animation timing, then triggers the next AI turn if applicable.
- **`src/composables/useSound.js`** — all SFX synthesized via Web Audio API. No audio assets. Lazy-inits a singleton `AudioContext` on first call (must be inside a user gesture). Exports `playDice`, `playStep`, `playLadder`, `playSnake`, `playWin`, plus `setMuted` / `isMuted`.
- **`src/components/GameBoard.vue`** — 10×10 CSS grid for cells + absolute-positioned SVG overlay (`viewBox="0 0 100 100"`, `preserveAspectRatio="none"`) for snake/ladder graphics + absolute-positioned `<div>` tokens with CSS transitions.
- **State passing**: `App.vue` instantiates `useGameState()` once and passes the whole reactive bag down as a `game` prop. Refs are accessed via `game.foo.value` in templates (not auto-unwrapped because they're nested in a prop object).

## Board coordinate system

Cells use boustrophedon (zigzag) numbering: row 1 (bottom) goes 1→10 left-to-right, row 2 goes 20→11 right-to-left, etc. Helper `posToCoord(n)` in `GameBoard.vue` converts a cell number into `{ left%, top% }` for visual positioning inside the 100×100 viewBox.

`LADDERS` and `SNAKES` are constant maps in `useGameState.js`:
- `LADDERS[from] = to` where `from < to` (climb up). Visual rail goes bottom-to-top.
- `SNAKES[from] = to` where `from > to` (slide down). `from` is the head cell (where you land); `to` is the tail.

To add a snake or ladder: edit only the constants in `useGameState.js`. Board overlay and arrow badges regenerate automatically.

## Gotchas

- **SVG stroke gradient on axis-aligned lines**: stroke gradients with default `gradientUnits="objectBoundingBox"` collapse when the line is parallel to the gradient's axis (zero bbox dimension in that direction). This made vertical ladders (7→14, 71→91, 78→98, 87→94) render only their dashed center trail and not the rails/rungs. **Fix**: use solid colors or `gradientUnits="userSpaceOnUse"` for stroked lines. Curved paths (snake bodies) are unaffected because their bbox is always non-zero in both dimensions.
- **AudioContext user-gesture requirement**: First sound must originate from a click. `getCtx()` lazy-creates the context, and `playDice()` is the first call (from dice button click). Subsequent sounds (`playStep`, `playLadder`, `playSnake`) re-use the existing context, so they're allowed even when called from async timers.
- **Port 5173 collision**: Other Vite projects on the same machine may bind 5173 first (especially via IPv6 `::1`). If `localhost:5173` returns the wrong app, use `127.0.0.1:5173` (IPv4) instead. This is a host-level issue, not a project misconfiguration.
- **z-index stacking inside the board**: SVG overlay sits at `z-index: 10`, cell-arrow badges at `20`, tokens at `50+`. Cells themselves have `position: relative` without z-index, so badges (inside cells) and tokens (inside `.board`) both correctly render above the SVG overlay.
- **Bounce-back rule**: if dice + position > 100, the token walks to 100, then walks BACK by the overshoot. Step sounds fire on each cell of both forward and reverse walks.

## Sound design

Each effect composes `OscillatorNode` and filtered noise buffers:
- `playDice` — 7 band-pass noise clicks at random pitches + low-freq sine "thunk" at the end
- `playStep` — short bandpass thud + sine pluck; `stepFlip` toggle alternates pitch (260Hz / 320Hz base) for L/R foot feel
- `playLadder` — triangle-wave arpeggio C5-E5-G5-C6-E6 over 400ms + high-pass noise sparkle
- `playSnake` — sawtooth descending sweep 900Hz→110Hz with lowpass + high-pass noise hiss
- `playWin` — 6-note ascending triangle arpeggio

All sounds route through a singleton `masterGain` (0.7) that `setMuted(true)` zeroes.

## SEO / PWA

Production URL: `https://ular-tangga-sigma.vercel.app` (Vercel). This URL is hardcoded in:
- `index.html` (canonical, og:url, twitter:url, og:image, twitter:image, two JSON-LD blocks)
- `public/robots.txt` (Sitemap line)
- `public/sitemap.xml` (`<loc>`)

If the domain changes, search-replace `https://ular-tangga-sigma.vercel.app` across the above.

OG image is SVG (`public/og-image.svg`). Most social platforms support SVG but a few (older Twitter previews, LinkedIn) prefer PNG — generate a 1200×630 PNG from the SVG and update `og:image` / `twitter:image` references if richer previews matter.

## Build & deploy

`npm run dev` — Vite on port 5173.  
`npm run build` — emits `dist/` (pure static, ~34KB gzip JS + ~3KB gzip CSS).  
Deploy `dist/` to any static host (Vercel/Netlify/Cloudflare Pages/GitHub Pages).
