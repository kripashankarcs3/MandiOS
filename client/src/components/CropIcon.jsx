/** Flat illustrations of the five crops, drawn to sit on a 48px grid. */
const ART = {
  onion: (
    <>
      <path d="M24 9c1 5 12 9 12 20 0 7-5 11-12 11S12 36 12 29C12 18 23 14 24 9z" fill="#b84f6e" />
      <path d="M24 12c-5 8-6 18 0 28M24 12c5 8 6 18 0 28M24 14c-1 8-1 16 0 26" fill="none" stroke="#e8a3b5" strokeWidth="1.300" strokeLinecap="round" />
      <path d="M24 9c0-3 1-5 4-6" fill="none" stroke="#4f8a4b" strokeWidth="2.200" strokeLinecap="round" />
      <path d="M21 41l-1.500 3M24 41v3.500M27 41l1.500 3" stroke="#8a6a45" strokeWidth="1.300" strokeLinecap="round" />
    </>
  ),
  tomato: (
    <>
      <circle cx="24" cy="28" r="14" fill="#d8402f" />
      <path d="M15 22a10 10 0 0 1 6-6" fill="none" stroke="#f08a78" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 15c-3 0-7 1-10 4 3 0 5 .5 7 1.500-2 1-3.500 3-3.500 5 3-1 5-2.500 6.500-4.500 1.500 2 3.500 3.500 6.500 4.500 0-2-1.500-4-3.500-5 2-1 4-1.500 7-1.500-3-3-7-4-10-4z" fill="#3f8a45" />
      <path d="M24 15v-4" stroke="#2d6b34" strokeWidth="2.200" strokeLinecap="round" />
    </>
  ),
  soybean: (
    <>
      <path d="M8 36C5 24 16 9 40 9c0 22-16 32-32 27z" fill="#7db04f" />
      <path d="M9 35C20 31 30 22 39 10" fill="none" stroke="#5f9138" strokeWidth="1.400" strokeLinecap="round" />
      <circle cx="17" cy="29" r="4.200" fill="#e9f2bd" />
      <circle cx="24.500" cy="22.500" r="4.200" fill="#e9f2bd" />
      <circle cx="32" cy="15.500" r="4.200" fill="#e9f2bd" />
      <path d="M8 36l-3 6" stroke="#5f9138" strokeWidth="2.200" strokeLinecap="round" />
    </>
  ),
  wheat: (
    <>
      <path d="M24 45V15" stroke="#b88a2e" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="24" cy="9" rx="3" ry="6" fill="#e3a21a" />
      {[16, 23, 30, 37].map((y) => (
        <g key={y}>
          <ellipse cx="18" cy={y} rx="3" ry="5.500" fill="#e3a21a" transform={`rotate(-38 18 ${y})`} />
          <ellipse cx="30" cy={y} rx="3" ry="5.500" fill="#d99a14" transform={`rotate(38 30 ${y})`} />
        </g>
      ))}
    </>
  ),
  cotton: (
    <>
      <circle cx="17.500" cy="22" r="8" fill="#fbf8ef" stroke="#d3cab4" strokeWidth="1.400" />
      <circle cx="30.500" cy="22" r="8" fill="#fbf8ef" stroke="#d3cab4" strokeWidth="1.400" />
      <circle cx="24" cy="15" r="8" fill="#fbf8ef" stroke="#d3cab4" strokeWidth="1.400" />
      <path d="M11 28c0 9 5 15 13 15s13-6 13-15l-7 4-6-6-6 6z" fill="#4f8a4b" />
      <path d="M24 43V33" stroke="#3a6e37" strokeWidth="1.500" strokeLinecap="round" />
    </>
  ),
};

export default function CropIcon({ crop, size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      {ART[crop] || ART.wheat}
    </svg>
  );
}
