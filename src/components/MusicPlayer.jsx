import React, { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

export default function MusicPlayer({ enabled, onEnable }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const time = () => {
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };

    audio.addEventListener("timeupdate", time);
    audio.addEventListener("ended", () => setPlaying(false));

    return () => {
      audio.removeEventListener("timeupdate", time);
    };
  }, []);

  const toggle = async () => {
    if (!enabled) await onEnable();

    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  const seek = (event) => {
    const audio = audioRef.current;
    if (!audio?.duration) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    audio.currentTime = Math.max(0, Math.min(1, ratio)) * audio.duration;
  };

  return (
    <section className="player ui-surface" aria-label="Ambient music player">
      {/* Optional real track: put a file at public/audio/golden-strings.mp3 */}
      <audio ref={audioRef} src="/audio/golden-strings.mp3" preload="metadata" />

      <div className="player-top">
        <div>
          <div className="player-label">Now listening</div>
          <div className="track-title">Golden Strings</div>
          <div className="track-subtitle">AMBIENT GUITAR / 03:42</div>
        </div>

        <button
          className="play-button focus-ring"
          onClick={toggle}
          aria-label={playing ? "Pause ambient music" : "Play ambient music"}
        >
          {playing ? <Pause size={14} strokeWidth={1.4} /> : <Play size={14} strokeWidth={1.4} />}
        </button>
      </div>

      <div className="progress-wrap">
        <div className="progress-track" onClick={seek} role="slider" aria-label="Track progress">
          <div className="progress-value" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="player-bottom">
        <span>{playing ? "PLAYING" : "PAUSED"}</span>
        <span>AMBIENT</span>
      </div>
    </section>
  );
}