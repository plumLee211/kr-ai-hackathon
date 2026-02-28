import * as fs from "node:fs";
import * as path from "node:path";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

// ============================================================
// Google AI 초기화
// ============================================================
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });

const VIDEO_MODEL = "veo-3.1-generate-preview";
const OUTPUT_DIR = path.join(import.meta.dirname, "..", "output");

// ============================================================
// 실행
// ============================================================
const main = async () => {
  // TODO: 구현
  console.log("🎬  video.ts ready");
};

await main();
