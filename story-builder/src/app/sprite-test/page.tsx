"use client";

import { useEffect, useRef } from "react";

export default function SpriteTestPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 브라우저가 도트 그래픽을 흐리게 처리하지 않도록 설정
    ctx.imageSmoothingEnabled = false;

    // 이미지 로드
    const img = new Image();
    img.src = "test-sprite.png"; // 아까 복사한 스프라이트 시트 이미지

    // 게임 루프 변수
    let x = 400 - 64; // 중앙(800의 절반) - 캐릭터 너비(128의 절반)
    let y = 300 - 64; // 중앙(600의 절반) - 캐릭터 높이(128의 절반)
    let direction = 1; // 0: 상(뒤), 1: 하(앞), 2: 좌, 3: 우
    let frame = 0;
    let isMoving = false;
    let lastTime = performance.now();
    let animationId: number;
    const keys: Record<string, boolean> = {};

    // 초록색 배경(크로마키)을 제거하는 함수
    const processChromaKey = (image: HTMLImageElement) => {
      const offCanvas = document.createElement("canvas");
      offCanvas.width = image.width;
      offCanvas.height = image.height;
      const offCtx = offCanvas.getContext("2d");
      if (!offCtx) return null;

      offCtx.drawImage(image, 0, 0);
      const imageData = offCtx.getImageData(0, 0, image.width, image.height);
      const data = imageData.data;

      // HSL 기반(또는 단순 RGB 비교)로 초록색 투명화 처리
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // 초록색이 지배적인 픽셀(형광 초록색 근처)을 투명하게 만듦 (G > 150, 그리고 R, B에 비해 월등히 높을 때)
        if (g > 150 && g > r + 30 && g > b + 30) {
          data[i + 3] = 0; // Alpha를 0(투명)으로
        }
      }
      offCtx.putImageData(imageData, 0, 0);
      return offCanvas;
    };

    img.onload = () => {
      // 투명 배경이 처리된 캔버스
      const spriteCanvas = processChromaKey(img);
      if (!spriteCanvas) return;

      // 이미지가 4x4 그리드이므로 너비/높이를 4등분
      const frameW = img.width / 4;
      const frameH = img.height / 4;

      // 화면에 그릴 크기 (기본 해상도가 1024x1024일 수 있으므로 적당히 축소)
      const renderW = 128;
      const renderH = 128;

      const loop = (time: number) => {
        isMoving = false;
        const speed = 4; // 이동 속도

        if (keys["ArrowUp"]) { y -= speed; direction = 0; isMoving = true; }
        else if (keys["ArrowDown"]) { y += speed; direction = 1; isMoving = true; }
        else if (keys["ArrowLeft"]) { x -= speed; direction = 2; isMoving = true; }
        else if (keys["ArrowRight"]) { x += speed; direction = 3; isMoving = true; }

        // 화면 밖으로 나가지 않게 제한
        x = Math.max(0, Math.min(canvas.width - renderW, x));
        y = Math.max(0, Math.min(canvas.height - renderH, y));

        // 걷는 애니메이션 (8 FPS = 125ms 간격)
        if (isMoving) {
          if (time - lastTime > 125) {
            frame = (frame + 1) % 4; // 0, 1, 2, 3 순환
            lastTime = time;
          }
        } else {
          frame = 0; // 가만히 있을 때는 첫 번째 프레임
        }

        // 화면 지우기 (배경색 칠하기)
        ctx.fillStyle = "#2c3e50";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 그리드 패턴 (바닥 느낌을 내기 위해)
        ctx.strokeStyle = "#34495e";
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 40) {
          ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        }
        for (let j = 0; j < canvas.height; j += 40) {
          ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
        }

        // 스프라이트 그리기 (방향키 0=상, 1=하, 2=좌, 3=우)
        ctx.drawImage(
          spriteCanvas,
          frame * frameW, direction * frameH, frameW, frameH, // 원본 이미지에서 자를 위치와 크기
          x, y, renderW, renderH                              // 캔버스에 그릴 위치와 크기
        );

        animationId = requestAnimationFrame(loop);      };

      // 루프 시작
      animationId = requestAnimationFrame(loop);
    };

    // 키보드 이벤트 리스너 등록
    const handleKeyDown = (e: KeyboardEvent) => { keys[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys[e.key] = false; };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 font-sans">
      <h1 className="text-3xl font-bold mb-2 text-yellow-400">Sprite Movement Test</h1>
      <p className="mb-6 text-gray-400">키보드의 화살표 키(⬆️ ⬇️ ⬅️ ➡️)를 사용하여 강아지 기사를 움직여보세요.</p>

      <div className="border-4 border-gray-700 rounded-xl overflow-hidden shadow-2xl shadow-blue-900/20 relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="bg-gray-900 block"
          style={{ imageRendering: "pixelated" }} // 도트가 뭉개지지 않도록 방지
        />

        {/* 가상의 UI 오버레이 */}
        <div className="absolute top-4 left-4 bg-black/50 p-3 rounded-lg border border-gray-600">
          <p className="font-bold text-sm text-yellow-300">Player: 강아지 기사</p>
          <div className="w-32 h-3 bg-gray-800 mt-1 rounded-full overflow-hidden">
            <div className="w-full h-full bg-green-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
