interface CherrySalesBrandProps {
  subtitle?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  compact?: boolean;
}

export function CherrySalesBrand({
  subtitle,
  titleClassName = "",
  subtitleClassName = "",
  compact = false
}: CherrySalesBrandProps) {
  return (
    <div className={`flex items-center ${compact ? "gap-3" : "gap-4"}`}>
      <div
        className={`relative shrink-0 overflow-hidden rounded-[28px] bg-gradient-to-br from-rose-100 via-white to-rose-50 shadow-[0_16px_32px_rgba(190,24,93,0.16)] ring-1 ring-rose-200/70 ${
          compact ? "h-12 w-12" : "h-14 w-14"
        }`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 64 64"
          className="h-full w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M31.5 16C31.5 11 35.3 7 40 7c5.3 0 9.5 4.6 9.2 10.2"
            stroke="#EC7A9C"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M31.5 16C31.5 10.6 27.4 6.5 22 6.5c-5.7 0-10.1 4.9-9.8 10.6"
            stroke="#F3A3BA"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <circle cx="22.5" cy="34.5" r="15.5" fill="url(#leftCherry)" />
          <circle cx="40.5" cy="31.5" r="15.5" fill="url(#rightCherry)" />
          <ellipse cx="18" cy="26" rx="4.5" ry="7" fill="rgba(255,255,255,0.32)" />
          <ellipse cx="36.5" cy="23.5" rx="4.2" ry="6.5" fill="rgba(255,255,255,0.28)" />
          <defs>
            <linearGradient id="leftCherry" x1="12" y1="20" x2="35" y2="49" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF5A95" />
              <stop offset="1" stopColor="#C2185B" />
            </linearGradient>
            <linearGradient id="rightCherry" x1="29" y1="16" x2="52" y2="45" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF7DA7" />
              <stop offset="1" stopColor="#A1124F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="min-w-0">
        {subtitle ? (
          <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${subtitleClassName}`}>
            {subtitle}
          </p>
        ) : null}
        <p
          className={`truncate text-3xl font-black tracking-tight text-rose-700 ${
            compact ? "text-2xl" : ""
          } ${titleClassName}`}
        >
          CherrySales
        </p>
      </div>
    </div>
  );
}
