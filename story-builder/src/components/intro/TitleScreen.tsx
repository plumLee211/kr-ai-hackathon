"use client";

import { motion } from "motion/react";

interface TitleScreenProps {
  onStart: () => void;
}

export function TitleScreen({ onStart }: TitleScreenProps) {
  return (
    <motion.div
      key="title"
      initial={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="relative flex flex-col items-center min-h-screen w-full bg-[#0A0A0A] overflow-hidden"
    >
      <div className="flex flex-col items-center pt-[18vh]">
        <h1
          className="text-[#444444] leading-[1.2]"
          style={{ fontSize: "clamp(28px, 5vw, 72px)", letterSpacing: "4px" }}
        >
          OOO&apos;s
        </h1>
        <h1
          className="text-[#333333] leading-[1.2]"
          style={{ fontSize: "clamp(28px, 5vw, 72px)", letterSpacing: "4px" }}
        >
          adventure
        </h1>

        <p
          className="text-[#2A2A2A] mt-[3.5vh]"
          style={{ fontSize: "clamp(7px, 0.7vw, 10px)", letterSpacing: "2px" }}
        >
          with Gemini Story Builder
        </p>

        <button
          onClick={onStart}
          className="animate-blink mt-[7vh] cursor-pointer text-[#555555]"
          style={{ fontSize: "clamp(10px, 1vw, 14px)", letterSpacing: "3px" }}
        >
          PRESS &nbsp;START
        </button>
      </div>
    </motion.div>
  );
}
