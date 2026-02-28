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
      className="relative flex flex-col items-center min-h-screen w-full overflow-hidden"
    >
      <div className="relative z-10 flex flex-col items-center pt-[38vh]">
        <p
          className="text-white/40 mt-[3.5vh] drop-shadow-[0_0_10px_rgba(0,0,0,0.9)]"
          style={{ fontSize: "clamp(7px, 0.7vw, 10px)", letterSpacing: "2px" }}
        >
          with Gemini Story Builder
        </p>

        <button
          onClick={onStart}
          className="animate-blink mt-[7vh] cursor-pointer text-white/70 drop-shadow-[0_0_10px_rgba(0,0,0,0.9)]"
          style={{ fontSize: "clamp(10px, 1vw, 14px)", letterSpacing: "3px" }}
        >
          PRESS &nbsp;START
        </button>
      </div>
    </motion.div>
  );
}
