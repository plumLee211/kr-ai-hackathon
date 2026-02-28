"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ScreenIndicator } from "./ScreenIndicator";
import { GameMasterFace, LOADING_POSES, type GMPose } from "./GameMasterFace";
import { DialogBox } from "./DialogBox";

interface GameMasterScreenProps {
  step: number;
  surveyDone: boolean;
  showPressStart: boolean;
  isGenerating: boolean;
  currentMessage: string;
  placeholder: string;
  isLoading: boolean;
  gmPose: GMPose;
  onUserInput: (value: string) => void;
  onProceed: () => void;
  onStartGenerate: () => void;
}

export function GameMasterScreen({
  step,
  surveyDone,
  showPressStart,
  isGenerating,
  currentMessage,
  placeholder,
  isLoading,
  gmPose,
  onUserInput,
  onProceed,
  onStartGenerate,
}: GameMasterScreenProps) {
  const loadingPoseRef = useRef<GMPose>(LOADING_POSES[0]);
  const prevIsLoadingRef = useRef(false);

  // isLoading이 false→true로 바뀌는 순간에만 랜덤 선택 (동기적, 리렌더 없음)
  if (isLoading && !prevIsLoadingRef.current) {
    loadingPoseRef.current = LOADING_POSES[Math.floor(Math.random() * LOADING_POSES.length)];
  }
  prevIsLoadingRef.current = isLoading;

  return (
    <motion.div
      key="game-master"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="relative min-h-screen w-full overflow-hidden"
    >
      {/* Background effects */}
      <ScreenIndicator step={step} />

      {/* Game Master face - fade out when PRESS START shown */}
      <AnimatePresence>
        {!showPressStart && (
          <motion.div
            key="gm-face"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6 }}
          >
            <GameMasterFace step={step} pose={isLoading ? loadingPoseRef.current : gmPose} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialog area - bottom fixed */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-[1200px] px-4">
        {showPressStart ? (
          /* Phase 3: PRESS START */
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            onClick={!isGenerating ? onStartGenerate : undefined}
            className={`border border-[#2A2A2A] bg-[#0A0A0ACC] p-8 w-full text-center backdrop-blur-sm ${
              isGenerating
                ? "opacity-50 cursor-not-allowed"
                : "animate-pulse cursor-pointer hover:bg-white/5"
            }`}
          >
            <h2 className="text-3xl font-bold text-white mb-2 tracking-widest">
              {isGenerating ? "GENERATING WORLD..." : "PRESS START"}
            </h2>
            <p className="text-gray-400 text-sm mt-4">
              {isGenerating
                ? "Gemini가 세계를 창조하고 있습니다..."
                : "클릭 시 Gemini API 생성 시작"}
            </p>
          </motion.div>
        ) : surveyDone ? (
          /* Phase 2: GM closing message + proceed button */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="border border-[#2A2A2A] bg-[#0A0A0ACC] p-6 w-full backdrop-blur-sm"
          >
            <p className="text-white font-mono text-sm leading-relaxed whitespace-pre-line mb-4">
              {currentMessage}
            </p>
            <button
              onClick={onProceed}
              className="w-full border border-yellow-400/50 text-yellow-400 py-3 font-mono tracking-widest cursor-pointer hover:bg-yellow-400/10 transition-colors animate-blink"
            >
              START ADVENTURE
            </button>
          </motion.div>
        ) : (
          /* Phase 1: Normal survey dialog */
          <DialogBox
            message={currentMessage}
            onEnter={onUserInput}
            placeholder={placeholder}
            isLoading={isLoading}
            step={step}
          />
        )}
      </div>
    </motion.div>
  );
}
