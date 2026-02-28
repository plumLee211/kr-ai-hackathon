"use client";

import { useState } from "react";

interface DialogBoxProps {
  message: string;
  onEnter: (value: string) => void;
  isFinished: boolean;
}

export function DialogBox({ message, onEnter, isFinished }: DialogBoxProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 띄어쓰기 입력을 위해 e.nativeEvent.isComposing 체크 (한글 입력 시 두번 입력 방지)
    if (e.key === "Enter" && inputValue.trim() !== "" && !e.nativeEvent.isComposing) {
      onEnter(inputValue.trim());
      setInputValue("");
    }
  };

  if (isFinished) {
    return (
      <div className="relative z-10 border-2 border-white p-8 w-full max-w-2xl bg-black/50 text-center animate-pulse cursor-pointer">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-widest">PRESS START</h2>
        <p className="text-gray-400 text-sm mt-4">클릭 시 Gemini API 생성 시작 (작업 예정)</p>
      </div>
    );
  }

  return (
    <div className="relative z-10 border-2 border-gray-400 p-6 w-full max-w-2xl bg-black/80 font-mono flex flex-col gap-6 shadow-2xl">
      <p className="text-white text-lg min-h-[4rem] whitespace-pre-wrap leading-relaxed">
        {message}
      </p>
      <div className="flex items-center text-green-400 text-xl">
        <span className="mr-3 font-bold">{">"}</span>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-transparent outline-none flex-1 text-green-400 placeholder-green-800/50"
          placeholder="입력 후 Enter를 누르세요..."
          autoFocus
        />
      </div>
    </div>
  );
}
