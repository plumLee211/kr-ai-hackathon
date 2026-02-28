import * as fs from "node:fs";
import * as path from "node:path";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import {
  gameMasterPrompt,
  type GameMasterPose,
  GAME_MASTER_POSES,
} from "../prompt/game-master.js";

// ============================================================
// Google AI 초기화
// ============================================================
const apiKey = process.env.GOOGLE_AI_API_KEY;
if (!apiKey) {
  throw new Error("GOOGLE_AI_API_KEY 환경 변수가 설정되지 않았습니다.");
}

const ai = new GoogleGenAI({ apiKey });

// ============================================================
// 유틸
// ============================================================
const IMAGE_MODEL = "gemini-3.1-flash-image-preview";
const ASSET_DIR = path.join(import.meta.dirname, "..", "asset", "img");
const OUTPUT_DIR = path.join(import.meta.dirname, "..", "output");

const getImageBase64 = (fileName: string): string => {
  const filePath = path.join(ASSET_DIR, fileName);
  return fs.readFileSync(filePath).toString("base64");
};

// ============================================================
// 이미지 생성
// ============================================================
const generate = async (
  pose: GameMasterPose,
  refImage?: string,
  fileNameInput?: string,
): Promise<void> => {
  const promptText = gameMasterPrompt(pose);

  const contents: Array<Record<string, unknown>> = [];

  // 참조 이미지가 있으면 함께 전달
  if (refImage) {
    contents.push({
      inlineData: {
        mimeType: "image/png",
        data: getImageBase64(refImage),
      },
    });
  }

  contents.push({ text: promptText });

  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents,
    config: {
      imageConfig: {
        imageSize: "4K",
        aspectRatio: "1:1",
      },
    },
  });

  const fileName = fileNameInput || `game-master-${pose}.png`;

  if (!response.candidates?.[0]?.content?.parts) return;
  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData && part.inlineData.data) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync(path.join(OUTPUT_DIR, fileName), buffer);
      console.log(`✅ Image saved as ${fileName}`);
    }
  }
};

// ============================================================
// 실행
// ============================================================
// 사용법:
//   pnpm gen                     → 모든 포즈 1장씩
//   pnpm gen asking              → asking 포즈 1장
//   pnpm gen asking 3            → asking 포즈 3장
//   pnpm gen asking 1 ref.png    → 참조 이미지 포함

const poseArg = process.argv[2] as GameMasterPose | undefined;
const count = Number(process.argv[3]) || 1;
const refImage = process.argv[4];

const poses: GameMasterPose[] = poseArg
  ? [poseArg]
  : (Object.keys(GAME_MASTER_POSES) as GameMasterPose[]);

for (const pose of poses) {
  for (let i = 1; i <= count; i++) {
    const fileName =
      count > 1 ? `game-master-${pose}-${i}.png` : `game-master-${pose}.png`;
    try {
      console.log(`🎨 Generating: ${pose} (${i}/${count})`);
      await generate(pose, refImage, fileName);
    } catch (error) {
      console.error(`❌ ${pose} ${i}번 생성 실패:`, error);
    }
  }
}
