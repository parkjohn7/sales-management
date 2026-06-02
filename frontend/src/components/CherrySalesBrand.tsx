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
      <div className={`relative shrink-0 ${compact ? "h-12 w-12" : "h-14 w-14"}`} aria-hidden="true">
        <svg
          viewBox="0 0 64 64"
          className="h-full w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M32 15.5C31.9 10.1 35.8 5.8 40.8 5.8c5.5 0 9.8 4.6 9.5 10.3"
            stroke="#F3A2BC"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M32 15.5C32 10 27.8 5.8 22.3 5.8c-5.8 0-10.3 5-10 10.8"
            stroke="#F6BCD0"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <g filter="url(#shadow)">
            <path
              d="M25.6 20.8c-7.9 0-14.2 6.3-14.2 14.2 0 7.8 6.3 14.2 14.2 14.2 8.2 0 14.8-6.6 14.8-14.8 0-7.5-6.1-13.6-13.6-13.6h-1.2z"
              fill="url(#leftCherry)"
            />
            <path
              d="M37.8 18.4c-7.6 0-13.8 6.2-13.8 13.8 0 8.6 7 15.6 15.6 15.6 7.6 0 13.8-6.2 13.8-13.8 0-8.6-7-15.6-15.6-15.6z"
              fill="url(#rightCherry)"
            />
          </g>
          <ellipse cx="20" cy="28" rx="4.8" ry="7.8" fill="rgba(255,255,255,0.32)" />
          <ellipse cx="38" cy="25.5" rx="4.6" ry="7.2" fill="rgba(255,255,255,0.26)" />
          <defs>
            <filter id="shadow" x="6" y="14" width="52" height="40" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#BE185D" floodOpacity="0.22" />
            </filter>
            <linearGradient id="leftCherry" x1="12" y1="18" x2="39" y2="49" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF4D93" />
              <stop offset="1" stopColor="#D10C66" />
            </linearGradient>
            <linearGradient id="rightCherry" x1="28" y1="16" x2="53" y2="45" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF6FA4" />
              <stop offset="1" stopColor="#B8165A" />
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
