export interface StoryAct1 {
  ordinary_world: string;
  call: string;
  wound: string;
}

export interface StoryAct2 {
  trials: string[];
  ordeal: string;
  darkest_moment: string;
}

export interface StoryAct3 {
  climax: string;
  resolution: string;
  transformation: string;
}

export interface StoryPartyMember {
  role: "mentor" | "trickster" | "guardian";
  theme: string;
  fills: string;
}

export interface StoryCharacters {
  hero_flaw: string;
  party: StoryPartyMember[];
  boss_archetype: string;
  boss_power_source: string;
}

export interface StoryLawCheck {
  wound_equals_boss: boolean;
  party_fills_lack: boolean;
  climax_triggers_fear: boolean;
  resolution_heals_wound: boolean;
}

export interface StoryBible {
  world: string;
  act1: StoryAct1;
  act2: StoryAct2;
  act3: StoryAct3;
  characters: StoryCharacters;
  story_law_check: StoryLawCheck;
  is_complete: boolean; // true when all 5 fields collected and laws validated
}
