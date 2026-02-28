"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { TitleScreen } from "./TitleScreen";
import { GameMasterScreen } from "./GameMasterScreen";
import { ScreenIndicator } from "./ScreenIndicator";
import type { GMPose } from "./GameMasterFace";
import {
  SURVEY_FIELDS,
  createEmptyFields,
  toAnswers,
  type CollectedFields,
  type ChatMessage,
} from "@/constants/survey";
import type { GenerateResult } from "@/types/generate";

type Phase = "title" | "game-master";

export function IntroContainer() {
  const [phase, setPhase] = useState<Phase>("title");
  const [collectedFields, setCollectedFields] =
    useState<CollectedFields>(createEmptyFields);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [placeholder, setPlaceholder] = useState("이름을 입력해줘...");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [allCollected, setAllCollected] = useState(false);
  const [generateResult, setGenerateResult] = useState<GenerateResult | null>(
    null,
  );
  const [gmPose, setGmPose] = useState<GMPose>("greeting");

  const step = SURVEY_FIELDS.filter((k) => collectedFields[k] !== null).length;

  // Game Master phase 진입 시 Gemini 첫 인사 요청
  useEffect(() => {
    if (phase !== "game-master") return;

    const fetchGreeting = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [],
            collectedFields: createEmptyFields(),
          }),
        });
        const data = await res.json();
        setCurrentMessage(data.gmMessage);
        setPlaceholder(data.placeholder);
        setGmPose(data.gmPose || "greeting");
        setChatHistory([{ role: "model", content: data.gmMessage }]);
      } catch {
        setCurrentMessage(
          "안녕! 나는 Game Master야.\n너만의 모험을 같이 만들어볼까?\n먼저 이름을 알려줘!",
        );
      }
      setIsLoading(false);
    };
    fetchGreeting();
  }, [phase]);

  const handleStart = () => setPhase("game-master");

  const handleUserInput = async (value: string) => {
    if (isLoading) return;
    setIsLoading(true);

    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { role: "user", content: value },
    ];
    setChatHistory(newHistory);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory, collectedFields }),
      });
      const data = await res.json();

      setCollectedFields(data.collectedFields);
      setCurrentMessage(data.gmMessage);
      setPlaceholder(data.placeholder);
      setGmPose(data.gmPose || "idle");
      setChatHistory([
        ...newHistory,
        { role: "model", content: data.gmMessage },
      ]);

      if (data.allCollected) setAllCollected(true);
    } catch {
      setCurrentMessage("어... 잠깐, 마법이 좀 꼬였나봐.\n다시 한번 말해줄래?");
    }
    setIsLoading(false);
  };

  const handleStartGenerate = async () => {
    setIsGenerating(true);
    try {
      const answers = toAnswers(collectedFields);
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      if (!response.ok) throw new Error("API 오류 발생");

      const result: GenerateResult = await response.json();
      setGenerateResult(result);
    } catch {
      setCurrentMessage("세계 생성에 실패했습니다... 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Result screen (post-generation) ──
  if (generateResult) {
    return (
      <div className="relative flex flex-col items-center min-h-screen w-full p-4 py-12 overflow-auto">
        <ScreenIndicator step={step} />

        <div className="relative z-10 w-full max-w-5xl space-y-10">
          <h2 className="text-2xl font-bold text-white tracking-widest text-center font-mono">
            ─── YOUR PARTY ───
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {generateResult.party.map((member) => (
              <div
                key={member.id}
                className="border border-green-500/50 bg-black/80 rounded-lg overflow-hidden backdrop-blur-sm flex flex-col"
              >
                <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-green-900/30 to-black/60 flex items-center justify-center border-b border-green-500/30">
                  <div className="text-green-600/40 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                    <span className="text-xs font-mono">IMAGE</span>
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div>
                    <div className="text-lg font-bold text-white font-mono tracking-wide">{member.name}</div>
                    <div className="text-xs text-green-400/80 font-mono uppercase tracking-widest">{member.role}</div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-500">
                        <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                      </svg>
                      <span className="text-sm font-mono text-red-400">{member.hp}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-orange-400">
                        <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.177A7.547 7.547 0 0 1 6.648 6.61a.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.718Z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-mono text-orange-300">{member.atk}</span>
                    </div>
                  </div>
                  <div className="mt-auto pt-3 border-t border-green-500/20">
                    <p className="text-xs text-gray-400 leading-relaxed italic">
                      &ldquo;{member.description}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <h2 className="text-2xl font-bold text-red-400 tracking-widest text-center font-mono mb-6">
              ─── BOSS ───
            </h2>
            <div className="border border-red-600/60 bg-black/80 rounded-lg overflow-hidden backdrop-blur-sm max-w-sm mx-auto shadow-[0_0_30px_rgba(220,38,38,0.15)]">
              <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-red-900/40 to-black/70 flex items-center justify-center border-b border-red-600/30">
                <div className="text-red-600/40 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 mx-auto mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  <span className="text-xs font-mono">IMAGE</span>
                </div>
              </div>
              <div className="p-5 flex flex-col gap-3">
                <div>
                  <div className="text-xl font-bold text-red-300 font-mono tracking-wide">{generateResult.boss.name}</div>
                  <div className="text-xs text-red-400/70 font-mono uppercase tracking-widest">{generateResult.boss.role}</div>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-500">
                      <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                    </svg>
                    <span className="text-sm font-mono text-red-400">{generateResult.boss.hp}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-orange-400">
                      <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.177A7.547 7.547 0 0 1 6.648 6.61a.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.718Z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-mono text-orange-300">{generateResult.boss.atk}</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-red-600/20">
                  <p className="text-xs text-gray-400 leading-relaxed italic">
                    &ldquo;{generateResult.boss.description}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main phase orchestration with AnimatePresence ──
  return (
    <AnimatePresence mode="wait">
      {phase === "title" ? (
        <TitleScreen onStart={handleStart} />
      ) : (
        <GameMasterScreen
          step={step}
          allCollected={allCollected}
          isGenerating={isGenerating}
          currentMessage={currentMessage}
          placeholder={placeholder}
          isLoading={isLoading}
          gmPose={gmPose}
          onUserInput={handleUserInput}
          onStartGenerate={handleStartGenerate}
        />
      )}
    </AnimatePresence>
  );
}
