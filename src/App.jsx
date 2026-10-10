import React, { useCallback, useEffect, useRef, useState } from "react";
import anime from "animejs";
import Navbar from "./components/Navbar";
import MenuOverlay from "./components/MenuOverlay";
import MusicPlayer from "./components/MusicPlayer";
import GuitarHero from "./components/GuitarHero";
import CustomCursor from "./components/CustomCursor";
import { useAudio } from "./hooks/useAudio";

export default function App() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pluckedNote, setPluckedNote] = useState(null);
  const { ensureContext, pluck, cleanup } = useAudio();
  const firstInteractionRef = useRef(false);

  useEffect(() => {
    const copy = document.querySelector(".hero-copy");
    if (!copy) return;

    anime({
      targets: copy,
      opacity: [0, 1],
      translateY: ["-46%", "-50%"],
      duration: 1300,
      delay: 180,
      easing: "easeOutCubic",
    });

    return cleanup;
  }, [cleanup]);

  const enableSound = useCallback(async () => {
    const ctx = await ensureContext();
    if (ctx) {
      setSoundEnabled(true);
      firstInteractionRef.current = true;
    }
  }, [ensureContext]);

  const handlePluck = useCallback(
    async (string, velocity) => {
      if (!soundEnabled) return;

      await pluck({
        frequency: string.frequency,
        velocity,
      });

      setPluckedNote(string.note);
      window.clearTimeout(handlePluck.timeout);
      handlePluck.timeout = window.setTimeout(() => setPluckedNote(null), 260);
    },
    [pluck, soundEnabled]
  );

  return (
    <main
      className="sonora-app"
      onPointerDown={() => {
        if (!soundEnabled) enableSound();
      }}
    >
      <div className="hero-art" aria-hidden="true" />
      <div className="hero-overlay" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />

      <Navbar
        menuOpen={menuOpen}
        onMenu={() => setMenuOpen((value) => !value)}
      />

      <GuitarHero enabled={soundEnabled} onPluck={handlePluck} />

      <MusicPlayer enabled={soundEnabled} onEnable={enableSound} />

      <div className="sound-hint" aria-live="polite">
        <span />
        {pluckedNote ? `STRING ${pluckedNote}` : "MOVE THROUGH THE STRINGS"}
      </div>

      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />

      {!soundEnabled && (
        <button
          className="enter-overlay focus-ring"
          onClick={(event) => {
            event.stopPropagation();
            enableSound();
          }}
          aria-label="Enable guitar sound"
        >
          <span className="enter-card">
            <small>Headphones recommended</small>
            <strong>Enter the sound</strong>
          </span>
        </button>
      )}

      <CustomCursor />
    </main>
  );
}