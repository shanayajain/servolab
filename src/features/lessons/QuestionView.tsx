import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Check, X } from 'lucide-react';
import type { AnswerValue } from '../../lib/answers';
import type { ChoiceQuestion, CodeQuestion, FillQuestion, MatchQuestion, MultiQuestion, NumericQuestion, OrderQuestion, Question, TapQuestion } from '../../lib/types';
import { componentLabel } from '../../lib/answers';
import { hashString, seeded, shuffle, shuffleDifferent } from '../../utils/random';
import { ComponentSymbol } from '../simulation/ComponentSymbol';
import { CodeBlock, Visual } from './Visual';

export const TYPE_LABEL: Record<Question['type'], string> = {
  mc: 'Multiple choice',
  tf: 'True or false',
  multi: 'Select all that apply',
  fill: 'Fill in the blank',
  match: 'Match the pairs',
  order: 'Put in order',
  tap: 'Tap the component',
  predict: 'Predict the result',
  debug: 'Debug it',
  code: 'Complete the code',
  numeric: 'Calculate',
  concept: 'Identify the concept',
  diagram: 'Read the diagram',
  scenario: 'Scenario',
  review: 'Review'
};

export type CheckState = null | 'correct' | 'wrong';

export interface QuestionProps<Q extends Question = Question> {
  q: Q;
  qid: string;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  checked: CheckState;
  /** True once the correct answer should be shown (after "Show answer" or a final wrong attempt). */
  reveal?: boolean;
}

/** Dispatches to the right renderer for each of the 15 question types. */
export function QuestionView(props: QuestionProps) {
  const { q } = props;
  const showVisualAbove = q.visual && q.type !== 'code';
  return (
    <div className="space-y-4">
      <h2 className="text-[21px] font-bold leading-snug text-ink sm:text-2xl">{q.prompt}</h2>
      {showVisualAbove && q.visual && <Visual visual={q.visual} />}
      {renderBody(props)}
    </div>
  );
}

function renderBody(props: QuestionProps) {
  const q = props.q;
  switch (q.type) {
    case 'tf':
      return <TrueFalse {...props} />;
    case 'multi':
      return <MultiSelect {...(props as QuestionProps<MultiQuestion>)} />;
    case 'fill':
      return <Fill {...(props as QuestionProps<FillQuestion>)} />;
    case 'match':
      return <Match {...(props as QuestionProps<MatchQuestion>)} />;
    case 'order':
      return <Order {...(props as QuestionProps<OrderQuestion>)} />;
    case 'tap':
      return <Tap {...(props as QuestionProps<TapQuestion>)} />;
    case 'code':
      return <Code {...(props as QuestionProps<CodeQuestion>)} />;
    case 'numeric':
      return <Numeric {...(props as QuestionProps<NumericQuestion>)} />;
    default:
      return <Choice {...(props as QuestionProps<ChoiceQuestion>)} />;
  }
}

/* ------------------------------------------------------------------ */
/*  Shared option button                                                */
/* ------------------------------------------------------------------ */
function optionTone(selected: boolean, checked: CheckState, isAnswer: boolean): string {
  if (checked) {
    if (selected && checked === 'wrong') return 'border-bad bg-bad-soft text-ink';
    if (selected && checked === 'correct') return 'border-ok bg-ok-soft text-ink';
    if (isAnswer) return 'border-ok border-dashed bg-panel text-ink';
    return 'border-line bg-panel text-ink-3';
  }
  return selected ? 'border-ink bg-brand-soft text-ink shadow-[0_3px_0_rgb(var(--ink))]' : 'border-line bg-panel text-ink shadow-[0_3px_0_rgb(var(--line))] hover:border-line-strong';
}

function Option({
  children, selected, checked, onClick, index, role = 'radio', isAnswer = false
}: { children: ReactNode; selected: boolean; checked: CheckState; onClick: () => void; index?: number; role?: 'radio' | 'checkbox'; isAnswer?: boolean }) {
  return (
    <button
      role={role}
      aria-checked={selected}
      disabled={!!checked}
      onClick={onClick}
      className={`press flex min-h-[56px] w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-[16px] font-semibold leading-snug ${optionTone(selected, checked, isAnswer)}`}
    >
      {index !== undefined && (
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 font-mono text-xs font-bold ${selected ? 'border-ink bg-panel' : 'border-line text-ink-3'}`} aria-hidden>
          {role === 'checkbox' ? selected ? <Check size={16} strokeWidth={3} /> : '' : index + 1}
        </span>
      )}
      <span className="flex-1">{children}</span>
      {checked && selected && (checked === 'correct' ? <Check className="shrink-0 text-ok" size={22} strokeWidth={3} /> : <X className="shrink-0 text-bad" size={22} strokeWidth={3} />)}
    </button>
  );
}

function useOrder(qid: string, n: number): number[] {
  return useMemo(() => shuffle(Array.from({ length: n }, (_, i) => i), seeded(hashString(qid))), [qid, n]);
}

/** Number keys 1–9 pick options, for keyboard users. */
function useNumberKeys(count: number, onPick: (displayIndex: number) => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= count) onPick(n - 1);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [count, onPick, enabled]);
}

/* ------------------------------------------------------------------ */
/*  Choice-based types: mc, predict, debug, concept, diagram, scenario, review */
/* ------------------------------------------------------------------ */
function Choice({ q, qid, value, onChange, checked, reveal }: QuestionProps<ChoiceQuestion>) {
  const order = useOrder(qid, q.options.length);
  useNumberKeys(order.length, (i) => onChange(order[i]), !checked);
  return (
    <div role="radiogroup" aria-label="Answer options" className="space-y-2.5">
      {order.map((oi, i) => (
        <Option key={oi} index={i} selected={value === oi} checked={checked} isAnswer={!!reveal && oi === q.answer} onClick={() => onChange(oi)}>
          {q.options[oi]}
        </Option>
      ))}
    </div>
  );
}

function TrueFalse({ value, onChange, checked }: QuestionProps) {
  useNumberKeys(2, (i) => onChange(i === 0), !checked);
  return (
    <div role="radiogroup" aria-label="True or false" className="grid grid-cols-2 gap-3">
      {[true, false].map((v, i) => (
        <button
          key={String(v)}
          role="radio"
          aria-checked={value === v}
          disabled={!!checked}
          onClick={() => onChange(v)}
          className={`press flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-2xl border-2 text-lg font-bold ${optionTone(value === v, checked, false)}`}
        >
          {v ? <Check size={26} strokeWidth={3} /> : <X size={26} strokeWidth={3} />}
          {v ? 'True' : 'False'}
          <span className="sr-only">option {i + 1}</span>
        </button>
      ))}
    </div>
  );
}

function MultiSelect({ q, qid, value, onChange, checked, reveal }: QuestionProps<MultiQuestion>) {
  const order = useOrder(qid, q.options.length);
  const sel = Array.isArray(value) ? (value as number[]) : [];
  const toggle = (oi: number) => onChange(sel.includes(oi) ? sel.filter((x) => x !== oi) : [...sel, oi]);
  useNumberKeys(order.length, (i) => toggle(order[i]), !checked);
  return (
    <div role="group" aria-label="Select all that apply" className="space-y-2.5">
      <p className="font-mono text-xs font-semibold uppercase tracking-wider text-ink-3">Select all that apply</p>
      {order.map((oi, i) => {
        const selected = sel.includes(oi);
        const isAns = q.answers.includes(oi);
        return (
          <Option key={oi} role="checkbox" index={i} selected={selected} checked={checked ? (selected ? (isAns ? 'correct' : 'wrong') : checked) : null} isAnswer={!!reveal && isAns} onClick={() => toggle(oi)}>
            {q.options[oi]}
            {reveal && isAns && !selected && <span className="ml-2 font-mono text-xs text-ok">(also correct)</span>}
          </Option>
        );
      })}
    </div>
  );
}

function Fill({ q, qid, value, onChange, checked }: QuestionProps<FillQuestion>) {
  const [before, after] = q.text.split('___');
  const text = typeof value === 'string' ? value : '';
  const bank = useMemo(() => (q.bank ? shuffle(q.bank, seeded(hashString(qid))) : null), [q.bank, qid]);
  const tone = checked === 'correct' ? 'border-ok bg-ok-soft' : checked === 'wrong' ? 'border-bad bg-bad-soft' : 'border-ink bg-panel';
  return (
    <div className="space-y-4">
      <p className="rounded-2xl border border-line bg-panel p-4 text-lg leading-relaxed">
        {before}
        {bank ? (
          <span className={`mx-1 inline-flex min-w-[88px] items-center justify-center rounded-lg border-2 border-dashed px-2 py-0.5 font-mono font-bold ${text ? tone : 'border-line-strong text-ink-3'}`}>{text || ' ? '}</span>
        ) : (
          <input
            aria-label="Your answer"
            value={text}
            disabled={!!checked}
            onChange={(e) => onChange(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className={`mx-1 inline-block w-36 rounded-lg border-2 px-2 py-1 font-mono font-bold outline-none focus:border-blue ${tone}`}
          />
        )}
        {after}
      </p>
      {bank && (
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Word bank">
          {bank.map((w) => (
            <button
              key={w}
              role="radio"
              aria-checked={text === w}
              disabled={!!checked}
              onClick={() => onChange(text === w ? '' : w)}
              className={`press min-h-[48px] rounded-xl border-2 px-4 font-mono text-[15px] font-bold ${text === w ? 'border-ink bg-brand-soft shadow-[0_3px_0_rgb(var(--ink))]' : 'border-line bg-panel shadow-[0_3px_0_rgb(var(--line))]'} disabled:opacity-60`}
            >
              {w}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const PAIR_COLORS = ['bg-brand-soft border-brand', 'bg-blue-soft border-blue', 'bg-gold-soft border-gold', 'bg-ok-soft border-ok', 'bg-bad-soft border-bad'];

function Match({ q, qid, value, onChange, checked }: QuestionProps<MatchQuestion>) {
  const n = q.pairs.length;
  const rightOrder = useMemo(() => shuffleDifferent(Array.from({ length: n }, (_, i) => i), seeded(hashString(qid + 'r'))), [qid, n]);
  const map = Array.isArray(value) && value.length === n ? (value as number[]) : Array(n).fill(-1);
  const [activeLeft, setActiveLeft] = useState<number | null>(null);
  const pairIndexOfRight = (ri: number) => map.indexOf(ri);
  const assign = (li: number, ri: number) => {
    const next = map.map((v) => (v === ri ? -1 : v));
    next[li] = ri;
    onChange(next);
    setActiveLeft(null);
  };
  const tapLeft = (li: number) => {
    if (checked) return;
    if (map[li] >= 0) {
      const next = [...map];
      next[li] = -1;
      onChange(next);
      setActiveLeft(li);
      return;
    }
    setActiveLeft(activeLeft === li ? null : li);
  };
  const tapRight = (ri: number) => {
    if (checked) return;
    const owner = pairIndexOfRight(ri);
    if (activeLeft !== null) return assign(activeLeft, ri);
    if (owner >= 0) {
      const next = [...map];
      next[owner] = -1;
      onChange(next);
    } else {
      const firstFree = map.findIndex((v) => v < 0);
      if (firstFree >= 0) assign(firstFree, ri);
    }
  };
  const cellCls = (paired: number, active: boolean, ok: boolean | null) =>
    `press flex min-h-[58px] w-full items-center justify-center rounded-2xl border-2 px-2.5 py-2 text-center text-[14px] font-semibold leading-tight ${
      ok === true ? 'border-ok bg-ok-soft' : ok === false ? 'border-bad bg-bad-soft' : active ? 'border-ink bg-panel shadow-[0_3px_0_rgb(var(--ink))]' : paired >= 0 ? PAIR_COLORS[paired % PAIR_COLORS.length] : 'border-line bg-panel shadow-[0_3px_0_rgb(var(--line))]'
    }`;
  return (
    <div>
      <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-ink-3">Tap an item on the left, then its partner</p>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-2.5">
          {q.pairs.map(([l], li) => (
            <button key={li} aria-pressed={activeLeft === li} disabled={!!checked} onClick={() => tapLeft(li)} className={cellCls(map[li] >= 0 ? li : -1, activeLeft === li, checked ? map[li] === li : null)}>
              {map[li] >= 0 && <span className="mr-1.5 font-mono text-[11px] text-ink-3">{li + 1}</span>}
              {l}
            </button>
          ))}
        </div>
        <div className="space-y-2.5">
          {rightOrder.map((ri) => {
            const owner = pairIndexOfRight(ri);
            return (
              <button key={ri} disabled={!!checked} onClick={() => tapRight(ri)} className={cellCls(owner, false, checked ? owner === ri : null)} aria-label={`${q.pairs[ri][1]}${owner >= 0 ? `, paired with ${q.pairs[owner][0]}` : ''}`}>
                {owner >= 0 && <span className="mr-1.5 font-mono text-[11px] text-ink-3">{owner + 1}</span>}
                {q.pairs[ri][1]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Order({ q, qid, value, onChange, checked }: QuestionProps<OrderQuestion>) {
  const pool = useMemo(() => shuffleDifferent(q.items, seeded(hashString(qid))), [q.items, qid]);
  const placed = Array.isArray(value) ? (value as string[]) : [];
  const remaining = pool.filter((x) => !placed.includes(x));
  return (
    <div className="space-y-4">
      <ol className="space-y-2" aria-label="Your order">
        {q.items.map((_, i) => {
          const item = placed[i];
          const ok = checked && item ? item === q.items[i] : null;
          return (
            <li key={i} className="flex items-center gap-2">
              <span className="w-6 shrink-0 text-right font-mono text-sm font-bold text-ink-3">{i + 1}</span>
              {item ? (
                <button
                  disabled={!!checked}
                  onClick={() => onChange(placed.filter((x) => x !== item))}
                  className={`press min-h-[50px] flex-1 rounded-xl border-2 px-3 py-2 text-left text-[15px] font-semibold ${ok === true ? 'border-ok bg-ok-soft' : ok === false ? 'border-bad bg-bad-soft' : 'border-ink bg-panel shadow-[0_2px_0_rgb(var(--ink))]'}`}
                  aria-label={`Step ${i + 1}: ${item}. Tap to remove.`}
                >
                  {item}
                </button>
              ) : (
                <div className="min-h-[50px] flex-1 rounded-xl border-2 border-dashed border-line" aria-label={`Step ${i + 1}: empty`} />
              )}
            </li>
          );
        })}
      </ol>
      {remaining.length > 0 && (
        <div>
          <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-ink-3">Tap the next step</p>
          <div className="flex flex-col gap-2">
            {remaining.map((item) => (
              <button key={item} disabled={!!checked} onClick={() => onChange([...placed, item])} className="press min-h-[50px] rounded-xl border-2 border-line bg-panel px-3 py-2 text-left text-[15px] font-semibold shadow-[0_3px_0_rgb(var(--line))]">
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Tap({ q, qid, value, onChange, checked }: QuestionProps<TapQuestion>) {
  const order = useOrder(qid, q.targets.length);
  useNumberKeys(order.length, (i) => onChange(order[i]), !checked);
  return (
    <div role="radiogroup" aria-label="Components" className="grid grid-cols-2 gap-3">
      {order.map((ti, i) => {
        const selected = value === ti;
        const ok = checked && selected ? checked === 'correct' : null;
        return (
          <button
            key={ti}
            role="radio"
            aria-checked={selected}
            aria-label={`Component ${String.fromCharCode(65 + i)}${checked ? `: ${componentLabel(q.targets[ti])}` : ''}`}
            disabled={!!checked}
            onClick={() => onChange(ti)}
            className={`press flex min-h-[112px] flex-col items-center justify-center gap-1 rounded-2xl border-2 p-2 text-ink ${
              ok === true ? 'border-ok bg-ok-soft' : ok === false ? 'border-bad bg-bad-soft' : selected ? 'border-ink bg-brand-soft shadow-[0_3px_0_rgb(var(--ink))]' : 'border-line bg-panel shadow-[0_3px_0_rgb(var(--line))]'
            }`}
          >
            <ComponentSymbol kind={q.targets[ti]} size={96} />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-3">{checked ? componentLabel(q.targets[ti]) : String.fromCharCode(65 + i)}</span>
          </button>
        );
      })}
    </div>
  );
}

function Code({ q, qid, value, onChange, checked, reveal }: QuestionProps<CodeQuestion>) {
  const order = useOrder(qid, q.options.length);
  useNumberKeys(order.length, (i) => onChange(order[i]), !checked);
  const chosen = typeof value === 'number' ? q.options[value] : null;
  const slot = (
    <span className={`rounded px-1.5 py-0.5 font-bold ${checked === 'correct' ? 'bg-[#3BAA77]/40 text-white' : checked === 'wrong' ? 'bg-[#E5383B]/40 text-white' : chosen ? 'bg-[#EB5A1E]/40 text-white' : 'bg-white/10 text-[#9AA1A9]'}`}>
      {chosen ?? '_____'}
    </span>
  );
  return (
    <div className="space-y-4">
      {q.visual && q.visual.kind !== 'code' && <Visual visual={q.visual} />}
      <CodeBlock code={q.code} lang={q.lang} slot={slot} />
      <div role="radiogroup" aria-label="Code options" className="grid grid-cols-2 gap-2.5">
        {order.map((oi) => (
          <button
            key={oi}
            role="radio"
            aria-checked={value === oi}
            disabled={!!checked}
            onClick={() => onChange(oi)}
            className={`press min-h-[52px] rounded-xl border-2 px-3 font-mono text-[15px] font-bold ${optionTone(value === oi, checked, !!reveal && oi === q.answer)}`}
          >
            {q.options[oi]}
          </button>
        ))}
      </div>
    </div>
  );
}

function Numeric({ q, value, onChange, checked }: QuestionProps<NumericQuestion>) {
  const text = typeof value === 'string' ? value : '';
  const tone = checked === 'correct' ? 'border-ok bg-ok-soft' : checked === 'wrong' ? 'border-bad bg-bad-soft' : 'border-ink bg-panel focus-within:border-blue';
  return (
    <div className="space-y-2">
      <label className={`flex items-center gap-2 rounded-2xl border-2 px-4 py-3 ${tone}`}>
        <span className="sr-only">Your answer</span>
        <input
          inputMode="decimal"
          enterKeyHint="done"
          value={text}
          disabled={!!checked}
          onChange={(e) => onChange(e.target.value.replace(/[^\d.,\-+eEkKmM\s]/g, ''))}
          placeholder="Type a number"
          className="tabular min-w-0 flex-1 bg-transparent font-mono text-2xl font-bold text-ink outline-none placeholder:text-ink-3 placeholder:text-lg"
          autoComplete="off"
        />
        {q.unit && <span className="font-mono text-lg font-bold text-ink-2">{q.unit}</span>}
      </label>
      <p className="px-1 text-xs text-ink-3">Answers within {Math.round((q.tolerance ?? 0.02) * 100)}% are accepted.</p>
    </div>
  );
}
