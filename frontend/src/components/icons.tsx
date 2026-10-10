export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sakura-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFB7D5" />
          <stop offset="1" stopColor="#E0457B" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="#16110f" />
      <g fill="url(#sakura-g)" transform="translate(32 32) scale(.95)">
        <path id="sakura-p" d="M0-4C-9-12-8-26 0-29 8-26 9-12 0-4Z" />
        <use href="#sakura-p" transform="rotate(72)" />
        <use href="#sakura-p" transform="rotate(144)" />
        <use href="#sakura-p" transform="rotate(216)" />
        <use href="#sakura-p" transform="rotate(288)" />
      </g>
      <circle cx="32" cy="32" r="4" fill="#16110f" />
    </svg>
  );
}
