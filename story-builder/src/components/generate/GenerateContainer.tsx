"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { GameMasterFace, LOADING_POSES, type GMPose } from "../intro/GameMasterFace";
import { GameHeader } from "./GameHeader";
import { LoadingDialogBox } from "./LoadingDialogBox";
import { ResultCards } from "./ResultCards";
import type { Answers } from "@/constants/survey";
import type { GenerateResult } from "@/types/generate";
import type { StoryBible } from "@/types/story";

type Phase = "loading" | "result" | "error";

const GM_LOADING_MESSAGES = [
  "너의 캐릭터가 만들어지는 중이네! 하하!",
  "음... 어떤 동료가 좋을까 고민중이야...",
  "보스 몬스터도 하나 준비해야지!",
  "거의 다 됐어! 조금만 기다려줘~",
  "마법의 힘으로 세계를 창조하는 중...",
  "네 모험이 곧 시작될 거야!",
  "흥미로운 파티가 구성되고 있어...",
  "이 조합이면... 꽤 강할지도?",
];

export function GenerateContainer() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [answers, setAnswers] = useState<Answers | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [gmPose, setGmPose] = useState<GMPose>("loading1");
  const [messageIndex, setMessageIndex] = useState(0);

  // Cycle loading poses & messages every 3 seconds
  useEffect(() => {
    if (phase !== "loading") return;
    const interval = setInterval(() => {
      setGmPose((prev) => {
        const idx = LOADING_POSES.indexOf(prev as (typeof LOADING_POSES)[number]);
        return LOADING_POSES[(idx + 1) % LOADING_POSES.length];
      });
      setMessageIndex((prev) => (prev + 1) % GM_LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [phase]);

  // Read sessionStorage and call generate API on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("storybuilder_answers");
    if (!stored) {
      router.replace("/");
      return;
    }

    const parsed: Answers = JSON.parse(stored);
    setAnswers(parsed);

    const storedBible = sessionStorage.getItem("storybuilder_story_bible");
    const storyBible: StoryBible | null = storedBible ? JSON.parse(storedBible) : null;

    const generate = async () => {
      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...parsed, ...(storyBible ? { storyBible } : {}) }),
        });
        if (!response.ok) throw new Error("API error");
        const data: GenerateResult = await response.json();
        console.log("[GenerateResult]", JSON.stringify(data, null, 2));
        setResult(data);
        setPhase("result");
      } catch {
        setPhase("error");
      }
    };
    generate();
  }, [router]);


  return (
    <div className="relative min-h-screen w-full bg-[#0A0A0A] overflow-hidden">
      {/* Game HUD header */}
      {phase === "result" && (
        <GameHeader name={answers?.name ?? "???"} />
      )}

      <AnimatePresence mode="wait">
        {/* ── Loading Phase ── */}
        {phase === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.01 }}
            className="relative min-h-screen w-full"
          >
            {/* GM face */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.01, delay: 0.3 }}
            >
              <GameMasterFace step={5} pose={gmPose} />
            </motion.div>

            {/* Loading dialog */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-[1200px] px-4">
              <LoadingDialogBox message={GM_LOADING_MESSAGES[messageIndex]} />
            </div>
          </motion.div>
        )}

        {/* ── Result Phase ── */}
        {phase === "result" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.01 }}
          >
            <ResultCards party={result.party} boss={result.boss} />
          </motion.div>
        )}

        {/* ── Error Phase ── */}
        {phase === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.01 }}
            className="relative z-10 flex flex-col items-center justify-center min-h-screen"
          >
            <p className="text-red-400 text-lg font-mono mb-6">
              세계 생성에 실패했습니다...
            </p>
            <button
              onClick={() => {
                setPhase("loading");
                const stored = sessionStorage.getItem("storybuilder_answers");
                if (stored) {
                  const parsed: Answers = JSON.parse(stored);
                  const retryBible = sessionStorage.getItem("storybuilder_story_bible");
                  const retryStoryBible: StoryBible | null = retryBible ? JSON.parse(retryBible) : null;
                  fetch("/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...parsed, ...(retryStoryBible ? { storyBible: retryStoryBible } : {}) }),
                  })
                    .then((res) => {
                      if (!res.ok) throw new Error();
                      return res.json();
                    })
                    .then((data: GenerateResult) => {
                      setResult(data);
                      setPhase("result");
                    })
                    .catch(() => setPhase("error"));
                }
              }}
              className="text-yellow-400 border border-yellow-400/50 px-6 py-3 font-mono animate-blink cursor-pointer hover:bg-yellow-400/10"
            >
              RETRY
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
