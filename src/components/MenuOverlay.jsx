import React, { useEffect, useRef } from "react";
import anime from "animejs";

const items = ["HOME", "MUSIC", "GUITARS", "ABOUT"];

export default function MenuOverlay({ open, onClose }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open || !overlayRef.current) return;

    const links = overlayRef.current.querySelectorAll(".menu-link");
    anime({
      targets: overlayRef.current,
      opacity: [0, 1],
      duration: 520,
      easing: "easeOutQuad",
    });

    anime({
      targets: links,
      translateY: [40, 0],
      opacity: [0, 1],
      delay: anime.stagger(75, { start: 100 }),
      duration: 850,
      easing: "easeOutCubic",
    });
  }, [open]);

  if (!open) return null;

  return (
    <div ref={overlayRef} className="menu-overlay" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <div className="menu-inner">
        <div>
          <div className="menu-eyebrow">The sound is in the wood</div>
          <nav className="menu-links" aria-label="Main navigation">
            {items.map((item) => (
              <button
                key={item}
                className="menu-link focus-ring"
                onClick={onClose}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        <p className="menu-note">
          An experimental instrument for slow hands, warm rooms and strings
          that answer back.
        </p>
      </div>
    </div>
  );
}