import * as fs from "node:fs";
import * as path from "node:path";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import {
  CHARACTER_TRANSFORM_SYSTEM,
  characterTransformPrompt,
  baseIllustrationPrompt,
  spriteSheetPrompt,
  expressionPrompt,
} from "../prompt/party-member.js";

// ============================================================
// Google AI 초기화
// ============================================================
const apiKey = process.env.GOOGLE_AI_API_KEY;
if (!apiKey) {
  throw new Error("GOOGLE_AI_API_KEY 환경 변수가 설정되지 않았습니다.");
}

const ai = new GoogleGenAI({ apiKey });

// ============================================================
// 설정
// ============================================================
const OUTPUT_DIR = path.join(import.meta.dirname, "..", "output", "test");
const TEXT_MODEL = "gemini-3-flash-preview";
const IMAGE_MODEL = "gemini-3.1-flash-image-preview";

// CLI arg: 설문 답변 (기본값: "강아지")
const surveyAnswer = process.argv[2] ?? "강아지";
const surveyType = (process.argv[3] as "animal" | "mbti" | "food" | "fear") ?? "animal";

// ============================================================
// 유틸
// ============================================================
const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Part 타입 호환성
const saveImage = (parts: any[], filePath: string): void => {
  for (const part of parts) {
    if (part.text) {
      console.log("  📝 모델 텍스트:", part.text.slice(0, 100));
    } else if (part.inlineData?.data) {
      const buffer = Buffer.from(part.inlineData.data, "base64");
      fs.writeFileSync(filePath, buffer);
      console.log(`  💾 저장: ${path.basename(filePath)} (${(buffer.length / 1024).toFixed(0)} KB)`);
    }
  }
};

// ============================================================
// Step 1 — 설문 → 캐릭터 설정 JSON (텍스트 모델)
// ============================================================
const step1 = async (): Promise<{
  name: string;
  class: string;
  race: string;
  appearance: string;
  colorPalette: string[];
  personality: string;
}> => {
  console.log("\n🔷 Step 1: 설문 → 캐릭터 설정 JSON");
  console.log(`  입력: surveyType="${surveyType}", answer="${surveyAnswer}"`);

  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: characterTransformPrompt(surveyType, surveyAnswer),
    config: {
      systemInstruction: CHARACTER_TRANSFORM_SYSTEM,
      responseMimeType: "application/json",
    },
  });

  const text = response.text ?? "";
  const setting = JSON.parse(text);

  // 디버깅용 저장
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "step1-setting.json"),
    JSON.stringify(setting, null, 2),
    "utf-8",
  );

  console.log(`  ✅ 캐릭터: ${setting.name} (${setting.class} / ${setting.race})`);
  console.log(`  🎨 팔레트: ${setting.colorPalette.join(", ")}`);
  console.log(`  👤 외형: ${setting.appearance.slice(0, 80)}...`);

  return setting;
};

// ============================================================
// Step 2 — 캐릭터 설정 → 기본 일러스트 1장 (이미지 모델, 텍스트만)
// ============================================================
const step2 = async (setting: {
  name: string;
  appearance: string;
  colorPalette: string[];
}): Promise<string> => {
  console.log("\n🔷 Step 2: 캐릭터 설정 → 기본 일러스트");

  const prompt = baseIllustrationPrompt(
    setting.name,
    setting.appearance,
    setting.colorPalette,
  );

  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: prompt,
    config: {
      imageConfig: {
        imageSize: "1K",
        aspectRatio: "1:1",
      },
    },
  });

  const filePath = path.join(OUTPUT_DIR, "step2-base.png");
  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("Step 2: 이미지 생성 실패 — 응답에 parts가 없음");

  saveImage(parts, filePath);
  console.log("  ✅ 기본 일러스트 생성 완료");

  return filePath;
};

// ============================================================
// Step 3 — 기본 일러 참조 → 스프라이트 시트 (이미지 모델, 참조 이미지)
// ============================================================
const step3 = async (name: string, baseImagePath: string): Promise<string> => {
  console.log("\n🔷 Step 3: 기본 일러 참조 → 스프라이트 시트");

  const refBase64 = fs.readFileSync(baseImagePath).toString("base64");

  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: [
      { inlineData: { mimeType: "image/png", data: refBase64 } },
      { text: spriteSheetPrompt(name) },
    ],
    config: {
      imageConfig: {
        imageSize: "1K",
        aspectRatio: "1:1",
      },
    },
  });

  const filePath = path.join(OUTPUT_DIR, "step3-sprite.png");
  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("Step 3: 스프라이트 시트 생성 실패 — 응답에 parts가 없음");

  saveImage(parts, filePath);
  console.log("  ✅ 스프라이트 시트 생성 완료");

  return filePath;
};

// ============================================================
// Step 4 — 기본 일러 참조 → 공격/피격 표정 (이미지 모델, 참조 이미지)
// ============================================================
const step4 = async (
  name: string,
  baseImagePath: string,
  expression: "attack" | "hurt",
): Promise<string> => {
  console.log(`\n🔷 Step 4: 기본 일러 참조 → ${expression === "attack" ? "공격" : "피격"} 표정`);

  const refBase64 = fs.readFileSync(baseImagePath).toString("base64");

  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: [
      { inlineData: { mimeType: "image/png", data: refBase64 } },
      { text: expressionPrompt(name, expression) },
    ],
    config: {
      imageConfig: {
        imageSize: "1K",
        aspectRatio: "1:1",
      },
    },
  });

  const filePath = path.join(OUTPUT_DIR, `step4-${expression}.png`);
  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error(`Step 4: ${expression} 표정 생성 실패 — 응답에 parts가 없음`);

  saveImage(parts, filePath);
  console.log(`  ✅ ${expression} 표정 생성 완료`);

  return filePath;
};

// ============================================================
// 파이프라인 실행
// ============================================================
const main = async () => {
  console.log("═══════════════════════════════════════════");
  console.log("  캐릭터 에셋 파이프라인 테스트");
  console.log(`  입력: "${surveyAnswer}" (${surveyType})`);
  console.log("═══════════════════════════════════════════");

  ensureDir(OUTPUT_DIR);

  // Step 1: 설문 → 캐릭터 설정 JSON
  const setting = await step1();

  // Step 2: 캐릭터 설정 → 기본 일러스트
  const baseImagePath = await step2(setting);

  console.log("⏳ API 속도 제한 우회를 위해 60초 대기 중...");
  await sleep(60000);

  // Step 3: 기본 일러 참조 → 스프라이트 시트 (단일 생성)
  await step3(setting.name, baseImagePath);

  console.log("⏳ API 속도 제한 우회를 위해 60초 대기 중...");
  await sleep(60000);

  // Step 4: 기본 일러 참조 → 공격/피격 표정 (순차 실행)
  await step4(setting.name, baseImagePath, "attack");
  console.log("⏳ API 속도 제한 우회를 위해 60초 대기 중...");
  await sleep(60000);
  
  await step4(setting.name, baseImagePath, "hurt");

  console.log("\n═══════════════════════════════════════════");
  console.log("  ✅ 파이프라인 완료!");
  console.log("  📁 출력 경로: output/test/");
  console.log("═══════════════════════════════════════════");
};

await main();
