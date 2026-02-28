export function ScreenIndicator({ step }: { step: number }) {
  const indicators = [
    "[화면 연출: Step 0 - 완전한 어둠 (무채색)]",
    "[화면 연출: Step 1 - 미세한 보라빛 틴트 스며듦]",
    "[화면 연출: Step 2 - 보라 그라데이션 + 달 등장]",
    "[화면 연출: Step 3 - 마젠타 풀컬러]",
    "[화면 연출: Step 4 - ★ Gemini 4색 그라데이션 폭발 + BGM 시작! ★]",
  ];

  const bgColorClass = [
    "bg-black",
    "bg-[#110524]",
    "bg-gradient-to-b from-[#2b0b3a] to-black",
    "bg-gradient-to-b from-[#4a0438] to-[#1a0219]",
    "bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900",
  ];

  return (
    <>
      {/* 배경 색상 시뮬레이션 용도 */}
      <div className={`absolute inset-0 z-0 transition-colors duration-1000 ${bgColorClass[step] || bgColorClass[0]}`} />
      
      {/* 화면 상태 텍스트 표시 */}
      <div className="absolute top-4 left-4 z-10 text-xs font-mono text-gray-400/70 border border-gray-600 p-2 rounded bg-black/50">
        {indicators[step] || indicators[indicators.length - 1]}
      </div>
    </>
  );
}
