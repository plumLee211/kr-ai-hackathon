"use client";

import { useState } from "react";
import { ScreenIndicator } from "./ScreenIndicator";
import { GameMasterFace } from "./GameMasterFace";
import { DialogBox } from "./DialogBox";
import { Answers } from "./types";

const MAX_STEP = 4;

export function IntroContainer() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    name: "",
    mbti: "",
    animalFood: "",
    fear: "",
  });

  const handleNextStep = (value: string) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev };
      if (step === 0) newAnswers.name = value;
      if (step === 1) newAnswers.mbti = value;
      if (step === 2) newAnswers.animalFood = value;
      if (step === 3) newAnswers.fear = value;
      return newAnswers;
    });
    // 스텝 증가
    setStep((prev) => Math.min(prev + 1, MAX_STEP));
  };

  const getMessage = () => {
    switch (step) {
      case 0:
        return `안녕! 나는 Game Master야.\n너만의 모험을 같이 만들어볼까?\n먼저 이름을 알려줘!`;
      case 1:
        return `${answers.name}! 좋은 이름이다!\nMBTI가 뭐야? 동료 캐릭터를 만들어줄게!`;
      case 2:
        return `오~ ${answers.mbti}구나!\n좋아하는 동물과 음식은 뭐야?\n특별한 동료를 더 만들어줄게! (예: 강아지 떡볶이)`;
      case 3:
        return `그거 재밌네!\n마지막! 세상에서 제일 무서워하는 게 뭐야?\n네가 맞설 운명의 상대를 만들어줄게...`;
      default:
        return `자, 모든 준비가 끝났어!\n너만의 모험을 시작하자!`;
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full p-4 overflow-hidden">
      
      {/* 1. 배경 연출 + 현재 화면 상태 텍스트 (단순화 버전) */}
      <ScreenIndicator step={step} />

      {/* 2. 게임 마스터 얼굴 (완료 전까지만 표시) */}
      {step < MAX_STEP && <GameMasterFace step={step} />}

      {/* 3. 대화창 (질문 출력 및 사용자 입력) */}
      <DialogBox 
        message={getMessage()} 
        onEnter={handleNextStep} 
        isFinished={step >= MAX_STEP} 
      />

      {/* 4. 실시간 수집 데이터 확인 패널 (개발 완료 시 숨김 처리 필요) */}
      <div className="absolute bottom-4 right-4 z-10 text-xs font-mono text-green-400 bg-black/70 p-4 border border-green-800 rounded">
        <div className="font-bold text-gray-500 mb-2">[수집된 설정 데이터]</div>
        <pre>{JSON.stringify(answers, null, 2)}</pre>
      </div>
      
    </div>
  );
}
