import { useCallback, useEffect, useRef } from "react";

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
  type BgmPhase = "chip" | "transitioning" | "lyria";

  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const gainRef = useRef<GainNode | null>(null);
  const lyriaRef = useRef<HTMLAudioElement | null>(null);
  const phaseRef = useRef<BgmPhase>("chip");
  const transitionRequestedRef = useRef(false);
  const pendingPromptRef = useRef<string | null>(null);
  const activePromptRef = useRef<string | null>(null);
  const transitionFnRef = useRef<(prompt: string) => Promise<void>>(async () => {});
  const fadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const volumeRef = useRef(0.5);
  const bufferRef = useRef<AudioBuffer | null>(null);

  const stopAll8bitSources = useCallback(() => {
    for (const source of sourcesRef.current) {
      try { source.stop(); } catch { /* already stopped */ }
    }
    sourcesRef.current.clear();
    sourceRef.current = null;
  }, []);

  /** Render and play 8-bit BGM loop. Safe to call repeatedly — plays on first valid user gesture. */
  const play = useCallback(async () => {
    // 8-bit 단계에서만 재생
    if (phaseRef.current !== "chip") return;
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    if (ctxRef.current.state === "suspended") {
      await ctxRef.current.resume().catch(() => {});
    }
    if (ctxRef.current.state !== "running") return;
    // 렌더 대기 중 상태 변경(transition) 가능성 방지
    if (phaseRef.current !== "chip") return;
    if (sourcesRef.current.size > 0) return;

    // 버퍼 캐시 (한 번만 렌더링)
    if (!bufferRef.current) {
      bufferRef.current = await render8bitLoop();
    }

    if (phaseRef.current !== "chip") return;
    if (sourcesRef.current.size > 0) return;

    if (!gainRef.current) {
      gainRef.current = ctxRef.current.createGain();
      gainRef.current.gain.value = volumeRef.current;
      gainRef.current.connect(ctxRef.current.destination);
    }

    const source = ctxRef.current.createBufferSource();
    source.buffer = bufferRef.current;
    source.loop = true;
    source.connect(gainRef.current);
    source.onended = () => {
      sourcesRef.current.delete(source);
      if (sourceRef.current === source) {
        sourceRef.current = null;
      }
    };
    source.start();

    sourceRef.current = source;
    sourcesRef.current.add(source);
  }, []);

  /** Fetch Lyria BGM → 재생 시작 시 3초 크로스페이드. 반복 호출 시 최신 프롬프트로 갱신. */
  const transition = useCallback(async (prompt: string) => {
    const normalizedPrompt = prompt.trim();
    if (!normalizedPrompt) return;

    if (
      phaseRef.current === "lyria"
      && !transitionRequestedRef.current
      && activePromptRef.current === normalizedPrompt
    ) {
      return;
    }

    if (transitionRequestedRef.current) {
      pendingPromptRef.current = normalizedPrompt;
      return;
    }
    transitionRequestedRef.current = true;

    const fromPhase = phaseRef.current;
    const previousLyria = lyriaRef.current;
    let nextLyria: HTMLAudioElement | null = null;
    const finalize = () => {
      transitionRequestedRef.current = false;
      const nextPrompt = pendingPromptRef.current;
      pendingPromptRef.current = null;
      if (nextPrompt && nextPrompt !== activePromptRef.current) {
        void transitionFnRef.current(nextPrompt);
      }
    };

    try {
      const res = await fetch("/api/bgm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: normalizedPrompt }),
      });
      if (!res.ok) {
        phaseRef.current = fromPhase;
        finalize();
        return;
      }

      const { audioData, mimeType } = await res.json();
      if (!audioData) {
        phaseRef.current = fromPhase;
        finalize();
        return;
      }

      nextLyria = new Audio(`data:${mimeType};base64,${audioData}`);
      nextLyria.loop = true;
      nextLyria.volume = 0;
      await nextLyria.play();

      phaseRef.current = "transitioning";
      const targetVol = volumeRef.current;
      const fadeDurationMs = 3000;
      const fadeStartedAt = performance.now();

      if (fadeTimerRef.current) {
        clearInterval(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }

      if (fromPhase === "chip") {
        const chipGain = gainRef.current;
        const chipStartVol = chipGain?.gain.value ?? volumeRef.current;
        lyriaRef.current = nextLyria;

        fadeTimerRef.current = setInterval(() => {
          const elapsed = performance.now() - fadeStartedAt;
          const ratio = Math.min(1, elapsed / fadeDurationMs);

          if (chipGain) {
            chipGain.gain.value = chipStartVol * (1 - ratio);
          }
          nextLyria.volume = targetVol * ratio;

          if (ratio >= 1) {
            if (fadeTimerRef.current) {
              clearInterval(fadeTimerRef.current);
              fadeTimerRef.current = null;
            }
            stopAll8bitSources();
            phaseRef.current = "lyria";
            activePromptRef.current = normalizedPrompt;
            nextLyria.volume = volumeRef.current;
            finalize();
          }
        }, 100);
        return;
      }

      const prevStartVol = previousLyria?.volume ?? volumeRef.current;
      lyriaRef.current = nextLyria;

      fadeTimerRef.current = setInterval(() => {
        const elapsed = performance.now() - fadeStartedAt;
        const ratio = Math.min(1, elapsed / fadeDurationMs);

        if (previousLyria && previousLyria !== nextLyria) {
          previousLyria.volume = prevStartVol * (1 - ratio);
        }
        nextLyria.volume = targetVol * ratio;

        if (ratio >= 1) {
          if (fadeTimerRef.current) {
            clearInterval(fadeTimerRef.current);
            fadeTimerRef.current = null;
          }
          if (previousLyria && previousLyria !== nextLyria) {
            previousLyria.pause();
            previousLyria.currentTime = 0;
          }
          phaseRef.current = "lyria";
          activePromptRef.current = normalizedPrompt;
          nextLyria.volume = volumeRef.current;
          finalize();
        }
      }, 100);
    } catch {
      if (nextLyria) {
        nextLyria.pause();
        nextLyria.currentTime = 0;
      }
      phaseRef.current = fromPhase;
      finalize();
    }
  }, [stopAll8bitSources]);

  const stop = useCallback(() => {
    if (fadeTimerRef.current) {
      clearInterval(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    stopAll8bitSources();
    if (gainRef.current) {
      try { gainRef.current.disconnect(); } catch { /* */ }
      gainRef.current = null;
    }
    if (lyriaRef.current) {
      lyriaRef.current.pause();
      lyriaRef.current = null;
    }
    phaseRef.current = "chip";
    transitionRequestedRef.current = false;
    pendingPromptRef.current = null;
    activePromptRef.current = null;
  }, [stopAll8bitSources]);

  /** Set volume (0–1). 전환 전 8-bit, 전환 후 Lyria만 제어한다. */
  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    volumeRef.current = clamped;

    if (phaseRef.current === "chip") {
      if (gainRef.current) gainRef.current.gain.value = clamped;
      return;
    }
    if (phaseRef.current === "lyria") {
      if (lyriaRef.current) lyriaRef.current.volume = clamped;
      return;
    }
    // transitioning 중엔 페이드 곡선을 깨지 않도록 직접 적용하지 않음.
  }, []);

  useEffect(() => {
    transitionFnRef.current = transition;
  }, [transition]);

  return { play, transition, stop, setVolume };
}
