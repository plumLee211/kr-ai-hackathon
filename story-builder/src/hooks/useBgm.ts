import { useCallback, useRef } from "react";

// ── 8-bit Procedural BGM (Web Audio API) ──
const BPM = 130;
const BEAT = 60 / BPM;
const EIGHTH = BEAT / 2;
const SAMPLE_RATE = 44100;
// Note frequencies (C major pentatonic)
const N: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, G3: 196.00, A3: 220.00,
  C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.00, A4: 440.00,
  C5: 523.25, D5: 587.33,
};

// Melody: each slot = 1 eighth note, null = rest (cute JRPG town theme)
const MELODY: (string | null)[] = [
  "E4", null, "G4", null, "A4", null, "C5", null,
  "A4", "G4", "E4", null, "D4", null, "C4", null,
  "E4", null, "G4", "A4", "C5", null, "D5", null,
  "C5", "A4", "G4", "E4", "D4", null, null, null,
  "C5", null, "A4", null, "G4", null, "A4", null,
  "C5", null, "D5", null, "C5", "A4", "G4", null,
  "E4", null, "G4", null, "E4", null, "D4", null,
  "C4", null, "D4", null, "C4", null, null, null,
];

// Bass: each slot = 1 quarter note, null = rest
const BASS: (string | null)[] = [
  "C3", null, "G3", null, "C3", null, "G3", null,
  "C3", null, "E3", null, "G3", null, "G3", null,
  "A3", null, "E3", null, "A3", null, "E3", null,
  "G3", null, "D3", null, "C3", null, "C3", null,
];

/** Render an 8-bar chiptune loop into an AudioBuffer. */
async function render8bitLoop(): Promise<AudioBuffer> {
  const duration = MELODY.length * EIGHTH;
  const frames = Math.ceil(SAMPLE_RATE * duration);
  const offline = new OfflineAudioContext(1, frames, SAMPLE_RATE);

  for (let i = 0; i < MELODY.length; i++) {
    const note = MELODY[i];
    if (!note || !N[note]) continue;
    const osc = offline.createOscillator();
    osc.type = "square";
    osc.frequency.value = N[note];
    const env = offline.createGain();
    const t = i * EIGHTH;
    env.gain.setValueAtTime(0.10, t);
    env.gain.linearRampToValueAtTime(0.01, t + EIGHTH * 0.85);
    osc.connect(env);
    env.connect(offline.destination);
    osc.start(t);
    osc.stop(t + EIGHTH * 0.9);
  }

  for (let i = 0; i < BASS.length; i++) {
    const note = BASS[i];
    if (!note || !N[note]) continue;
    const osc = offline.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = N[note];
    const env = offline.createGain();
    const t = i * BEAT;
    env.gain.setValueAtTime(0.13, t);
    env.gain.linearRampToValueAtTime(0.03, t + BEAT * 0.8);
    osc.connect(env);
    env.connect(offline.destination);
    osc.start(t);
    osc.stop(t + BEAT * 0.85);
  }

  return offline.startRendering();
}

export function useBgm() {
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const lyriaRef = useRef<HTMLAudioElement | null>(null);
  const volumeRef = useRef(0.5);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const transitionedRef = useRef(false); // Lyria 전환 완료 플래그

  /** Render and play 8-bit BGM loop. Safe to call repeatedly — plays on first valid user gesture. */
  const play = useCallback(async () => {
    // Lyria로 전환됐으면 8-bit 다시 시작하지 않음
    if (transitionedRef.current) return;
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    if (ctxRef.current.state === "suspended") {
      await ctxRef.current.resume().catch(() => {});
    }
    if (ctxRef.current.state !== "running") return;
    if (sourceRef.current) return;

    // 버퍼 캐시 (한 번만 렌더링)
    if (!bufferRef.current) {
      bufferRef.current = await render8bitLoop();
    }

    const source = ctxRef.current.createBufferSource();
    source.buffer = bufferRef.current;
    source.loop = true;

    const gain = ctxRef.current.createGain();
    gain.gain.value = volumeRef.current;
    source.connect(gain);
    gain.connect(ctxRef.current.destination);
    source.start();

    sourceRef.current = source;
    gainRef.current = gain;
  }, []);

  /** Fetch Lyria BGM → crossfade from 8-bit. */
  const transition = useCallback(async (prompt: string) => {
    try {
      const res = await fetch("/api/bgm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) return;

      const { audioData, mimeType } = await res.json();
      if (!audioData) return;

      // 8-bit 즉시 정지 후 Lyria 재생 (깔끔한 전환)
      if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch { /* */ }
        sourceRef.current = null;
      }
      gainRef.current = null;
      transitionedRef.current = true;

      const audio = new Audio(`data:${mimeType};base64,${audioData}`);
      audio.loop = true;
      audio.volume = volumeRef.current;
      lyriaRef.current = audio;
      await audio.play();
    } catch {
      // Lyria 실패 시 8-bit 유지
    }
  }, []);

  const stop = useCallback(() => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch { /* */ }
      sourceRef.current = null;
    }
    gainRef.current = null;
    if (lyriaRef.current) {
      lyriaRef.current.pause();
      lyriaRef.current = null;
    }
  }, []);

  /** Set volume (0–1). Applies to whichever source is active. */
  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    volumeRef.current = clamped;
    if (gainRef.current) {
      gainRef.current.gain.value = clamped;
    }
    if (lyriaRef.current) {
      lyriaRef.current.volume = clamped;
    }
  }, []);

  return { play, transition, stop, setVolume };
}
