import type { StoryBible } from "@/types/story";

export function buildWorldPrompt(storyBible: StoryBible): string {
  return `You are a World DNA synthesizer for a JRPG game. Given a Story Bible, extract a shared world representation (World DNA) that ALL generation systems (images, music, GM dialogue, characters) will use as a common reference.

STORY BIBLE INPUT:
${JSON.stringify(storyBible, null, 2)}

TASK: Synthesize a World DNA that captures:
1. Visual identity: color palette and atmosphere that permeates every scene
2. Thematic core: the fear/wound and how it manifests in the world itself
3. Boss characterization: archetype and their most memorable taunt
4. Musical identity: orchestral mood for the theme song
5. Victory condition: what emotionally resolves the wound

RULES:
- palette and atmosphere must be in English (for image generation prompts)
- musical_mood must be in English (for Lyria music generation)
- All Korean fields must be evocative and thematic, not generic
- consequence_chain.fear should describe ENVIRONMENT/IMAGERY, not the abstract fear itself
- The boss_taunt should feel personal to the player's wound
- victory_scene should mirror the climax but with triumph instead of despair

Respond ONLY with valid JSON:
{
  "world_name": "Korean world name",
  "palette": "English color description for image generation",
  "atmosphere": "English atmosphere for image generation",
  "primary_fear": "Korean fear theme",
  "boss_archetype": "Korean boss archetype name",
  "musical_mood": "English music mood description for Lyria",
  "power_source": "Korean: what saves the world / defeats the boss",
  "consequence_chain": {
    "fear": "English: environment/visual imagery that expresses the fear",
    "boss_taunt": "Korean: boss's most cutting taunt line",
    "victory_scene": "Korean: what the victory looks like emotionally"
  }
}`;
}
