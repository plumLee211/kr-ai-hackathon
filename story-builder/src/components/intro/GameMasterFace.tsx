export function GameMasterFace({ step }: { step: number }) {
  void step;

  return (
    <div
      className="absolute top-[3%] left-1/2 -translate-x-1/2 z-[1]
                 w-[65vw] max-w-[947px] aspect-[947/1419]
                 rounded-[50%] bg-red-500 opacity-90"
    />
  );
}
