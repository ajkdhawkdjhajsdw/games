import type { CSSProperties } from 'react';
const paths: Record<string, React.ReactNode> = {
  arrow: <><path d="M4 12h15m-6-6 6 6-6 6" /></>,
  back: <path d="m14 5-7 7 7 7M7 12h14" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  check: <path d="m5 12 4 4L19 6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" /></>,
  people: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-3a6 6 0 0 1 12 0v3m1-15a3 3 0 0 1 0 6m3 9v-3a5 5 0 0 0-2-4" /></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" /></>,
  volume: <><path d="m3 9 4 0 5-4v14l-5-4H3Zm13-1a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" /></>,
  mute: <><path d="m3 9 4 0 5-4v14l-5-4H3Zm13 0 5 6m-5 0 5-6" /></>,
  settings: <><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="3" /><circle cx="15" cy="17" r="3" /></>,
  book: <><path d="M12 6C8 3 4 4 3 5v14c3-2 6-1 9 1 3-2 6-3 9-1V5c-1-1-5-2-9 1Zm0 0v14" /></>,
  anchor: <><circle cx="12" cy="5" r="3" /><path d="M12 8v13M7 11h10M3 14c0 9 18 9 18 0M1 16l2-2 3 2m12 0 3-2 2 2" /></>,
  parcel: <><path d="m3 7 9-4 9 4v11l-9 4-9-4Zm0 0 9 4 9-4m-9 4v11M7 5l9 4v5" /></>,
  flag: <><path d="M5 22V3m0 1c5-5 9 5 15 0v10c-6 5-10-5-15 0" /></>,
  list: <><path d="M9 5h12M9 12h12M9 19h12" /><circle cx="3" cy="5" r="1" /><circle cx="3" cy="12" r="1" /><circle cx="3" cy="19" r="1" /></>,
  chart: <><circle cx="5" cy="6" r="3" /><circle cx="19" cy="5" r="3" /><circle cx="13" cy="19" r="3" /><path d="m8 6 8-1M6 9l6 7m6-8-4 8" /></>,
  copy: <><rect x="8" y="8" width="13" height="13" rx="2" /><path d="M16 8V3H3v13h5" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9 8a3 3 0 0 1 6 0c0 3-3 2-3 5m0 3v1" /></>,
  star: <path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" />,
  waves: <><path d="M2 8c4-5 6 5 10 0s6 5 10 0M2 15c4-5 6 5 10 0s6 5 10 0" /></>,
};
export function Icon({ name, size = 20, style }: { name: string; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>{paths[name] || paths.anchor}</svg>;
}
