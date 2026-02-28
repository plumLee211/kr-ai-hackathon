"use client";

import { useMemo } from "react";
import Image from "next/image";

/**
 * 8bit 서울 세빛섬 야경 배경 — 건물 불빛 깜빡임 + 느린 패닝
 */

interface Light {
  id: number;
  x: number; // %
  y: number; // %
  size: number; // px
  color: string;
  delay: number; // s
  duration: number; // s
}

const LIGHT_COLORS = [
  "#FFE066", // warm yellow
  "#FFA94D", // orange
  "#74C0FC", // sky blue
  "#B197FC", // purple
  "#FF6B9D", // pink
  "#63E6BE", // mint
  "#FFFFFF", // white
];

function generateLights(count: number): Light[] {
  const lights: Light[] = [];
  const rng = (seed: number) => {
    let s = seed;
    return () => {
      s = (s * 16807 + 0) % 2147483647;
      return s / 2147483647;
    };
  };
  const rand = rng(42);

  for (let i = 0; i < count; i++) {
    const r = rand();
    // 건물 영역: 이미지 상단 10~55% (스카이라인), 좌우 5~95%
    const y = 10 + rand() * 45;
    const x = 5 + rand() * 90;

    lights.push({
      id: i,
      x,
      y,
      size: 2 + Math.floor(rand() * 3), // 2~4px
      color: LIGHT_COLORS[Math.floor(rand() * LIGHT_COLORS.length)],
      delay: rand() * 6, // 0~6s stagger
      duration: 1 + rand() * 3, // 1~4s cycle
    });
  }

  // 세빛섬 영역 (하단 중앙)에 추가 불빛
  for (let i = count; i < count + 25; i++) {
    lights.push({
      id: i,
      x: 25 + rand() * 50,
      y: 55 + rand() * 25,
      size: 2 + Math.floor(rand() * 4),
      color: LIGHT_COLORS[Math.floor(rand() * LIGHT_COLORS.length)],
      delay: rand() * 5,
      duration: 0.8 + rand() * 2,
    });
  }

  return lights;
}

export function PixelCityBackground() {
  const lights = useMemo(() => generateLights(60), []);

  return (
    <div className="pixel-city-bg">
      {/* 배경 이미지 — 느린 패닝 */}
      <div className="pixel-city-bg__image">
        <Image
          src="/bg/seoul-sebitseom-8bit.webp"
          alt="Seoul Sebitseom 8bit Night View"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
      </div>

      {/* 건물 불빛 깜빡임 오버레이 */}
      <div className="pixel-city-bg__lights">
        {lights.map((light) => (
          <span
            key={light.id}
            className="pixel-city-bg__light"
            style={{
              left: `${light.x}%`,
              top: `${light.y}%`,
              width: `${light.size}px`,
              height: `${light.size}px`,
              backgroundColor: light.color,
              animationDelay: `${light.delay}s`,
              animationDuration: `${light.duration}s`,
            }}
          />
        ))}
      </div>

      {/* 상단 비네트 (타이틀 가독성) */}
      <div className="pixel-city-bg__vignette" />
    </div>
  );
}
