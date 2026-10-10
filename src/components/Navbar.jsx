import React from "react";

export default function Navbar({ menuOpen, onMenu }) {
  return (
    <header className="navbar">
      <button className="logo focus-ring" aria-label="Sonora home">
        SONORA
      </button>

      <button
        className={`menu-button focus-ring ${menuOpen ? "is-open" : ""}`}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={onMenu}
      >
        <span className="menu-line" />
        <span className="menu-line" />
      </button>
    </header>
  );
}