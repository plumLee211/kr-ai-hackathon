import * as fs from "node:fs";
import * as path from "node:path";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

// ============================================================
// Google AI 초기화
// ============================================================
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });

const TEXT_MODEL = "gemini-3-flash-preview";
const IMAGE_MODEL = "gemini-3.1-flash-image-preview";
const OUTPUT_DIR = path.join(import.meta.dirname, "..", "output", "test");

// ============================================================
// 실행
// ============================================================
const main = async () => {
  // TODO: 구현
  console.log("🧪  pipeline-test.ts ready");
};

await main();
