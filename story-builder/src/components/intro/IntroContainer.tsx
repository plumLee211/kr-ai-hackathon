"use client";

import { useState, useEffect } from "react";
import { ScreenIndicator } from "./ScreenIndicator";
import { GameMasterFace } from "./GameMasterFace";
import { DialogBox } from "./DialogBox";
import type { Answers, CollectedFields, ChatMessage } from "./types";

export function IntroContainer() {
  const [collectedFields, setCollectedFields] = useState<CollectedFields>({
    name: null,
    mbti: null,
    animalFood: null,
    fear: null,
  });
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [placeholder, setPlaceholder] = useState("이름을 입력해줘...");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [allCollected, setAllCollected] = useState(false);

  // step을 수집된 필드 수에서 파생
  const step = [
    collectedFields.name,
    collectedFields.mbti,
    collectedFields.animalFood,
    collectedFields.fear,
  ].filter(Boolean).length;

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
            collectedFields: { name: null, mbti: null, animalFood: null, fear: null },
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
      const answers: Answers = {
        name: collectedFields.name!,
        mbti: collectedFields.mbti!,
        animalFood: collectedFields.animalFood!,
        fear: collectedFields.fear!,
      };

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });

      if (!response.ok) {
        throw new Error("API 오류 발생");
      }

      const result = await response.json();
      console.log("Gemini API 생성 완료:", result);
      alert("콘솔창을 확인하세요! 파티와 보스 설정이 생성되었습니다.");
      // 추후 여기서 Zustand에 저장 후 페이지 이동 (라우팅) 처리
    } catch (error) {
      console.error("생성 실패:", error);
      alert("생성에 실패했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

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
