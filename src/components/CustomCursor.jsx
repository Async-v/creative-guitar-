import React, { useEffect, useRef } from "react";
import anime from "animejs";

export default function CustomCursor() {
  const ringRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    const move = (event) => {
      anime({
        targets: ring,
        left: event.clientX,
        top: event.clientY,
        duration: 260,
        easing: "easeOutQuad",
      });

      dot.style.left = `${event.clientX}px`;
      dot.style.top = `${event.clientY}px`;
    };

    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <>
      <span ref={ringRef} className="custom-cursor" aria-hidden="true" />
      <span ref={dotRef} className="custom-cursor-dot" aria-hidden="true" />
    </>
  );
}