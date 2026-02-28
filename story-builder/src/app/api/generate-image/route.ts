import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GOOGLE_AI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

const IMAGE_MODEL = "gemini-3.1-flash-image-preview";

export async function POST(req: NextRequest) {
  if (!apiKey) {
    return NextResponse.json({ imageUrl: null }, { status: 500 });
  }

  try {
    const { prompt } = (await req.json()) as { prompt: string };
    if (!prompt) {
      return NextResponse.json({ imageUrl: null }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: prompt,
      config: {
        responseModalities: ["image"],
        imageConfig: { imageSize: "1K", aspectRatio: "1:1" },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      return NextResponse.json({ imageUrl: null });
    }

    const imagePart = parts.find(
      (p) => p.inlineData && p.inlineData.data
    );
    if (!imagePart?.inlineData?.data) {
      return NextResponse.json({ imageUrl: null });
    }

    const mimeType = imagePart.inlineData.mimeType || "image/png";
    const imageUrl = `data:${mimeType};base64,${imagePart.inlineData.data}`;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json({ imageUrl: null });
  }
}
