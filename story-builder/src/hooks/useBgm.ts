import { useCallback, useRef } from "react";

export function useBgm() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /** Fetch BGM from /api/bgm and play it on loop. */
  const play = useCallback(async (prompt: string) => {
    // Stop any existing BGM
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      const res = await fetch("/api/bgm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) return;

      const { audioData, mimeType } = await res.json();
      if (!audioData) return;

      const audio = new Audio(`data:${mimeType};base64,${audioData}`);
      audio.loop = true;
      audio.volume = 0.6;
      audioRef.current = audio;
      await audio.play();
    } catch {
      // silent fail — BGM is non-blocking
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  /** Set volume (0–1). Use to duck BGM when GM speaks. */
  const setVolume = useCallback((v: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, v));
    }
  }, []);

  return { play, stop, setVolume };
}
