export function GameMasterFace({ step }: { step: number }) {
  // 스텝이 올라갈 때마다 게임 마스터 얼굴 색상 변화
  const colors = [
    "text-gray-500", // 0
    "text-blue-400", // 1
    "text-purple-400", // 2
    "text-pink-400", // 3
    "text-yellow-400", // 4
  ];
  
  const faceColor = colors[step] || colors[0];

  return (
    <div className="relative z-10 flex flex-col items-center mb-6">
      <div className={`font-mono text-3xl font-bold tracking-widest ${faceColor} transition-colors duration-1000`}>
        [ ✦◇✦ ]
      </div>
      <div className={`text-sm font-bold mt-2 ${faceColor} transition-colors duration-1000`}>
        Game Master
      </div>
    </div>
  );
}
