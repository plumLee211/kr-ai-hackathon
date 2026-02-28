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
Create an 8-bit pixel art (dot style) illustration of Seoul's Sebitseom floating islands on the Han River at night — but completely DARK and DESOLATE.

Key requirements:
- Viewpoint: Aerial view from a high elevation, looking down at the Han River and Sebitseom
- Scene: Post-apocalyptic, abandoned city at night. ALL lights are OFF. No electricity. Total blackout.
- The three Sebitseom floating islands are dark silhouettes, no LED lights, no glow — completely powerless
- Seoul city skyline is visible only as dark building silhouettes against a very faint moonlit sky
- The Han River is dark, almost black water with very subtle moonlight reflection only
- Bridges are dark outlines with no traffic, no lights
- No neon, no warm lights, no signs — everything is shut down and lifeless
- Only light source: a dim pale moon and faint stars
- Color palette: extremely muted — deep navy, charcoal, dark gray, near-black tones only
- Mood: eerie, lonely, abandoned, post-apocalyptic silence
- Style: Pure 8-bit retro pixel art / dot graphics with very limited dark color palette
- Every element rendered in clean, crisp pixel art blocks
`;

const generate = async (): Promise<void> => {
  console.log("🎨 Generating: Seoul Dark City (8-bit style)...");

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
      const fileName = "seoul-dark-city-8bit.png";
      fs.writeFileSync(path.join(OUTPUT_DIR, fileName), buffer);
      console.log(`✅ Image saved as ${fileName}`);
    }
  }
};

await generate();
