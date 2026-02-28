import { SURVEY_FIELDS } from "@/constants/survey";

interface ProgressDotsProps {
  step: number;
}

export function ProgressDots({ step }: ProgressDotsProps) {
  const total = SURVEY_FIELDS.length;

  return (
    <div className="absolute -top-3 right-4 flex items-center gap-1.5 px-3 py-0.5 bg-[#0A0A0A] border border-[#2A2A2A]">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
            i < step ? "bg-green-400" : "bg-[#2A2A2A]"
          }`}
        />
      ))}
    </div>
  );
}
