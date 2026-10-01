/**
 * MandiOs mark, redrawn as vector from the brand artwork: a green ribbon "M", a leaf as its right
 * half, and an ear of wheat. The tile variant puts it on a cream square for dark backgrounds.
 */
function MarkShapes() {
  const grains = [
    [130, 24, 10, 4.2, 8.6],
    [120, 36, -32, 4.2, 8.6],
    [137, 37, 68, 4.2, 8.6],
    [117, 48, -32, 4.2, 8.6],
    [135, 49, 72, 4.2, 8.6],
    [114, 60, -30, 4.2, 8.6],
    [133, 61, 75, 4.2, 8.6],
  ];
  return (
    <>
      <defs>
        <linearGradient id="mo-m" gradientUnits="userSpaceOnUse" x1="28" y1="36" x2="84" y2="136">
          <stop offset="0" stopColor="#74c64d" />
          <stop offset="0.5" stopColor="#1f9a58" />
          <stop offset="1" stopColor="#04675f" />
        </linearGradient>
        <linearGradient id="mo-leaf" gradientUnits="userSpaceOnUse" x1="76" y1="72" x2="140" y2="134">
          <stop offset="0" stopColor="#48b04f" />
          <stop offset="0.6" stopColor="#2a8a3a" />
          <stop offset="1" stopColor="#1f6a2c" />
        </linearGradient>
      </defs>
      <path
        fill="url(#mo-m)"
        d="M20 126V60C20 45 31 35 46 35C54 35 60 38 66 45L93.750 80.500L71.250 102.500L53.750 81V124C53.750 134 46 141 36 141H34C26 141 20 135 20 126Z"
      />
      <path
        fill="url(#mo-leaf)"
        fillRule="evenodd"
        d="M72 122C72 100 90 82 118 74C128 71 135 69 141 68V122C141 133 132 141 120 141H92C80 141 72 133 72 122ZM116 96C114 112 106 126 93 134L97 125C105 117 111 107 116 96Z"
      />
      <g fill="#f59e1b">
        {grains.map(([cx, cy, rot, rx, ry]) => (
          <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${rot} ${cx} ${cy})`} />
        ))}
      </g>
    </>
  );
}

export function LogoMark({ size = 40, tile = false }) {
  if (tile) {
    return (
      <svg width={size} height={size} viewBox="-14 -16 190 190" aria-hidden="true" focusable="false">
        <rect x="-14" y="-16" width="190" height="190" rx="44" fill="#f7f1e5" />
        <MarkShapes />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="14 12 134 134" aria-hidden="true" focusable="false">
      <MarkShapes />
    </svg>
  );
}

export default function Logo({ light = false, onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag className={`logo ${light ? "logo-light" : ""}`} onClick={onClick} type={onClick ? "button" : undefined}
      aria-label={onClick ? "MandiOs, go to home" : undefined}>
      <LogoMark size={light ? 38 : 38} tile={light} />
      <span className="logo-text">
        <strong>Mandi<em>Os</em></strong>
        <span>Negotiate · Compare · Grow</span>
      </span>
    </Tag>
  );
}
