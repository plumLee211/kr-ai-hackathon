"use client";

import { useState, useEffect } from "react";
import { ScreenIndicator } from "./ScreenIndicator";
import { GameMasterFace } from "./GameMasterFace";
import { DialogBox } from "./DialogBox";
import {
  SURVEY_FIELDS,
  createEmptyFields,
  isAllCollected,
  toAnswers,
  type CollectedFields,
  type ChatMessage,
} from "@/constants/survey";
import type { GenerateResult } from "@/types/generate";

export function IntroContainer() {
  const [collectedFields, setCollectedFields] = useState<CollectedFields>(createEmptyFields);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [placeholder, setPlaceholder] = useState("이름을 입력해줘...");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [allCollected, setAllCollected] = useState(false);
  const [generateResult, setGenerateResult] = useState<GenerateResult | null>(null);

  // step을 수집된 필드 수에서 파생 (0 ~ SURVEY_FIELDS.length)
  const step = SURVEY_FIELDS.filter((k) => collectedFields[k] !== null).length;

  // 마운트 시 Gemini 첫 인사 요청
  useEffect(() => {
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
        setChatHistory([{ role: "model", content: data.gmMessage }]);
      } catch {
        setCurrentMessage("안녕! 나는 Game Master야.\n너만의 모험을 같이 만들어볼까?\n먼저 이름을 알려줘!");
      }
      setIsLoading(false);
    };
    fetchGreeting();
  }, []);

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
        body: JSON.stringify({
          messages: newHistory,
          collectedFields,
        }),
      });
      const data = await res.json();

      setCollectedFields(data.collectedFields);
      setCurrentMessage(data.gmMessage);
      setPlaceholder(data.placeholder);
      setChatHistory([...newHistory, { role: "model", content: data.gmMessage }]);

      if (data.allCollected) {
        setAllCollected(true);
      }
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

      if (!response.ok) {
        throw new Error("API 오류 발생");
      }

      const result: GenerateResult = await response.json();
      setGenerateResult(result);
    } catch {
      setCurrentMessage("세계 생성에 실패했습니다... 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (generateResult) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen w-full p-4 overflow-hidden">
        <ScreenIndicator step={step} />

        <div className="relative z-10 w-full max-w-4xl space-y-8">
          {/* 파티원 카드 */}
          <h2 className="text-2xl font-bold text-white tracking-widest text-center font-mono">
            ─── YOUR PARTY ───
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {generateResult.party.map((member) => (
              <div
                key={member.id}
                className="border-2 border-green-400 bg-black/80 p-4 font-mono text-green-400"
              >
                <div className="text-lg font-bold text-white">{member.name}</div>
                <div className="text-sm text-gray-400 mb-2">{member.role}</div>
                <div className="flex gap-4 text-sm mb-2">
                  <span>HP: {member.hp}</span>
                  <span>ATK: {member.atk}</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {member.description}
                </p>
              </div>
            ))}
          </div>

          {/* 보스 카드 */}
          <h2 className="text-2xl font-bold text-red-400 tracking-widest text-center font-mono">
            ─── BOSS ───
          </h2>
          <div className="border-2 border-red-600 bg-black/80 p-6 font-mono text-red-400 max-w-md mx-auto">
            <div className="text-xl font-bold text-red-300">{generateResult.boss.name}</div>
            <div className="text-sm text-red-400/70 mb-2">{generateResult.boss.role}</div>
            <div className="flex gap-4 text-sm mb-2">
              <span>HP: {generateResult.boss.hp}</span>
              <span>ATK: {generateResult.boss.atk}</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {generateResult.boss.description}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full p-4 overflow-hidden">

      {/* 1. 배경 연출 + 현재 화면 상태 텍스트 (단순화 버전) */}
      <ScreenIndicator step={step} />

      {/* 2. 게임 마스터 얼굴 (완료 전까지만 표시) */}
      {!allCollected && <GameMasterFace step={step} />}

      {/* 3. 대화창 (질문 출력 및 사용자 입력) 또는 PRESS START 버튼 */}
      {allCollected ? (
        <div
          onClick={!isGenerating ? handleStartGenerate : undefined}
          className={`relative z-10 border-2 border-white p-8 w-full max-w-2xl bg-black/50 text-center ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'animate-pulse cursor-pointer hover:bg-white/10'}`}
        >
          <h2 className="text-3xl font-bold text-white mb-2 tracking-widest">
            {isGenerating ? "GENERATING WORLD..." : "PRESS START"}
          </h2>
          <p className="text-gray-400 text-sm mt-4">
            {isGenerating ? "Gemini가 세계를 창조하고 있습니다..." : "클릭 시 Gemini API 생성 시작"}
          </p>
        </div>
      ) : (
        <DialogBox
          message={currentMessage}
          onEnter={handleUserInput}
          isFinished={false}
          placeholder={placeholder}
          isLoading={isLoading}
        />
      )}

      {/* 4. 실시간 수집 데이터 확인 패널 (개발 완료 시 숨김 처리 필요) */}
      <div className="absolute bottom-4 right-4 z-10 text-xs font-mono text-green-400 bg-black/70 p-4 border border-green-800 rounded">
        <div className="font-bold text-gray-500 mb-2">[수집된 설정 데이터]</div>
        <pre>{JSON.stringify(collectedFields, null, 2)}</pre>
      </div>

    </div>
  );
}
