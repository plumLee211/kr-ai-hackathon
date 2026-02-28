import * as fs from "node:fs";
import * as path from "node:path";
import sharp from "sharp";

// ============================================================
// 설정
// ============================================================
const OUTPUT_DIR = path.join(import.meta.dirname, "..", "output");

// 초록 지배적 픽셀 판별 — (G - R)과 (G - B) 차이가 이 값 이상이면 초록 배경으로 간주
// 4K 이미지에서 캐릭터 영역을 잘못 제거하지 않도록 충분히 높게 설정
// Pass 2 디스필이 초록 묻어남을 처리하므로, 여기선 확실한 배경만 제거
const GREEN_DOMINANCE = 50;

// ============================================================
// 크로마키 배경 제거 (하드 컷)
// ============================================================
const extractBackground = async (filePath: string): Promise<void> => {
  const image = sharp(filePath);
  const { width, height } = await image.metadata();

  if (!width || !height) {
    throw new Error(`이미지 메타데이터를 읽을 수 없습니다: ${filePath}`);
  }

  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);

  // Pass 1: 확실한 초록 배경만 투명 처리 (엄격한 조건으로 캐릭터 보호)
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    if (g > 150 && g - r > GREEN_DOMINANCE && g - b > GREEN_DOMINANCE) {
      pixels[i] = 255;     // R → 흰색 (블러 시 초록 비침 방지)
      pixels[i + 1] = 255; // G → 흰색
      pixels[i + 2] = 255; // B → 흰색
      pixels[i + 3] = 0;   // alpha → 투명
    }
  }

  // Pass 2: 그린 디스필 — 남은 픽셀에서 초록 편향 제거 (초록 묻어남 중화)
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] === 0) continue; // 투명 픽셀 스킵
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const maxRB = Math.max(r, b);
    if (g > maxRB) {
      pixels[i + 1] = maxRB; // G를 R,B 중 큰 값으로 클램프
    }
  }

  const parsed = path.parse(filePath);
  const outputPath = path.join(
    parsed.dir,
    `${parsed.name}-transparent.webp`
  );

  const rawOpts = {
    raw: { width: info.width, height: info.height, channels: 4 as const },
  };

  // 알파 채널만 추출 → 블러로 가장자리 부드럽게 → raw 단일 채널 버퍼로 출력
  const smoothAlpha = await sharp(Buffer.from(pixels), rawOpts)
    .extractChannel(3)
    .blur(3.0)
    .raw()
    .toBuffer();

  // RGB 채널 추출 (알파 제거)
  const rgb = await sharp(Buffer.from(pixels), rawOpts)
    .removeAlpha()
    .raw()
    .toBuffer();

  // RGB(3ch) + smoothAlpha(1ch) 수동 합성
  const merged = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    merged[i * 4] = rgb[i * 3];
    merged[i * 4 + 1] = rgb[i * 3 + 1];
    merged[i * 4 + 2] = rgb[i * 3 + 2];
    merged[i * 4 + 3] = smoothAlpha[i];
  }

  await sharp(merged, rawOpts).webp({ quality: 85, effort: 6 }).toFile(outputPath);

  console.log(`✅ ${path.basename(outputPath)}`);
};

// ============================================================
// 실행
// ============================================================
const fileArg = process.argv[2];

if (fileArg) {
  // 인자가 있으면 해당 파일만 처리
  const filePath = path.isAbsolute(fileArg)
    ? fileArg
    : path.join(OUTPUT_DIR, fileArg);
  await extractBackground(filePath);
} else {
  // 인자가 없으면 output/ 디렉토리의 모든 PNG 처리 (이미 -transparent인 파일 제외)
  const files = fs
    .readdirSync(OUTPUT_DIR)
    .filter((f) => f.endsWith(".png") && !f.includes("-transparent"));

  if (files.length === 0) {
    console.log("처리할 PNG 파일이 없습니다. output/ 디렉토리를 확인하세요.");
    process.exit(0);
  }

  for (const file of files) {
    try {
      await extractBackground(path.join(OUTPUT_DIR, file));
    } catch (error) {
      console.error(`❌ ${file} 처리 실패:`, error);
    }
  }
}
