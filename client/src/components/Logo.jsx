/**
 * MandiOS mark: a bold "M" whose two peaks read as market awnings, with a gold coin dropping into the
 * valley between them (the price). Solid shapes on a 64px grid, so it stays legible down to favicon size.
 */
export function LogoMark({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="17" fill="#173b29" />
      <path d="M14 48V15L23 15L32 29L41 15L50 15V48H42V28L32 41L22 28V48Z" fill="#f7f1e5" stroke="#f7f1e5" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="32" cy="16.5" r="5.4" fill="#f0b537" />
      <circle cx="32" cy="16.5" r="2.3" fill="#c98a0f" />
    </svg>
  );
}

export default function Logo({ light = false, onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag className={`logo ${light ? "logo-light" : ""}`} onClick={onClick} type={onClick ? "button" : undefined}
      aria-label={onClick ? "MandiOS, go to home" : undefined}>
      <LogoMark />
      <span className="logo-text">
        <strong>Mandi<em>OS</em></strong>
        <span>AI agents for India's mandis</span>
      </span>
    </Tag>
  );
}
