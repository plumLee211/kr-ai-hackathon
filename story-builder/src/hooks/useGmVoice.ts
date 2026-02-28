import { useCallback, useRef } from "react";
import type { GMPose } from "@/components/intro/GameMasterFace";

const GM_TONE: Record<GMPose, string> = {
  greeting:  "Say warmly and welcomingly",
  asking:    "Say with curious, playful curiosity",
  surprised: "Say with dramatic surprise and excitement",
  ok:        "Say with calm approval",
  celebrate: "Say with great excitement and triumph",
  idle:      "Say naturally",
  thinking:  "Say thoughtfully and slowly",
  loading1:  "Say naturally",
  loading2:  "Say naturally",
  loading3:  "Say naturally",
  loading4:  "Say naturally",
};

export function useGmVoice() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string, pose?: GMPose) => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const tone = pose ? GM_TONE[pose] : "Say naturally";
    const styledText = `${tone}: ${text.replace(/\n/g, " ")}`;

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: styledText }),
      });
      if (!res.ok) return;

      const { audioData, mimeType } = await res.json();
      if (!audioData) return;

      const audio = new Audio(`data:${mimeType};base64,${audioData}`);
      audioRef.current = audio;
      await audio.play();
    } catch {
      // silent fail — TTS is non-blocking
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  return { speak, stop };
}
