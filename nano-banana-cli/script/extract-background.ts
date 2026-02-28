import * as fs from "node:fs";
import * as path from "node:path";
import sharp from "sharp";

// ============================================================
// 설정
// ============================================================
const OUTPUT_DIR = path.join(import.meta.dirname, "..", "output");

// ============================================================
// 실행
// ============================================================
const main = async () => {
  // TODO: 구현
  console.log("🟢  extract-background.ts ready");
};

await main();
