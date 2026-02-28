export interface ConsequenceChain {
  fear: string;          // dungeon/environment imagery based on fear
  boss_taunt: string;    // boss's taunt line in Korean
  victory_scene: string; // victory scene description in Korean
}

export interface WorldDNA {
  world_name: string;       // Korean world name (e.g. "황혼의 메아리 영역")
  palette: string;          // English color palette (e.g. "warm amber, twilight purple")
  atmosphere: string;       // English atmosphere (e.g. "melancholic but hopeful")
  primary_fear: string;     // Korean: player's fear as world's core theme
  boss_archetype: string;   // Korean: boss archetype name
  musical_mood: string;     // English: music mood for Lyria (e.g. "gentle strings with building urgency")
  power_source: string;     // Korean: what defeats the boss / world's saving grace
  consequence_chain: ConsequenceChain;
}
