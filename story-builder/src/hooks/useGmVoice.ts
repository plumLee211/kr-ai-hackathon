import { useCallback, useRef } from "react";
import type { GMPose } from "@/components/intro/GameMasterFace";

const VOICE_MODE = process.env.NEXT_PUBLIC_GM_VOICE_MODE ?? "blip"; // "tts" | "blip"

const GM_TONE = "너는 진중하면서도 장난기 있는 JRPG 게임마스터야. 낮고 안정된 목소리로 또박또박 말하되, 모험가를 이끄는 여유와 자신감을 담아. 톤을 일정하게 유지해.";

// ── Dialogue Blip (Undertale-style) ──
const BLIP_BASE_FREQ = 220; // A3 — GM 기본 음높이
const BLIP_DURATION = 0.06; // 각 글자 60ms
const BLIP_INTERVAL = 0.08; // 글자 간 간격 80ms

function scheduleBlips(
  ctx: AudioContext,
  text: string,
): { duration: number; stop: () => void } {
  const chars = text.replace(/[\s\n]/g, ""); // 공백 제외
  const gainNode = ctx.createGain();
  gainNode.gain.value = 0.15;
  gainNode.connect(ctx.destination);

  const oscillators: OscillatorNode[] = [];
  let cancelled = false;

  for (let i = 0; i < chars.length; i++) {
    if (cancelled) break;
    // 글자 코드 기반으로 음높이 미세 변화 → 캐릭터 느낌
    const charCode = chars.charCodeAt(i);
    const pitchVariation = (charCode % 8 - 4) * 15; // -60 ~ +45 Hz
    const freq = BLIP_BASE_FREQ + pitchVariation;

    const osc = ctx.createOscillator();
    osc.type = "square"; // 8-bit 느낌
    osc.frequency.value = freq;
    osc.connect(gainNode);

    const startTime = ctx.currentTime + i * BLIP_INTERVAL;
    osc.start(startTime);
    osc.stop(startTime + BLIP_DURATION);
    oscillators.push(osc);
  }

  const totalDuration = chars.length * BLIP_INTERVAL;

  return {
    duration: totalDuration,
    stop: () => {
      cancelled = true;
      oscillators.forEach((o) => {
        try { o.stop(); } catch { /* already stopped */ }
      });
    },
  };
}

export function useGmVoice() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const blipRef = useRef<{ stop: () => void } | null>(null);

  /** Call on a user gesture (click) to unlock browser autoplay policy. */
  const unlock = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    const silent = new Audio(
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YQAAAAA=",
    );
    silent.volume = 0;
    silent.play().catch(() => {});
  }, []);

  /** Prefetch TTS audio, returns a play() function. Use to sync text + voice. */
  const prefetch = useCallback(async (text: string, _pose?: GMPose): Promise<() => void> => {
    // ── Blip mode: no API call, instant playback ──
    if (VOICE_MODE === "blip") {
      return () => {
        if (!ctxRef.current) ctxRef.current = new AudioContext();
        if (ctxRef.current.state === "suspended") ctxRef.current.resume();
        if (blipRef.current) blipRef.current.stop();
        blipRef.current = scheduleBlips(ctxRef.current, text);
      };
    }

    // ── TTS mode: fetch from API ──
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
    if (blipRef.current) {
      blipRef.current.stop();
      blipRef.current = null;
    }
  }, []);

  return { unlock, prefetch, speak, stop };
}
