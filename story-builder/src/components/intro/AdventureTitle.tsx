"use client";

import { motion, AnimatePresence } from "motion/react";

type TitleVariant = "hero" | "top" | "final";

interface AdventureTitleProps {
  variant: TitleVariant;
  step: number;
  name: string | null;
}

const titleVariants = {
  hero: {
    top: "18vh",
    scale: 1,
    opacity: 1,
  },
  top: {
    top: "24px",
    scale: 0.45,
    opacity: 1,
  },
  final: {
    top: "15vh",
    scale: 1.4,
    opacity: 1,
  },
};

export function AdventureTitle({ variant, step, name }: AdventureTitleProps) {
  const displayName = name ?? "OOO";
  const totalSteps = 5;
  const progress = Math.min(step / totalSteps, 1);
  const isFinal = variant === "final";

  return (
    <motion.div
      className="absolute left-0 right-0 z-20 flex flex-col items-center pointer-events-none"
      style={{ transformOrigin: "center top" }}
      animate={{
        top: titleVariants[variant].top,
        scale: titleVariants[variant].scale,
        opacity: titleVariants[variant].opacity,
      }}
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 20,
        mass: 1,
      }}
    >
      {/* Subtle dark backdrop for readability on bright backgrounds */}
      {isFinal && (
        <div
          className="absolute inset-0 -inset-x-8 -inset-y-4 rounded-2xl bg-black/65"
        />
      )}

      {/* Name line: "OOO's" or "{name}'s" */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.h1
            key={displayName}
            initial={{ opacity: 0, filter: "blur(8px)", y: -10 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            exit={{ opacity: 0, filter: "blur(8px)", y: 10 }}
            transition={{ duration: 0.4 }}
            className="relative leading-[1.2] drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
            style={{
              fontSize: "clamp(28px, 5vw, 72px)",
              letterSpacing: "4px",
            }}
          >
            {/* Base layer: white/gray text (fades out as steps progress) */}
            <span
              className="text-white/90 transition-opacity duration-700"
              style={{ opacity: 1 - progress }}
            >
              {displayName}&apos;s
            </span>

            {/* Gradient overlay layer (fades in as steps progress) */}
            <span
              className="absolute inset-0 transition-opacity duration-700"
              style={{
                opacity: progress,
                background:
                  "linear-gradient(90deg, #4285F4, #A259FF, #FF4FCB)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
              aria-hidden
            >
              {displayName}&apos;s
            </span>
          </motion.h1>
        </AnimatePresence>
      </div>

      {/* "adventure" line */}
      <div className="relative">
        <h1
          className={`leading-[1.2] drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] transition-opacity duration-700 ${
            isFinal ? "gemini-glow" : ""
          }`}
          style={{
            fontSize: "clamp(28px, 5vw, 72px)",
            letterSpacing: "4px",
          }}
        >
          {/* Base layer */}
          <span
            className="text-white/80 transition-opacity duration-700"
            style={{ opacity: 1 - progress }}
          >
            adventure
          </span>

          {/* Gradient overlay */}
          <span
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              opacity: progress,
              background:
                "linear-gradient(90deg, #4285F4, #A259FF, #FF4FCB)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
            aria-hidden
          >
            adventure
          </span>
        </h1>
      </div>
    </motion.div>
  );
}
