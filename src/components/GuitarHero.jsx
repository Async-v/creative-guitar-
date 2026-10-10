import React, { useRef } from "react";
import GuitarStrings from "./GuitarStrings";

export default function GuitarHero({ enabled, onPluck }) {
  const svgRef = useRef(null);

  return (
    <>
      <GuitarStrings svgRef={svgRef} enabled={enabled} onPluck={onPluck} />

      <div className="hero-copy">
        <div className="hero-kicker">An interactive instrument</div>
        <h1 className="hero-title">
          LET THE
          <br />
          STRINGS
          <br />
          SPEAK.
        </h1>
        <p className="hero-description">
          Move through the strings. Feel the vibration. Listen to the wood.
        </p>
      </div>
    </>
  );
}