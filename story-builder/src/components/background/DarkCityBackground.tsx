"use client";

import Image from "next/image";

/**
 * 어두운 도트 도시 배경 — 타이틀/GM 페이즈용
 * 불빛 없이 조용한 어둠, 설문 완료 시 밝은 세빛섬으로 전환됨
 */
export function DarkCityBackground() {
  return (
    <div className="pixel-city-bg">
      <div className="pixel-city-bg__image">
        <Image
          src="/bg/seoul-dark-city-8bit.webp"
          alt="Dark 8bit City"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
      </div>

      <div className="pixel-city-bg__vignette" />
    </div>
  );
}
