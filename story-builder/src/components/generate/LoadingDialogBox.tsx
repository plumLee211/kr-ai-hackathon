"use client";

import { useState, useEffect, useRef } from "react";
import { GmLabel } from "../intro/GmLabel";

interface LoadingDialogBoxProps {
  message: string;
}

export function LoadingDialogBox({ message }: LoadingDialogBoxProps) {
  const [displayedChars, setDisplayedChars] = useState(0);
  const prevMessageRef = useRef(message);

  // Reset typewriter when message changes
  useEffect(() => {
    if (message !== prevMessageRef.current) {
      setDisplayedChars(0);
      prevMessageRef.current = message;
    }
  }, [message]);

  // Typewriter effect: reveal one character at a time
  useEffect(() => {
    if (displayedChars >= message.length) return;
    const timer = setTimeout(() => {
      setDisplayedChars((prev) => prev + 1);
    }, 40);
    return () => clearTimeout(timer);
  }, [displayedChars, message]);

  const visibleText = message.slice(0, displayedChars);
  const isTyping = displayedChars < message.length;

  return (
    <div className="relative border border-[#2A2A2A] bg-[#0A0A0ACC] p-6 pt-5 w-full font-mono flex flex-col gap-4 shadow-2xl backdrop-blur-sm">
      <GmLabel />

      {/* GENERATING... label (replaces ProgressDots) */}
      <div className="absolute -top-3 right-4 flex items-center gap-1.5 px-3 py-0.5 bg-[#0A0A0A] border border-[#2A2A2A]">
        <span className="text-[10px] text-yellow-400 animate-blink tracking-widest">
          GENERATING...
        </span>
      </div>

      {/* GM message with typewriter */}
      <p className="text-gray-200 text-base min-h-[3rem] whitespace-pre-wrap leading-[1.8]">
        {visibleText}
        {isTyping && <span className="inline-block w-[8px] h-[14px] bg-green-400 ml-[2px] animate-blink align-middle" />}
      </p>
    </div>
  );
}
