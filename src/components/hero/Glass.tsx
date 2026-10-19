/**
 * A tumbler of water drawn in a 200×300 box. Light comes from the upper left,
 * so the shadow falls right and a soft patch of light focused by the water
 * sits inside it. The water level is driven by the `--level` custom property on an
 * ancestor so it stays in sync with the magnified headline behind it.
 * Plain water is clear; pass `mixedClassName` to fade in the whitish tint.
 */
export function Glass({
  className,
  waterClassName,
  mixedClassName,
  onClick,
  id = "glass",
  children,
}: {
  children?: React.ReactNode;
  id?: string;
  className?: string;
  waterClassName?: string;
  mixedClassName?: string;
  onClick?: () => void;
}) {
  return (
    <svg
      viewBox="0 0 200 300"
      className={className}
      overflow="visible"
      aria-hidden="true"
      focusable="false"
      onClick={onClick}
    >
      <defs>
        <filter id={`${id}-soft`} x="-60%" y="-200%" width="220%" height="500%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id={`${id}-contact`} x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
        <filter id={`${id}-glint`} x="-200%" y="-10%" width="500%" height="120%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
        <radialGradient id={`${id}-caustic`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        {/* Walls: bright at the silhouette, clear through the middle. */}
        <linearGradient id={`${id}-wall`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="0.035" stopColor="#5c4880" stopOpacity="0.18" />
          <stop offset="0.09" stopColor="#fff" stopOpacity="0.14" />
          <stop offset="0.2" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.8" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.92" stopColor="#5c4880" stopOpacity="0.1" />
          <stop offset="0.97" stopColor="#5c4880" stopOpacity="0.22" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={`${id}-water`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="1" stopColor="#8d74b8" stopOpacity="0.16" />
        </linearGradient>
        {/* Once the fibre is stirred in, the water turns faintly white. */}
        <linearGradient id={`${id}-mixed`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#f6f2fc" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id={`${id}-water-edge`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#3d2d5c" stopOpacity="0.32" />
          <stop offset="0.07" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.14" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.86" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.94" stopColor="#3d2d5c" stopOpacity="0.2" />
          <stop offset="1" stopColor="#3d2d5c" stopOpacity="0.38" />
        </linearGradient>
        <linearGradient id={`${id}-base`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="0.5" stopColor="#c9b6e8" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.7" />
        </linearGradient>
        <clipPath id={`${id}-interior`}>
          <path d="M11.5 10 L188.5 10 L174.1 262 L25.9 262 Z" />
        </clipPath>
      </defs>

      {/* Cast shadow on the surface, with the caustic inside it */}
      <path
        d="M30 288 C 60 300, 200 306, 330 300 C 345 296, 330 284, 300 282 L 176 282 Z"
        fill="#4a3470"
        opacity="0.26"
        filter={`url(#${id}-soft)`}
      />
      <ellipse cx="236" cy="293" rx="46" ry="6" fill={`url(#${id}-caustic)`} filter={`url(#${id}-contact)`} />
      <ellipse cx="100" cy="290" rx="78" ry="5" fill="#2b1d45" opacity="0.38" filter={`url(#${id}-contact)`} />

      {/* Back of the rim */}
      <path d="M8 10 A92 9 0 0 1 192 10" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="1" />

      {/* Water, raised by --level */}
      <g clipPath={`url(#${id}-interior)`}>
        <g className={waterClassName}>
          <path d="M0 112 L200 112 L200 300 L0 300 Z" fill={`url(#${id}-water)`} />
          {mixedClassName && (
            <path className={mixedClassName} d="M0 112 L200 112 L200 300 L0 300 Z" fill={`url(#${id}-mixed)`} />
          )}
          <path d="M0 112 L200 112 L200 300 L0 300 Z" fill={`url(#${id}-water-edge)`} />
          <ellipse cx="100" cy="112" rx="83" ry="6.5" fill="#fff" fillOpacity="0.32" />
          <ellipse cx="100" cy="112" rx="83" ry="6.5" fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="0.9" />
          <path d="M20 113.5 A83 6.5 0 0 0 180 113.5" fill="none" stroke="#5c4880" strokeOpacity="0.25" strokeWidth="1.2" />
        </g>
      </g>

      {/* Glass body */}
      <path d="M8 10 L192 10 L176 290 L24 290 Z" fill={`url(#${id}-wall)`} />

      {/* Thick base */}
      <path d="M25.9 262 L174.1 262 L176 290 L24 290 Z" fill={`url(#${id}-base)`} />
      <path d="M26 262.5 A74 5 0 0 0 174 262.5" fill="none" stroke="#fff" strokeOpacity="0.9" strokeWidth="1" />
      <path d="M24 290 A76 5.5 0 0 0 176 290" fill="none" stroke="#fff" strokeOpacity="0.75" strokeWidth="1.2" />

      {/* Specular glints from the key light */}
      <rect x="19" y="30" width="3.2" height="214" rx="1.6" fill="#fff" opacity="0.85" filter={`url(#${id}-glint)`} />
      <rect x="27" y="40" width="1.4" height="150" rx="0.7" fill="#fff" opacity="0.5" filter={`url(#${id}-glint)`} />
      <rect x="171" y="60" width="2" height="160" rx="1" fill="#fff" opacity="0.35" filter={`url(#${id}-glint)`} />

      {/* Front of the rim */}
      <path d="M8 10 A92 9 0 0 0 192 10" fill="none" stroke="#fff" strokeOpacity="0.95" strokeWidth="1.4" />
      <path d="M8 10 L24 290 M192 10 L176 290" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.8" />

      {children}
    </svg>
  );
}
