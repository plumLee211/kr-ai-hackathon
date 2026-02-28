"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ScreenIndicator } from "./ScreenIndicator";
import { GameMasterFace, LOADING_POSES, type GMPose } from "./GameMasterFace";
import { DialogBox } from "./DialogBox";

interface GameMasterScreenProps {
  step: number;
  allCollected: boolean;
  isGenerating: boolean;
  currentMessage: string;
  placeholder: string;
  isLoading: boolean;
  gmPose: GMPose;
  onUserInput: (value: string) => void;
  onStartGenerate: () => void;
}

export function GameMasterScreen({
  step,
  allCollected,
  isGenerating,
  currentMessage,
  placeholder,
  isLoading,
  gmPose,
  onUserInput,
  onStartGenerate,
}: GameMasterScreenProps) {
  const [loadingPose, setLoadingPose] = useState<GMPose>("loading1");

  useEffect(() => {
    if (isLoading) {
      const random = LOADING_POSES[Math.floor(Math.random() * LOADING_POSES.length)];
      setLoadingPose(random);
    }
  }, [isLoading]);

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

      {/* Game Master face - hidden when all collected */}
      {!allCollected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <GameMasterFace step={step} pose={isLoading ? loadingPose : gmPose} />
        </motion.div>
      )}

      {/* Dialog area - bottom fixed */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-[1200px] px-4">
        {allCollected ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
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
        ) : (
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
