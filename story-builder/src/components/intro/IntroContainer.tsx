"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { TitleScreen } from "./TitleScreen";
import { GameMasterScreen } from "./GameMasterScreen";
import { AdventureTitle } from "./AdventureTitle";
import { ScreenIndicator } from "./ScreenIndicator";
import { PixelCityBackground } from "../background/PixelCityBackground";
import { DarkCityBackground } from "../background/DarkCityBackground";
import type { GMPose } from "./GameMasterFace";
import {
  SURVEY_FIELDS,
  createEmptyFields,
  toAnswers,
  type CollectedFields,
  type ChatMessage,
} from "@/constants/survey";
import type { StoryBible } from "@/types/story";
import { useGmVoice } from "@/hooks/useGmVoice";
import { useBgm } from "@/hooks/useBgm";

type Phase = "title" | "game-master";

export function IntroContainer() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("title");
  const [collectedFields, setCollectedFields] =
    useState<CollectedFields>(createEmptyFields);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [placeholder, setPlaceholder] = useState("이름을 입력해줘...");
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [allCollected, setAllCollected] = useState(false);
  const [showPressStart, setShowPressStart] = useState(false);
  const [showFinal, setShowFinal] = useState(false);
  const [storyBible, setStoryBible] = useState<StoryBible | null>(null);
  const [gmPose, setGmPose] = useState<GMPose>("greeting");
  const { unlock, prefetch, stop } = useGmVoice();
  const bgm = useBgm();

  const step = SURVEY_FIELDS.filter((k) => collectedFields[k] !== null).length;

  // User clicks proceed button after reading GM closing message
  const handleProceed = () => {
    setShowPressStart(true);
    setTimeout(() => setShowFinal(true), 1000);
  };

  // Compute title variant
  const titleVariant =
    phase === "title"
      ? "hero"
      : showFinal
        ? "final"
        : "top";

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
        const pose: GMPose = data.gmPose || "greeting";
        // Prefetch TTS while still loading — audio ready before text appears
        const play = await prefetch(data.gmMessage, pose);
        // Show text + play voice simultaneously
        setCurrentMessage(data.gmMessage);
        setPlaceholder(data.placeholder);
        setGmPose(pose);
        setChatHistory([{ role: "model", content: data.gmMessage }]);
        play();
      } catch {
        setCurrentMessage(
          "안녕! 나는 Game Master야.\n너만의 모험을 같이 만들어볼까?\n먼저 이름을 알려줘!",
        );
      }
      setIsLoading(false);
    };
    fetchGreeting();
  }, [phase]);

  // Story Engine: 새 필드가 수집될 때마다 백그라운드에서 Story Bible 증분 빌드
  useEffect(() => {
    const collectedCount = SURVEY_FIELDS.filter((k) => collectedFields[k] !== null).length;
    // mbti(2번째)가 수집된 이후부터 빌드 시작
    if (collectedCount < 2) return;

    const buildStory = async () => {
      try {
        const res = await fetch("/api/story", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collectedFields }),
        });
        if (!res.ok) return;
        const bible = await res.json() as StoryBible;
        setStoryBible(bible);
      } catch {
        // silent fail — story engine is non-blocking
      }
    };

    buildStory();
  }, [collectedFields]);

  // BGM: allCollected 시 개인화 테마송 생성 + 재생
  useEffect(() => {
    if (!allCollected) return;
    const mood = storyBible?.characters?.hero_flaw
      ? `Cute cheerful 8-bit JRPG town theme, playful chiptune melody with light xylophone and pizzicato strings, warm and whimsical but slightly adventurous`
      : `Cute cheerful 8-bit JRPG town theme, playful chiptune melody with gentle bells and soft percussion, warm and whimsical`;
    bgm.play(mood);
    return () => bgm.stop();
  }, [allCollected]);

  // GM TTS 볼륨 덕킹: GM 말할 때 BGM 낮추기
  useEffect(() => {
    if (!allCollected) return;
    bgm.setVolume(isLoading ? 0.6 : 0.3);
  }, [isLoading, allCollected]);

  // Cleanup: stop audio on unmount
  useEffect(() => {
    return () => { stop(); bgm.stop(); };
  }, [stop]);

  const handleStart = () => {
    unlock(); // unlock browser autoplay on user gesture
    setPhase("game-master");
  };

  const handleUserInput = async (value: string) => {
    if (isLoading) return;
    stop(); // 재생 중인 GM 음성 즉시 중단
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

      const pose: GMPose = data.gmPose || "idle";
      // Prefetch TTS while still loading — audio ready before text appears
      const play = await prefetch(data.gmMessage, pose);
      // Show text + play voice simultaneously
      setCollectedFields(data.collectedFields);
      setCurrentMessage(data.gmMessage);
      setPlaceholder(data.placeholder);
      setGmPose(pose);
      setChatHistory([
        ...newHistory,
        { role: "model", content: data.gmMessage },
      ]);
      play();

      if (data.allCollected) setAllCollected(true);
    } catch {
      setCurrentMessage("어... 잠깐, 마법이 좀 꼬였나봐.\n다시 한번 말해줄래?");
    }
    setIsLoading(false);
  };

  const handleStartGenerate = () => {
    setIsNavigating(true);
    const answers = toAnswers(collectedFields);
    sessionStorage.setItem("storybuilder_answers", JSON.stringify(answers));
    if (storyBible) {
      sessionStorage.setItem("storybuilder_story_bible", JSON.stringify(storyBible));
    }
    router.push("/generate");
  };

  // ── Main phase orchestration ──
  return (
    <div className="relative min-h-screen w-full bg-[#0A0A0A] overflow-hidden">
      {/* Background crossfade: dark city → bright 세빛섬 */}
      <AnimatePresence mode="wait">
        {showFinal ? (
          <motion.div
            key="pixel-city-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-0"
          >
            <PixelCityBackground />
          </motion.div>
        ) : (
          <motion.div
            key="dark-city-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-0"
          >
            <DarkCityBackground />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent title — rendered outside AnimatePresence */}
      <AdventureTitle
        variant={titleVariant}
        step={step}
        name={collectedFields.name}
      />

      {/* Phase screens */}
      <AnimatePresence mode="wait">
        {phase === "title" ? (
          <TitleScreen onStart={handleStart} />
        ) : (
          <GameMasterScreen
            step={step}
            surveyDone={allCollected}
            showPressStart={showPressStart}
            isGenerating={isNavigating}
            currentMessage={currentMessage}
            placeholder={placeholder}
            isLoading={isLoading}
            gmPose={gmPose}
            onUserInput={handleUserInput}
            onProceed={handleProceed}
            onStartGenerate={handleStartGenerate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
