interface GeminiIconProps {
  size?: number;
  className?: string;
}

export function GeminiIcon({ size = 40, className }: GeminiIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="gemini-gradient" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="50%" stopColor="#A259FF" />
          <stop offset="100%" stopColor="#FF4FCB" />
        </linearGradient>
      </defs>
      <path
        d="M50 0 C50 27.6 27.6 50 0 50 C27.6 50 50 72.4 50 100 C50 72.4 72.4 50 100 50 C72.4 50 50 27.6 50 0Z"
        fill="url(#gemini-gradient)"
      />
    </svg>
  );
}
