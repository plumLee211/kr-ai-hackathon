import * as fs from "node:fs";
import * as path from "node:path";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GOOGLE_AI_API_KEY;
if (!apiKey) {
  throw new Error("GOOGLE_AI_API_KEY 환경 변수가 설정되지 않았습니다.");
}

const ai = new GoogleGenAI({ apiKey });
const IMAGE_MODEL = "gemini-3.1-flash-image-preview";
const OUTPUT_DIR = path.join(import.meta.dirname, "..", "output");

const prompt = `
Create a stunning 8-bit pixel art (dot style) illustration of Seoul's Sebitseom (Some Sevit / 세빛섬) floating islands on the Han River at night.

Key requirements:
- Viewpoint: Aerial view from a high elevation, looking down at the Han River and Sebitseom
- Scene: Night cityscape (야경) with the iconic three floating island pavilions of Sebitseom glowing with colorful LED lights reflected on the Han River water
- The Han River stretches across the scene with city lights and bridges visible
- Seoul city skyline in the background with illuminated buildings
- Style: Pure 8-bit retro pixel art / dot graphics style with limited color palette
- The water should have beautiful reflections of the colorful lights
- Dark night sky with stars rendered in pixel art style
- Vibrant neon colors reflecting off the water surface
- Every element must be rendered in clean, crisp pixel art blocks
`;

const generate = async (): Promise<void> => {
  console.log("🎨 Generating: Seoul Sebitseom Night View (8-bit style)...");

  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: [{ text: prompt }],
    config: {
      imageConfig: {
        imageSize: "4K",
        aspectRatio: "16:9",
      },
    },
  });

  if (!response.candidates?.[0]?.content?.parts) {
    console.error("❌ No response received");
    return;
  }

  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData && part.inlineData.data) {
      const buffer = Buffer.from(part.inlineData.data, "base64");
      const fileName = "seoul-sebitseom-8bit.png";
      fs.writeFileSync(path.join(OUTPUT_DIR, fileName), buffer);
      console.log(`✅ Image saved as ${fileName}`);
    }
  }
};

await generate();
