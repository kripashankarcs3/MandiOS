const PATHS = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  back: <path d="M19 12H5M11 6l-6 6 6 6" />,
  down: <path d="M12 5v14M6 13l6 6 6-6" />,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  shield: <><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.500-7-10V6z" /><path d="M9 12l2.200 2.200L15.500 10" /></>,
  check: <path d="M5 12.500l4.500 4.500L19 7.500" />,
  search: <><circle cx="11" cy="11" r="6.500" /><path d="M16 16l4.500 4.500" /></>,
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.800" fill="currentColor" /></>,
  chat: <><path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H10l-5 4v-4a2 2 0 0 1-1-2z" /><path d="M8 9h8M8 12h5" /></>,
  scale: <><path d="M12 4v16M7 20h10M5 8h14" /><path d="M5 8l-2.500 6a3 3 0 0 0 5 0zM19 8l-2.500 6a3 3 0 0 0 5 0z" /></>,
  tap: <><circle cx="12" cy="12" r="9" /><path d="M8 12.500l2.800 2.800L16 9.500" /></>,
  truck: <><path d="M2 6h11v10H2zM13 9h4l3 3v4h-7" /><circle cx="6.500" cy="17.500" r="1.800" /><circle cx="16.500" cy="17.500" r="1.800" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  star: <path d="M12 3.500l2.600 5.300 5.800.800-4.200 4.100 1 5.800L12 16.800 6.800 19.500l1-5.800L3.600 9.600l5.800-.8z" fill="currentColor" stroke="none" />,
  pin: <><path d="M12 21s7-5.500 7-11a7 7 0 0 0-14 0c0 5.500 7 11 7 11z" /><circle cx="12" cy="10" r="2.500" /></>,
  brain: <><path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V4a3 3 0 0 0-3 0z" /><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1" /></>,
  tool: <path d="M14.500 5.500a4 4 0 0 0 4.800 4.800L12 17.600a2.500 2.500 0 0 1-3.600-3.600zM8 16l-4 4" />,
  alert: <><path d="M12 4l9 16H3z" /><path d="M12 10v4M12 17.500v.100" /></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  whatsapp: <><path d="M4 20l1.300-4.200A8 8 0 1 1 8.400 18.800z" /><path d="M9 8.800c.300 2.800 2.600 5.200 5.700 6l1.300-1.400-2-1-1 .8c-1-.4-1.800-1.200-2.200-2.200l.8-1-1-2z" fill="currentColor" stroke="none" /></>,
};

export default function Icon({ name, size = 20, className = "" }) {
  return (
    <svg className={`icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {PATHS[name]}
    </svg>
  );
}
