import { useCallback, useRef } from "react";
import type { GMPose } from "@/components/intro/GameMasterFace";

const GM_TONE = "너는 진중하면서도 장난기 있는 JRPG 게임마스터야. 낮고 안정된 목소리로 또박또박 말하되, 모험가를 이끄는 여유와 자신감을 담아. 톤을 일정하게 유지해.";

export function useGmVoice() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  /** Call on a user gesture (click) to unlock browser autoplay policy. */
  const unlock = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    // Also play a silent buffer through an HTMLAudioElement to unlock it
    const silent = new Audio(
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YQAAAAA=",
    );
    silent.volume = 0;
    silent.play().catch(() => {});
  }, []);

  /** Prefetch TTS audio, returns a play() function. Use to sync text + voice. */
  const prefetch = useCallback(async (text: string, _pose?: GMPose): Promise<() => void> => {
    const cleanText = text.replace(/\n/g, " ");

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText, tone: GM_TONE }),
      });
      if (!res.ok) return () => {};

      const { audioData, mimeType } = await res.json();
      if (!audioData) return () => {};

      const audio = new Audio(`data:${mimeType};base64,${audioData}`);
      return () => {
        if (audioRef.current) { audioRef.current.pause(); }
        audioRef.current = audio;
        audio.play().catch(() => {});
      };
    } catch {
      return () => {};
    }
  }, []);

  /** Fetch + play immediately (fire-and-forget). */
  const speak = useCallback(async (text: string, pose?: GMPose) => {
    const play = await prefetch(text, pose);
    play();
  }, [prefetch]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  return { unlock, prefetch, speak, stop };
}
