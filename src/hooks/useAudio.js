import { useCallback, useRef } from "react";

export function useAudio() {
  const contextRef = useRef(null);
  const masterRef = useRef(null);
  const activeVoicesRef = useRef(new Set());

  const ensureContext = useCallback(async () => {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return null;

    if (!contextRef.current) {
      const ctx = new AudioContextCtor();
      const master = ctx.createGain();
      const compressor = ctx.createDynamicsCompressor();

      master.gain.value = 0.62;
      compressor.threshold.value = -18;
      compressor.knee.value = 18;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.22;

      master.connect(compressor);
      compressor.connect(ctx.destination);

      contextRef.current = ctx;
      masterRef.current = master;
    }

    if (contextRef.current.state === "suspended") {
      await contextRef.current.resume();
    }

    return contextRef.current;
  }, []);

  const pluck = useCallback(
    async ({ frequency, velocity = 0.8 }) => {
      const ctx = await ensureContext();
      if (!ctx || !masterRef.current) return;

      // Keep the fallback musical and guitar-like rather than making a simple beep:
      // several harmonics, a short noise transient, low-pass filtering, and damping.
      const now = ctx.currentTime;
      const voice = {
        oscillators: [],
        nodes: [],
      };

      const body = ctx.createBiquadFilter();
      body.type = "lowpass";
      body.frequency.setValueAtTime(Math.min(4200, frequency * 13), now);
      body.Q.value = 0.55;

      const amp = ctx.createGain();
      const peak = 0.105 * Math.min(1, Math.max(0.35, velocity));
      amp.gain.setValueAtTime(0.0001, now);
      amp.gain.exponentialRampToValueAtTime(peak, now + 0.008);
      amp.gain.exponentialRampToValueAtTime(0.0001, now + 1.65);

      body.connect(amp);
      amp.connect(masterRef.current);

      // Fundamental + diminishing harmonics emulate a plucked string.
      [1, 2, 3, 4, 5].forEach((multiple, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = index === 0 ? "triangle" : "sine";
        osc.frequency.setValueAtTime(frequency * multiple, now);
        osc.detune.setValueAtTime((Math.random() - 0.5) * 2.4, now);

        const harmonicLevel = 1 / (multiple * 1.75);
        gain.gain.setValueAtTime(harmonicLevel, now);
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          now + 0.8 + index * 0.12
        );

        osc.connect(gain);
        gain.connect(body);
        osc.start(now);
        osc.stop(now + 1.8);

        voice.oscillators.push(osc);
        voice.nodes.push(gain);
      });

      // Tiny pick/finger transient.
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.045, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3);
      }

      const noise = ctx.createBufferSource();
      const noiseFilter = ctx.createBiquadFilter();
      const noiseGain = ctx.createGain();

      noise.buffer = buffer;
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.value = Math.min(3200, frequency * 8);
      noiseFilter.Q.value = 0.8;
      noiseGain.gain.setValueAtTime(0.018 * velocity, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterRef.current);
      noise.start(now);

      activeVoicesRef.current.add(voice);

      window.setTimeout(() => {
        activeVoicesRef.current.delete(voice);
      }, 1900);
    },
    [ensureContext]
  );

  const cleanup = useCallback(() => {
    activeVoicesRef.current.clear();
    if (contextRef.current) {
      contextRef.current.close().catch(() => {});
      contextRef.current = null;
      masterRef.current = null;
    }
  }, []);

  return { ensureContext, pluck, cleanup };
}