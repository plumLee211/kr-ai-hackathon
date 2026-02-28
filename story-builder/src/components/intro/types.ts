export interface Answers {
  name: string;
  mbti: string;
  animalFood: string;
  fear: string;
}

export interface CollectedFields {
  name: string | null;
  mbti: string | null;
  animalFood: string | null;
  fear: string | null;
}

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}
