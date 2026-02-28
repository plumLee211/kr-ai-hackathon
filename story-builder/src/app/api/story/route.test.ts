import { describe, it, expect, vi } from "vitest";

// Mock next/server and @google/genai before importing route
vi.mock("next/server", () => ({
  NextRequest: class {},
  NextResponse: { json: vi.fn() },
}));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = {
      generateContent: vi.fn(),
    };
  },
}));

import { buildStoryPrompt } from "./route";
import type { StoryBible } from "@/types/story";

const makeFields = (overrides: Partial<Record<string, string | null>> = {}) => ({
  name: null,
  mbti: null,
  animal: null,
  item: null,
  fear: null,
  ...overrides,
});

describe("buildStoryPrompt", () => {
  describe("partial build", () => {
    it("includes PARTIAL BUILD marker when not all fields collected", () => {
      const fields = makeFields({ name: "재솔", mbti: "INFJ" });
      const prompt = buildStoryPrompt(fields as any);
      expect(prompt).toContain("PARTIAL BUILD");
    });

    it("sets is_complete to false in partial build", () => {
      const fields = makeFields({ name: "재솔", mbti: "INFJ" });
      const prompt = buildStoryPrompt(fields as any);
      expect(prompt).toContain("is_complete: false");
    });

    it("includes collected field values in prompt", () => {
      const fields = makeFields({ name: "재솔", mbti: "INFJ" });
      const prompt = buildStoryPrompt(fields as any);
      expect(prompt).toContain("name: 재솔");
      expect(prompt).toContain("mbti: INFJ");
    });

    it("does not include null fields in COLLECTED FIELDS section", () => {
      const fields = makeFields({ name: "재솔", mbti: "INFJ" });
      const prompt = buildStoryPrompt(fields as any);
      // null fields should not appear as "animal: null" etc.
      expect(prompt).not.toContain("animal: null");
      expect(prompt).not.toContain("fear: null");
    });
  });

  describe("complete build", () => {
    const allFields = makeFields({
      name: "재솔",
      mbti: "INFJ",
      animal: "고양이",
      item: "사진첩",
      fear: "고독",
    });

    it("includes ALL FIELDS COLLECTED marker", () => {
      const prompt = buildStoryPrompt(allFields as any);
      expect(prompt).toContain("ALL FIELDS COLLECTED");
    });

    it("sets is_complete to true in complete build", () => {
      const prompt = buildStoryPrompt(allFields as any);
      expect(prompt).toContain("is_complete: true");
    });

    it("includes all 5 field values", () => {
      const prompt = buildStoryPrompt(allFields as any);
      expect(prompt).toContain("name: 재솔");
      expect(prompt).toContain("mbti: INFJ");
      expect(prompt).toContain("animal: 고양이");
      expect(prompt).toContain("item: 사진첩");
      expect(prompt).toContain("fear: 고독");
    });

    it("enforces wound=boss story law", () => {
      const prompt = buildStoryPrompt(allFields as any);
      expect(prompt).toContain("wound_equals_boss");
    });

    it("requires story law retry instruction", () => {
      const prompt = buildStoryPrompt(allFields as any);
      expect(prompt).toContain("story laws");
    });
  });
});

describe("StoryBible type structure", () => {
  it("accepts a valid complete StoryBible object", () => {
    const bible: StoryBible = {
      world: "황혼의 메아리 영역",
      act1: {
        ordinary_world: "평범한 일상",
        call: "세계의 부름",
        wound: "고독",
      },
      act2: {
        trials: ["첫번째 시련", "두번째 시련"],
        ordeal: "최악의 시험",
        darkest_moment: "홀로 남겨짐",
      },
      act3: {
        climax: "공포와의 직면",
        resolution: "고독 극복",
        transformation: "MBTI 그림자 극복",
      },
      characters: {
        hero_flaw: "과도한 내향성",
        party: [
          { role: "mentor", theme: "고양이 테마", fills: "외로움 보완" },
          { role: "trickster", theme: "MBTI 보완", fills: "직접적 표현" },
          { role: "guardian", theme: "사진첩 테마", fills: "과거 연결" },
        ],
        boss_archetype: "shadow",
        boss_power_source: "고독",
      },
      story_law_check: {
        wound_equals_boss: true,
        party_fills_lack: true,
        climax_triggers_fear: true,
        resolution_heals_wound: true,
      },
      is_complete: true,
    };

    // Type-level test: if this compiles, the structure is valid
    expect(bible.is_complete).toBe(true);
    expect(bible.story_law_check.wound_equals_boss).toBe(true);
    expect(bible.characters.party).toHaveLength(3);
    expect(bible.act2.trials).toHaveLength(2);
  });

  it("validates all 4 story law fields exist", () => {
    const laws = {
      wound_equals_boss: true,
      party_fills_lack: true,
      climax_triggers_fear: true,
      resolution_heals_wound: true,
    };
    const keys = Object.keys(laws);
    expect(keys).toContain("wound_equals_boss");
    expect(keys).toContain("party_fills_lack");
    expect(keys).toContain("climax_triggers_fear");
    expect(keys).toContain("resolution_heals_wound");
    expect(keys).toHaveLength(4);
  });
});
