import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { GEMINI_MODEL, isAllCollected, type CollectedFields } from "@/constants/survey";
import type { StoryBible } from "@/types/story";

let _ai: GoogleGenAI;
const ai = () => (_ai ??= new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! }));

export function buildStoryPrompt(fields: CollectedFields): string {
  const available = Object.entries(fields)
    .filter(([, v]) => v !== null)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  const allCollected = isAllCollected(fields);

  return `You are a Story Engine for a JRPG-style game. Build a Hero's Journey story bible based on the player's survey answers.

COLLECTED FIELDS:
${available}

STORY LAWS (must ALL be true when all fields collected):
1. wound_equals_boss: The player's "fear" must be the boss's core power source
2. party_fills_lack: Each of 3 party members fills a different gap/flaw in the hero
3. climax_triggers_fear: The story climax must directly trigger/confront the fear
4. resolution_heals_wound: Victory must represent healing/overcoming the fear (not just defeating enemy)

INCREMENTAL BUILD RULES:
- name collected → name the hero with personality hint
- mbti collected → define hero's flaw (MBTI shadow/weakness) and inner arc
- animal collected → define party member 1 (mentor role, animal-themed)
- item collected → define party members 2-3 (trickster/guardian, mbti-complement and item-themed)
- fear collected → define boss archetype, finalize all 3 acts, validate all story laws

${allCollected ? `ALL FIELDS COLLECTED. Build the complete Story Bible. Validate all 4 story laws. Set is_complete: true.
IMPORTANT: If any story law check is false, restructure the story so ALL laws pass.` : `PARTIAL BUILD. Fill what you can based on available fields. Use placeholder text like "..." for unknown parts. Set is_complete: false.`}

Respond ONLY with valid JSON matching this exact structure:
{
  "world": "World name in Korean (e.g. 황혼의 메아리 영역)",
  "act1": {
    "ordinary_world": "Korean description of hero's normal life",
    "call": "Korean description of inciting incident",
    "wound": "Korean: the core wound/fear in one phrase"
  },
  "act2": {
    "trials": ["Korean trial 1", "Korean trial 2"],
    "ordeal": "Korean: the darkest trial",
    "darkest_moment": "Korean: hero alone, fear at its peak"
  },
  "act3": {
    "climax": "Korean: how hero confronts the fear directly",
    "resolution": "Korean: how the wound is healed",
    "transformation": "Korean: how hero transcended their MBTI weakness"
  },
  "characters": {
    "hero_flaw": "Korean: hero's core flaw derived from MBTI",
    "party": [
      { "role": "mentor", "theme": "animal-based theme", "fills": "Korean: which hero flaw this fills" },
      { "role": "trickster", "theme": "mbti-complement theme", "fills": "Korean: which hero flaw this fills" },
      { "role": "guardian", "theme": "item-based theme", "fills": "Korean: which hero flaw this fills" }
    ],
    "boss_archetype": "shadow",
    "boss_power_source": "Korean: same as the fear, this is the boss's power"
  },
  "story_law_check": {
    "wound_equals_boss": true,
    "party_fills_lack": true,
    "climax_triggers_fear": true,
    "resolution_heals_wound": true
  },
  "is_complete": ${allCollected}
}`;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { collectedFields: CollectedFields };

  try {
    const prompt = buildStoryPrompt(body.collectedFields);
    const allCollected = isAllCollected(body.collectedFields);

    // If all collected, allow up to 2 retries to satisfy story laws
    const maxAttempts = allCollected ? 2 : 1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = await ai().models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text ?? "{}";
      const parsed = JSON.parse(text) as StoryBible;

      // On final attempt or partial build, accept as-is
      if (!allCollected) {
        return NextResponse.json({ ...parsed, is_complete: false });
      }

      // Validate story laws on complete build
      const laws = parsed.story_law_check;
      const allLawsPassed =
        laws.wound_equals_boss &&
        laws.party_fills_lack &&
        laws.climax_triggers_fear &&
        laws.resolution_heals_wound;

      if (allLawsPassed || attempt === maxAttempts - 1) {
        return NextResponse.json({ ...parsed, is_complete: true });
      }
      // Loop to retry if laws not passed
    }

    return NextResponse.json({ is_complete: false } as Partial<StoryBible>);
  } catch (error) {
    console.error("Story Engine error:", error);
    return NextResponse.json(
      { error: "Story generation failed" },
      { status: 500 }
    );
  }
}
