// ── 설문 필드 정의 (Single Source of Truth) ──

export const SURVEY_FIELDS = ["name", "mbti", "animal", "food", "fear"] as const;

export type SurveyFieldKey = (typeof SURVEY_FIELDS)[number];

/** 수집 중 nullable 상태 */
export type CollectedFields = Record<SurveyFieldKey, string | null>;

/** 수집 완료 후 non-null 상태 */
export type Answers = Record<SurveyFieldKey, string>;

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

/** 빈 CollectedFields 초기값 생성 */
export function createEmptyFields(): CollectedFields {
  return Object.fromEntries(
    SURVEY_FIELDS.map((key) => [key, null])
  ) as CollectedFields;
}

/** 모든 필드가 수집되었는지 확인 */
export function isAllCollected(fields: CollectedFields): boolean {
  return SURVEY_FIELDS.every((key) => fields[key] !== null);
}

/** CollectedFields → Answers 변환 (allCollected 보장 후 사용) */
export function toAnswers(fields: CollectedFields): Answers {
  return Object.fromEntries(
    SURVEY_FIELDS.map((key) => [key, fields[key]!])
  ) as Answers;
}

export const GEMINI_MODEL = "gemini-3-flash-preview";
