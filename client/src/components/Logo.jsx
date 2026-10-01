/** Mandi Saathi mark: a coin with a sprout growing out of it (crop → money). */
export function LogoMark({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <rect width="48" height="48" rx="13" fill="#183d2b" />
      <circle cx="24" cy="30" r="10" fill="#e3a21a" />
      <circle cx="24" cy="30" r="6.4" fill="none" stroke="#b9780a" strokeWidth="1.6" />
      <path d="M24 21V12" stroke="#f7f1e5" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M24 17c-5 0-8-3-8-8 5 0 8 3 8 8z" fill="#8fd19e" />
      <path d="M24 14c0-5 3-8 8-8 0 5-3 8-8 8z" fill="#cdefd0" />
    </svg>
  );
}

export default function Logo({ light = false, onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag className={`logo ${light ? "logo-light" : ""}`} onClick={onClick} type={onClick ? "button" : undefined}
      aria-label={onClick ? "Mandi Saathi, go to home" : undefined}>
      <LogoMark />
      <span className="logo-text">
        <strong>Mandi Saathi</strong>
        <span lang="hi">मंडी साथी</span>
      </span>
    </Tag>
  );
}
