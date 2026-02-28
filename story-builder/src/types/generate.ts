// ── 캐릭터 생성 결과 타입 (Single Source of Truth) ──

/** 파티원 / 보스 공통 스탯 */
export interface CharacterBase {
  name: string;
  role: string;
  hp: number;
  atk: number;
  description: string;
  /** 영문 이미지 생성 프롬프트 */
  imagePrompt: string;
}

/** 파티원 (주인공 포함) */
export interface PartyMember extends CharacterBase {
  id: string;
}

/** 보스 */
export type Boss = CharacterBase;

/** /api/generate 응답 */
export interface GenerateResult {
  party: PartyMember[];
  boss: Boss;
}
