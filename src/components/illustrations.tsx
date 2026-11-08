import type { ReactNode } from 'react';
import { iconFor } from './icons';

export const AVATAR_COLORS: Record<string, { label: string; body: string; accent: string }> = {
  orange: { label: 'Industrial orange', body: '#EB5A1E', accent: '#FFB48A' },
  blue: { label: 'Blueprint blue', body: '#2C5D9E', accent: '#9CC0F0' },
  green: { label: 'Solder-mask green', body: '#1F7A55', accent: '#8FD9B6' },
  gold: { label: 'Brass', body: '#C98B0A', accent: '#F6D27A' },
  graphite: { label: 'Graphite', body: '#3A3F45', accent: '#A9B0B8' },
  crimson: { label: 'Signal red', body: '#B72E45', accent: '#F2A3B0' }
};

/**
 * "Servo" — the Servolab robot. One consistent line style:
 * 3px graphite outlines, flat fills, a single round lens eye.
 */
export function Robot({
  size = 120,
  color = 'orange',
  mood = 'idle',
  className = '',
  label
}: {
  size?: number;
  color?: string;
  mood?: 'idle' | 'happy' | 'think' | 'sad';
  className?: string;
  label?: string;
}) {
  const c = AVATAR_COLORS[color] ?? AVATAR_COLORS.orange;
  const ink = '#1C1F22';
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} role="img" aria-label={label ?? 'Servo the robot'}>
      {/* antenna */}
      <line x1="60" y1="10" x2="60" y2="24" stroke={ink} strokeWidth="3" strokeLinecap="round" />
      <circle cx="60" cy="9" r="5" fill={mood === 'happy' ? '#E8A317' : c.body} stroke={ink} strokeWidth="3" />
      {/* ears */}
      <rect x="14" y="40" width="10" height="22" rx="3" fill={ink} />
      <rect x="96" y="40" width="10" height="22" rx="3" fill={ink} />
      {/* head */}
      <rect x="22" y="24" width="76" height="56" rx="16" fill="#F6F2EA" stroke={ink} strokeWidth="3" />
      {/* visor line */}
      <path d="M32 34h56" stroke={c.accent} strokeWidth="3" strokeLinecap="round" opacity=".9" />
      {/* eye */}
      <circle cx="60" cy="54" r="16" fill={ink} />
      {mood === 'happy' ? (
        <path d="M50 56c3-6 17-6 20 0" stroke={c.body} strokeWidth="5" strokeLinecap="round" fill="none" />
      ) : mood === 'sad' ? (
        <path d="M50 58c3 5 17 5 20 0" stroke={c.body} strokeWidth="5" strokeLinecap="round" fill="none" />
      ) : (
        <>
          <circle cx="60" cy="54" r="9" fill={c.body} />
          <circle cx={mood === 'think' ? 56 : 64} cy={mood === 'think' ? 49 : 50} r="3" fill="#F6F2EA" />
        </>
      )}
      {/* neck + body */}
      <rect x="52" y="80" width="16" height="8" fill={ink} />
      <rect x="30" y="88" width="60" height="26" rx="8" fill={c.body} stroke={ink} strokeWidth="3" />
      <rect x="40" y="95" width="18" height="10" rx="2" fill="#F6F2EA" stroke={ink} strokeWidth="2" />
      <circle cx="74" cy="100" r="4" fill={c.accent} stroke={ink} strokeWidth="2" />
      {mood === 'think' && (
        <g fill={c.body} stroke={ink} strokeWidth="2">
          <circle cx="104" cy="22" r="3" />
          <circle cx="111" cy="12" r="4.5" />
        </g>
      )}
    </svg>
  );
}

/** Hexagonal achievement badge. Locked badges are drawn as an outline with a dashed border. */
export function AchievementBadge({ icon, tier, unlocked, size = 64 }: { icon: string; tier: 1 | 2 | 3; unlocked: boolean; size?: number }) {
  const Icon = iconFor(icon);
  const fills = { 1: '#EB5A1E', 2: '#2C5D9E', 3: '#C98B0A' };
  const fill = unlocked ? fills[tier] : 'transparent';
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 64 64" width={size} height={size} className="absolute inset-0">
        <path
          d="M32 3 57 17.5v29L32 61 7 46.5v-29Z"
          fill={fill}
          stroke={unlocked ? '#1C1F22' : 'rgb(var(--line-strong))'}
          strokeWidth="3"
          strokeDasharray={unlocked ? undefined : '5 4'}
          strokeLinejoin="round"
        />
        {unlocked && <path d="M32 9 52 20.5v23L32 55 12 43.5v-23Z" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="2" />}
        {unlocked && tier === 3 && <path d="M22 6l4 4M42 6l-4 4" stroke="#1C1F22" strokeWidth="2" />}
      </svg>
      <Icon size={size * 0.38} strokeWidth={2.4} className={`relative ${unlocked ? 'text-white' : 'text-ink-3'}`} />
    </div>
  );
}

/** Small square emblem used for tracks. */
export function TrackEmblem({ icon, size = 44, active = true }: { icon: string; size?: number; active?: boolean }) {
  const Icon = iconFor(icon);
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl border-2 ${active ? 'border-ink bg-brand text-[#1C1F22]' : 'border-line bg-sunken text-ink-3'}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Icon size={size * 0.5} strokeWidth={2.3} />
    </span>
  );
}

/** Notebook-style blueprint frame used around diagrams. */
export function Blueprint({ children, caption, className = '' }: { children: ReactNode; caption?: string; className?: string }) {
  return (
    <figure className={`bg-blueprint overflow-hidden rounded-2xl border border-line bg-panel ${className}`}>
      <div className="p-3">{children}</div>
      {caption && <figcaption className="border-t border-line px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-ink-3">{caption}</figcaption>}
    </figure>
  );
}
