import Image from "next/image";

const GM_IMAGES = {
  idle: "/game-master/idle.webp",
  greeting: "/game-master/greeting.webp",
  asking: "/game-master/asking.webp",
  thinking: "/game-master/thinking.webp",
  surprised: "/game-master/surprised.webp",
  ok: "/game-master/ok.webp",
  celebrate: "/game-master/celebrate.webp",
} as const;

export type GMPose = keyof typeof GM_IMAGES;

export function GameMasterFace({
  step,
  pose = "asking",
}: {
  step: number;
  pose?: GMPose;
}) {
  void step;

  return (
    <div
      className="absolute top-[3%] left-1/2 -translate-x-1/2 z-[1]
                 w-[65vw] max-w-[947px] aspect-[947/1419]
                 rounded-[50%] overflow-hidden opacity-90"
    >
      <Image
        src={GM_IMAGES[pose]}
        alt="Game Master"
        fill
        className="object-cover"
        priority
      />
    </div>
  );
}
