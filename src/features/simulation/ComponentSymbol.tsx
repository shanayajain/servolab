import type { ReactElement } from 'react';
import type { ComponentKind } from '../../lib/types';

/**
 * Schematic-style component illustrations. All drawn on a 96×64 grid with
 * the same stroke weight so they read as one family.
 */
export function ComponentSymbol({ kind, size = 96, className = '' }: { kind: ComponentKind; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 96 64" width={size} height={(size * 64) / 96} className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      {SYMBOLS[kind]}
    </svg>
  );
}

const lead = (x1: number, x2: number, y = 32) => <path d={`M${x1} ${y}H${x2}`} />;

const SYMBOLS: Record<ComponentKind, ReactElement> = {
  battery: (
    <>
      {lead(8, 40)}
      <path d="M40 18v28" strokeWidth={4} />
      <path d="M50 24v16" strokeWidth={6} />
      {lead(50, 88)}
      <path d="M30 14h6M33 11v6" strokeWidth={2} />
    </>
  ),
  resistor: (
    <>
      {lead(6, 22)}
      <path d="M22 32l5-10 8 20 8-20 8 20 8-20 8 20 5-10" />
      {lead(72, 90)}
    </>
  ),
  led: (
    <>
      {lead(6, 34)}
      <path d="M34 20v24l22-12Z" fill="currentColor" fillOpacity={0.12} />
      <path d="M56 20v24" />
      {lead(56, 90)}
      <path d="M50 14l8-8M58 6h-5M58 6v5M60 18l8-8M68 10h-5M68 10v5" strokeWidth={2} />
    </>
  ),
  capacitor: (
    <>
      {lead(6, 42)}
      <path d="M42 16v32M54 16v32" strokeWidth={4} />
      {lead(54, 90)}
    </>
  ),
  diode: (
    <>
      {lead(6, 34)}
      <path d="M34 18v28l24-14Z" />
      <path d="M58 18v28" strokeWidth={4} />
      {lead(58, 90)}
    </>
  ),
  transistor: (
    <>
      <circle cx="54" cy="32" r="20" strokeWidth={2.5} />
      {lead(10, 44)}
      <path d="M44 20v24" strokeWidth={4} />
      <path d="M44 26l14-12V4M44 38l14 12v10" />
      <path d="M52 46l6 4-1-7" strokeWidth={2.5} />
    </>
  ),
  switch: (
    <>
      {lead(6, 30)}
      <circle cx="32" cy="32" r="3" fill="currentColor" />
      <path d="M33 30l28-14" />
      <circle cx="64" cy="32" r="3" fill="currentColor" />
      {lead(66, 90)}
    </>
  ),
  button: (
    <>
      {lead(6, 30)}
      <circle cx="32" cy="40" r="3" fill="currentColor" />
      <circle cx="64" cy="40" r="3" fill="currentColor" />
      {lead(66, 90, 40)}
      <path d="M6 40h24" />
      <path d="M26 28h44M48 28V12M40 12h16" />
    </>
  ),
  potentiometer: (
    <>
      {lead(6, 22)}
      <path d="M22 36l5-10 8 20 8-20 8 20 8-20 8 20 5-10" />
      {lead(72, 90, 36)}
      <path d="M48 6v18M42 18l6 7 6-7" />
    </>
  ),
  inductor: (
    <>
      {lead(6, 20)}
      <path d="M20 36a7 7 0 0 1 14 0a7 7 0 0 1 14 0a7 7 0 0 1 14 0a7 7 0 0 1 14 0" />
      {lead(76, 90, 36)}
    </>
  ),
  motor: (
    <>
      {lead(6, 30)}
      <circle cx="48" cy="32" r="18" />
      <path d="M40 40V24l8 10 8-10v16" strokeWidth={2.5} />
      {lead(66, 90)}
    </>
  ),
  servo: (
    <>
      <rect x="14" y="20" width="56" height="30" rx="4" />
      <circle cx="56" cy="20" r="7" />
      <path d="M56 20L84 10" strokeWidth={4} />
      <path d="M14 30H4M14 36H4M14 42H4" strokeWidth={2} />
    </>
  ),
  stepper: (
    <>
      <rect x="22" y="12" width="44" height="40" rx="3" />
      <circle cx="44" cy="32" r="10" />
      <path d="M44 22v20M34 32h20" strokeWidth={2} />
      <path d="M66 32h22" />
      <path d="M8 20h14M8 28h14M8 36h14M8 44h14" strokeWidth={2} />
    </>
  ),
  ultrasonic: (
    <>
      <rect x="6" y="12" width="84" height="38" rx="5" />
      <circle cx="28" cy="31" r="12" />
      <circle cx="68" cy="31" r="12" />
      <circle cx="28" cy="31" r="5" strokeWidth={2} />
      <circle cx="68" cy="31" r="5" strokeWidth={2} />
      <path d="M36 56h24" strokeWidth={2} />
    </>
  ),
  ir: (
    <>
      <rect x="14" y="10" width="68" height="44" rx="5" />
      <circle cx="36" cy="44" r="6" />
      <circle cx="60" cy="44" r="6" fill="currentColor" fillOpacity={0.3} />
      <path d="M30 20h36" strokeWidth={2} />
      <path d="M44 28h8" strokeWidth={2} />
    </>
  ),
  ldr: (
    <>
      {lead(6, 26)}
      <rect x="26" y="24" width="44" height="16" rx="3" />
      {lead(70, 90)}
      <path d="M24 6l10 12M34 18h-5M34 18v-5M38 4l10 12M48 16h-5M48 16v-5" strokeWidth={2} />
    </>
  ),
  mcu: (
    <>
      <rect x="22" y="8" width="52" height="48" rx="4" />
      <circle cx="31" cy="17" r="2.5" fill="currentColor" />
      {[16, 26, 36, 46].map((y) => (
        <path key={`l${y}`} d={`M10 ${y}h12M74 ${y}h12`} strokeWidth={2.5} />
      ))}
      <path d="M38 32h20" strokeWidth={2} />
    </>
  ),
  driver: (
    <>
      <rect x="18" y="10" width="60" height="44" rx="4" />
      <path d="M30 24h12l-4-4M30 24l4 4M66 40H54l4 4M66 40l-4-4" strokeWidth={2} />
      <path d="M6 24h12M6 40h12M78 24h12M78 40h12" strokeWidth={2.5} />
    </>
  ),
  regulator: (
    <>
      <rect x="28" y="14" width="40" height="30" rx="3" />
      {lead(6, 28, 29)}
      {lead(68, 90, 29)}
      <path d="M48 44v14M40 58h16" />
      <path d="M38 29h20" strokeWidth={2} />
    </>
  ),
  ground: (
    <>
      <path d="M48 6v24" />
      <path d="M28 30h40M34 40h28M41 50h14" />
    </>
  ),
  imu: (
    <>
      <rect x="22" y="10" width="52" height="44" rx="4" />
      <path d="M48 44V22M48 22l-5 6M48 22l5 6M48 44l18-8M66 36l-7-1M66 36l-3 6" strokeWidth={2.2} />
      <path d="M10 22h12M10 32h12M10 42h12" strokeWidth={2} />
    </>
  ),
  encoder: (
    <>
      <circle cx="48" cy="32" r="24" />
      <circle cx="48" cy="32" r="5" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return <rect key={i} x={48 + 15 * Math.cos(a) - 2.5} y={32 + 15 * Math.sin(a) - 2.5} width="5" height="5" fill="currentColor" stroke="none" />;
      })}
    </>
  )
};
