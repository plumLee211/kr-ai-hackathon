"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { GeminiIcon } from "@/components/icons/GeminiIcon";
import { GmLabel } from "./GmLabel";
import { ProgressDots } from "./ProgressDots";

interface DialogBoxProps {
  message: string;
  onEnter: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  step: number;
}

export function DialogBox({
  message,
  onEnter,
  placeholder = "입력 후 Enter를 누르세요...",
  isLoading = false,
  step,
}: DialogBoxProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Enter" &&
      inputValue.trim() !== "" &&
      !e.nativeEvent.isComposing &&
      !isLoading
    ) {
      onEnter(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="relative border border-[#2A2A2A] bg-[#0A0A0ACC] p-6 pt-5 w-full font-mono flex flex-col gap-4 shadow-2xl backdrop-blur-sm"
    >
      {/* Labels */}
      <GmLabel />
      <ProgressDots step={step} />

      {/* Message */}
      <p className="text-gray-200 text-base min-h-[3rem] whitespace-pre-wrap leading-[1.8]">
        {isLoading ? (
          <span className="flex items-center gap-2 animate-pulse text-gray-500">
            <GeminiIcon size={18} />
            Loading...
          </span>
        ) : (
          message
        )}
      </p>

      {/* Input */}
      <div className="flex items-center text-green-400 text-lg border-t border-[#2A2A2A] pt-3">
        <span className="mr-2 font-bold text-green-500">{">"}</span>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="bg-transparent outline-none flex-1 text-green-400 placeholder-green-900/50 disabled:opacity-50 caret-green-400 text-base"
          placeholder={placeholder}
          autoFocus
        />
      </div>
    </motion.div>
  );
}
