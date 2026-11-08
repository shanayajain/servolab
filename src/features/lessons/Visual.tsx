import type { ReactNode } from 'react';
import type { Visual as VisualT } from '../../lib/types';
import { Diagram, LoopDiagram, ParallelDiagram } from './diagrams';
import { SimView } from '../simulation/simRegistry';
import { ComponentSymbol } from '../simulation/ComponentSymbol';
import { componentLabel } from '../../lib/answers';

export function Visual({ visual, compactSim = true }: { visual: VisualT; compactSim?: boolean }) {
  switch (visual.kind) {
    case 'diagram':
      return (
        <Frame>
          <Diagram id={visual.id} props={visual.props} />
        </Frame>
      );
    case 'loop':
      return (
        <Frame>
          <LoopDiagram elements={visual.elements} caption={visual.caption} />
        </Frame>
      );
    case 'parallel':
      return (
        <Frame>
          <ParallelDiagram source={visual.source} branches={visual.branches} caption={visual.caption} />
        </Frame>
      );
    case 'code':
      return <CodeBlock code={visual.code} lang={visual.lang} />;
    case 'sim':
      return <SimView id={visual.id} compact={compactSim} />;
    case 'component':
      return (
        <Frame>
          <div className="flex flex-col items-center gap-1 py-2 text-ink">
            <ComponentSymbol kind={visual.component} size={150} />
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-ink-3">{componentLabel(visual.component)}</span>
          </div>
        </Frame>
      );
    default:
      return null;
  }
}

function Frame({ children }: { children: ReactNode }) {
  return <div className="bg-blueprint rounded-2xl border border-line bg-panel p-2">{children}</div>;
}

const KEYWORDS = new Set([
  'int', 'float', 'double', 'bool', 'char', 'void', 'long', 'unsigned', 'const', 'volatile', 'static', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break',
  'class', 'public', 'private', 'struct', 'enum', 'new', 'delete', 'true', 'false', 'nullptr', 'include', 'def', 'import', 'from', 'in', 'elif', 'and', 'or', 'not',
  'True', 'False', 'None', 'self', 'print', 'range', 'auto', 'this', 'using', 'namespace', 'MOV', 'ADD', 'LDR', 'STR', 'CMP', 'BEQ', 'B', 'SUB'
]);

/** Tiny syntax highlighter (keywords, strings, comments, numbers). `slot` renders the ___ placeholder. */
export function CodeBlock({ code, lang, slot }: { code: string; lang?: string; slot?: ReactNode }) {
  const lines = code.split('\n');
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-ink bg-[#1C1F22] text-[#E9E4D8]">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9AA1A9]">{lang === 'python' ? 'Python' : lang === 'asm' ? 'Assembly' : lang === 'c' ? 'C' : 'C++ / Arduino'}</span>
        <span className="flex gap-1" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-[#EB5A1E]" />
          <span className="h-2 w-2 rounded-full bg-[#E8A317]" />
          <span className="h-2 w-2 rounded-full bg-[#3BAA77]" />
        </span>
      </div>
      <pre className="code no-scrollbar px-3 py-3" aria-label="Code">
        {lines.map((line, i) => (
          <div key={i} className="min-h-[1.6em]">
            {highlight(line, lang, slot)}
          </div>
        ))}
      </pre>
    </div>
  );
}

function highlight(line: string, lang: string | undefined, slot?: ReactNode): ReactNode[] {
  const out: ReactNode[] = [];
  const commentMark = lang === 'python' ? '#' : lang === 'asm' ? ';' : '//';
  let commentAt = -1;
  // find comment start not inside a string
  let inStr: string | null = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inStr) {
      if (ch === inStr) inStr = null;
    } else if (ch === '"' || ch === "'") inStr = ch;
    else if (line.startsWith(commentMark, i) && !(lang !== 'python' && line.startsWith('#include', i))) {
      commentAt = i;
      break;
    }
  }
  const body = commentAt >= 0 ? line.slice(0, commentAt) : line;
  const comment = commentAt >= 0 ? line.slice(commentAt) : '';
  const re = /("[^"]*"|'[^']*'|___|\b\d+(?:\.\d+)?\b|[A-Za-z_#][A-Za-z0-9_]*|\s+|.)/g;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(body))) {
    const tok = m[0];
    if (tok === '___') out.push(<span key={k++}>{slot ?? <span className="rounded bg-[#EB5A1E]/25 px-1 text-[#FFB48A]">___</span>}</span>);
    else if (tok[0] === '"' || tok[0] === "'") out.push(<span key={k++} className="text-[#A6D189]">{tok}</span>);
    else if (/^\d/.test(tok)) out.push(<span key={k++} className="text-[#F2C46D]">{tok}</span>);
    else if (KEYWORDS.has(tok.replace('#', ''))) out.push(<span key={k++} className="font-semibold text-[#FF8A5B]">{tok}</span>);
    else if (/^[A-Za-z_]/.test(tok) && body[m.index + tok.length] === '(') out.push(<span key={k++} className="text-[#8CB8FF]">{tok}</span>);
    else out.push(tok);
  }
  if (comment) out.push(<span key={k++} className="italic text-[#7D858E]">{comment}</span>);
  return out;
}
