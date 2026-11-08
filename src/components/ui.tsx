import { forwardRef, useEffect, useId, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { X } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'ok';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand text-[#1C1F22] border-2 border-ink shadow-[0_3px_0_rgb(var(--ink))] active:shadow-[0_1px_0_rgb(var(--ink))] disabled:bg-sunken disabled:text-ink-3 disabled:border-line disabled:shadow-none',
  secondary: 'bg-panel text-ink border-2 border-ink shadow-[0_3px_0_rgb(var(--ink))] active:shadow-[0_1px_0_rgb(var(--ink))] disabled:text-ink-3 disabled:border-line disabled:shadow-none',
  ghost: 'bg-transparent text-ink border-2 border-transparent hover:bg-sunken',
  danger: 'bg-bad text-white border-2 border-ink shadow-[0_3px_0_rgb(var(--ink))] active:shadow-[0_1px_0_rgb(var(--ink))]',
  ok: 'bg-ok text-white border-2 border-ink shadow-[0_3px_0_rgb(var(--ink))] active:shadow-[0_1px_0_rgb(var(--ink))]'
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'md' | 'lg' | 'sm';
  block?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', block, icon, className = '', children, ...rest },
  ref
) {
  const sizes = size === 'lg' ? 'min-h-[54px] px-5 text-[17px]' : size === 'sm' ? 'min-h-[40px] px-3 text-sm' : 'min-h-[48px] px-4 text-[15px]';
  return (
    <button
      ref={ref}
      className={`press inline-flex items-center justify-center gap-2 rounded-xl font-bold tracking-wide ${sizes} ${VARIANTS[variant]} ${block ? 'w-full' : ''} disabled:cursor-not-allowed ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
});

export function Card({ children, className = '', as: Tag = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'section' | 'li' }) {
  return <Tag className={`rounded-2xl border border-line bg-panel ${className}`}>{children}</Tag>;
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2 mt-6 flex items-end justify-between px-1">
      <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-3">{children}</h2>
      {action}
    </div>
  );
}

export function ProgressBar({ value, tone = 'brand', className = '', label }: { value: number; tone?: 'brand' | 'ok' | 'gold' | 'blue'; className?: string; label?: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  const color = { brand: 'bg-brand', ok: 'bg-ok', gold: 'bg-gold', blue: 'bg-blue' }[tone];
  return (
    <div
      className={`h-2.5 w-full overflow-hidden rounded-full bg-sunken ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label}
    >
      <div className={`h-full rounded-full ${color} transition-[width] duration-500 ease-out`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Ring({ value, size = 64, stroke = 7, tone = 'brand', children, label }: { value: number; size?: number; stroke?: number; tone?: 'brand' | 'ok' | 'gold' | 'blue'; children?: ReactNode; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  const color = { brand: 'rgb(var(--brand))', ok: 'rgb(var(--ok))', gold: 'rgb(var(--gold))', blue: 'rgb(var(--blue))' }[tone];
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={label ?? `${Math.round(v * 100)}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--sunken))" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(.2,.8,.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

/** Bottom sheet modal with focus trap-lite, Escape to close, and backdrop tap. */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => ref.current?.querySelector<HTMLElement>('button, [href], input, select, textarea')?.focus(), 30);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prev?.focus?.();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby={id}>
      <button aria-label="Close" className="anim-fade absolute inset-0 cursor-default bg-[#0c0d0e]/45" onClick={onClose} tabIndex={-1} />
      <div ref={ref} className="anim-sheet relative max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border-2 border-ink bg-paper px-5 pb-safe pt-3 sm:rounded-3xl">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line sm:hidden" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id={id} className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="press flex h-11 w-11 items-center justify-center rounded-xl hover:bg-sunken" aria-label="Close">
            <X size={22} />
          </button>
        </div>
        <div className="pb-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmSheet({
  open, title, message, confirmLabel, danger, onConfirm, onCancel
}: { open: boolean; title: string; message: ReactNode; confirmLabel: string; danger?: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Sheet open={open} onClose={onCancel} title={title}>
      <div className="text-[15px] leading-relaxed text-ink-2">{message}</div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Sheet>
  );
}

export function Chip({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'brand' | 'ok' | 'bad' | 'gold' | 'blue' }) {
  const tones = {
    neutral: 'bg-sunken text-ink-2',
    brand: 'bg-brand-soft text-brand-deep',
    ok: 'bg-ok-soft text-ok',
    bad: 'bg-bad-soft text-bad',
    gold: 'bg-gold-soft text-gold',
    blue: 'bg-blue-soft text-blue'
  }[tone];
  return <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider ${tones}`}>{children}</span>;
}

export function Difficulty({ level }: { level: 1 | 2 | 3 }) {
  const names = ['', 'Beginner', 'Intermediate', 'Advanced'];
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-3" aria-label={`Difficulty: ${names[level]}`}>
      <span className="flex gap-0.5" aria-hidden>
        {[1, 2, 3].map((i) => (
          <span key={i} className={`h-2.5 w-1.5 rounded-sm ${i <= level ? 'bg-ink' : 'bg-line'}`} />
        ))}
      </span>
      {names[level]}
    </span>
  );
}
