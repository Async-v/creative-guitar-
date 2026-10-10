# SONORA — Interactive Guitar

A cinematic interactive guitar hero built with React, Vite, Tailwind CSS, Anime.js and the Web Audio API.

## 1. Install

```bash
npm install
```

## 2. Run

```bash
npm run dev
```

Then open the local Vite URL.

## 3. Production build

```bash
npm run build
npm run preview
```

## Project structure

```text
src/
├── components/
│   ├── CustomCursor.jsx
│   ├── GuitarHero.jsx
│   ├── GuitarString.jsx
│   ├── GuitarStrings.jsx
│   ├── MenuOverlay.jsx
│   ├── MusicPlayer.jsx
│   └── Navbar.jsx
├── hooks/
│   ├── useAudio.js
│   └── useGuitarInteraction.js
├── utils/
│   ├── guitarNotes.js
│   └── stringPhysics.js
├── App.jsx
├── index.css
└── main.jsx

public/
├── guitar-bg.png
└── audio/
    └── golden-strings.mp3   # optional: add your own ambient track
```

## Guitar interaction

The six visible strings are SVG paths positioned in the same 1672×941 coordinate system as the supplied guitar photograph.

Pointer movement is converted from screen coordinates into the SVG viewBox. Each string is sampled into a small polyline. The nearest point and the pointer's side relative to the string tangent are tracked.

A pluck happens when:

1. The pointer is close to a string.
2. The pointer moves across that string.
3. The local side changes.

This means simply leaving the cursor on a string does **not** repeatedly trigger the note.

Anime.js then changes the actual SVG path geometry with a damped oscillation. Every string has different amplitude, duration and frequency so the six strings do not look identical.

## Sound

The project works without external guitar samples. `useAudio.js` creates a plucked-string fallback using:

- fundamental + harmonic oscillators
- short filtered noise transient
- low-pass body filtering
- exponential amplitude decay
- dynamics compression

This is intentionally more organic than a single oscillator beep.

For higher-fidelity production audio, place acoustic guitar samples here:

```text
public/audio/
├── guitar-E-low.mp3
├── guitar-A.mp3
├── guitar-D.mp3
├── guitar-G.mp3
├── guitar-B.mp3
└── guitar-E-high.mp3
```

The current implementation keeps the fallback self-contained so the website remains runnable immediately.

## Important coordinate note

The supplied background is 1672×941. The SVG uses the same viewBox so the strings track the photograph without pixel-based CSS positioning. If you later replace the background with a differently cropped image, update the six `STRING_PATHS` in `src/components/GuitarStrings.jsx`.

## Accessibility

- Keyboard focus states
- ARIA labels
- Reduced-motion media query
- Touch/tap support
- Audio only begins after user interaction

## Performance

Pointer coordinates are not stored in React state. High-frequency interaction stays inside refs and direct SVG/Anime.js updates, keeping React out of the animation loop.
# creative-guitar-
