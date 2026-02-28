import { useCallback, useRef } from "react";
import type { GMPose } from "@/components/intro/GameMasterFace";

const VOICE_MODE = process.env.NEXT_PUBLIC_GM_VOICE_MODE ?? "blip"; // "tts" | "blip"

const GM_TONE = "너는 진중하면서도 장난기 있는 JRPG 게임마스터야. 낮고 안정된 목소리로 또박또박 말하되, 모험가를 이끄는 여유와 자신감을 담아. 톤을 일정하게 유지해.";

// ── Dialogue Blip (도토리 톡톡 스타일) ──
const BLIP_BASE_FREQ = 380; // 통통한 높은 톤
const BLIP_DURATION = 0.035; // 짧고 통통한 35ms
const BLIP_INTERVAL = 0.11; // 글자 간 간격 110ms

function scheduleBlips(
  ctx: AudioContext,
  text: string,
): { duration: number; stop: () => void } {
  const chars = text.replace(/[\s\n]/g, "");
  // 한국어 텍스트가 길므로 2글자마다 한 번만 블립
  const sampled = Array.from(chars).filter((_, i) => i % 2 === 0);

  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.35;
  masterGain.connect(ctx.destination);

  const oscillators: OscillatorNode[] = [];
  let cancelled = false;

  for (let i = 0; i < sampled.length; i++) {
    if (cancelled) break;
    const charCode = sampled[i].charCodeAt(0);
    const pitchVariation = (charCode % 5 - 2) * 12; // ±24 Hz
    const freq = BLIP_BASE_FREQ + pitchVariation;

    const osc = ctx.createOscillator();
    osc.type = "sine"; // 둥글고 부드러운 톤
    osc.frequency.value = freq;

    // 도토리 "톡" 느낌: 시작 시 높은 주파수에서 빠르게 내려오기
    const startTime = ctx.currentTime + i * BLIP_INTERVAL;
    osc.frequency.setValueAtTime(freq * 1.5, startTime);
    osc.frequency.exponentialRampToValueAtTime(freq, startTime + 0.015);

    // 짧은 엔벨로프 — 톡 하고 사라지는 느낌
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.4, startTime);
    env.gain.exponentialRampToValueAtTime(0.001, startTime + BLIP_DURATION);

    osc.connect(env);
    env.connect(masterGain);
    osc.start(startTime);
    osc.stop(startTime + BLIP_DURATION + 0.01);
    oscillators.push(osc);
  }

  const totalDuration = sampled.length * BLIP_INTERVAL;

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
