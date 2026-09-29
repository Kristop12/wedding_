export function Bloom({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 72" aria-hidden="true" className={className}>
      <path
        d="M36 62c2-14 1-24 0-34"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <ellipse cx="36" cy="24" rx="5" ry="8" fill="currentColor" opacity="0.85" />
      <ellipse cx="26" cy="28" rx="7" ry="4" transform="rotate(-40 26 28)" fill="currentColor" opacity="0.55" />
      <ellipse cx="46" cy="28" rx="7" ry="4" transform="rotate(40 46 28)" fill="currentColor" opacity="0.55" />
      <ellipse cx="30" cy="18" rx="6" ry="3.5" transform="rotate(-20 30 18)" fill="currentColor" opacity="0.4" />
      <ellipse cx="42" cy="18" rx="6" ry="3.5" transform="rotate(20 42 18)" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

export function Sprig({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 140" aria-hidden="true" className={className}>
      <path
        d="M40 132c8-28 6-52 0-78"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <ellipse cx="28" cy="108" rx="12" ry="5" transform="rotate(-40 28 108)" fill="currentColor" opacity="0.8" />
      <ellipse cx="54" cy="96" rx="13" ry="5" transform="rotate(32 54 96)" fill="currentColor" opacity="0.75" />
      <ellipse cx="26" cy="82" rx="11" ry="4.5" transform="rotate(-48 26 82)" fill="currentColor" opacity="0.7" />
      <ellipse cx="55" cy="68" rx="12" ry="4.5" transform="rotate(38 55 68)" fill="currentColor" opacity="0.72" />
      <ellipse cx="30" cy="56" rx="10" ry="4" transform="rotate(-36 30 56)" fill="currentColor" opacity="0.65" />
      <ellipse cx="48" cy="42" rx="8" ry="3.5" transform="rotate(24 48 42)" fill="currentColor" opacity="0.6" />
    </svg>
  );
}
