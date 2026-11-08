import { useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { Award, Bolt, BookOpen, Check, ChevronRight, Clock, Copy, Download, Flame, HardDrive, Medal, Palette, Pencil, Settings, Target, Trash2, Upload, Wrench } from 'lucide-react';
import { Page, SubHeader } from '../components/AppShell';
import { Button, Card, ConfirmSheet, ProgressBar, SectionTitle, Sheet } from '../components/ui';
import { AchievementBadge, AVATAR_COLORS, Robot, TrackEmblem } from '../components/illustrations';
import { useData, useProgress } from '../store/useProgress';
import { accuracyOf, createInitialProgress, liveStreak } from '../store/logic';
import { levelProgress, levelTitle } from '../features/gamification/levels';
import { achievements } from '../features/gamification/achievements';
import { getLesson, lessonsForTrack, totalLessonCount, totalQuestionCount, tracks } from '../data/curriculum';
import { projects } from '../data/projects/projects';
import { dayKey, formatDuration } from '../utils/date';
import { clearProgress, exportJson, getStorageStatus, importJson } from '../lib/persistence';
import type { ProgressData, Settings as SettingsT } from '../lib/types';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/* ------------------------------------------------------------------ */
/*  Profile                                                             */
/* ------------------------------------------------------------------ */
export function ProfilePage() {
  const d = useData((x) => x);
  const setName = useProgress((s) => s.setName);
  const setAvatarColor = useProgress((s) => s.setAvatarColor);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(d.profile.name);
  const [colorSheet, setColorSheet] = useState(false);
  useDocumentTitle('Profile');
  const lp = levelProgress(d.xp);
  const lessonsDone = Object.keys(d.lessons).filter((id) => getLesson(id)).length;
  const mastered = Object.entries(d.concepts).filter(([id, c]) => c.state === 'MASTERED' && getLesson(id)).length;
  const projectsDone = Object.values(d.projects).filter((p) => p.completedAt).length;
  const unlocked = achievements.filter((a) => d.achievements[a.id]);
  const currentTracks = tracks.filter((t) => lessonsForTrack(t.id).some((l) => d.lessons[l.id]) || t.id === d.selectedTrack);

  const save = () => {
    setName(draft);
    setEditing(false);
  };

  return (
    <Page
      title="Profile"
      eyebrow={`Member since ${new Date(d.profile.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}`}
      actions={
        <Link to="/settings" className="press flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ink bg-panel" aria-label="Settings">
          <Settings size={20} />
        </Link>
      }
    >
      <section className="bg-blueprint flex flex-col items-center rounded-2xl border-2 border-ink bg-panel px-4 pb-5 pt-4 text-center">
        <button onClick={() => setColorSheet(true)} className="press relative rounded-2xl" aria-label="Change robot colour">
          <Robot size={124} color={d.profile.avatarColor} mood="happy" label={`${d.profile.name}'s robot`} />
          <span className="absolute -right-1 bottom-2 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink bg-panel"><Palette size={16} /></span>
        </button>
        {editing ? (
          <form className="mt-3 flex w-full max-w-xs gap-2" onSubmit={(e) => { e.preventDefault(); save(); }}>
            <label className="sr-only" htmlFor="name">Display name</label>
            <input id="name" value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={40} autoFocus className="min-h-[48px] min-w-0 flex-1 rounded-xl border-2 border-ink bg-paper px-3 text-lg font-bold outline-none focus:border-blue" />
            <Button type="submit" aria-label="Save name" icon={<Check size={18} />} />
          </form>
        ) : (
          <button onClick={() => { setDraft(d.profile.name); setEditing(true); }} className="press mt-3 flex min-h-[44px] items-center gap-2 rounded-xl px-2 text-2xl font-bold" aria-label={`Name: ${d.profile.name}. Edit name`}>
            {d.profile.name} <Pencil size={16} className="text-ink-3" />
          </button>
        )}
        <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-brand-deep">Level {lp.level} · {levelTitle(lp.level)}</p>
        <div className="mt-3 w-full max-w-xs">
          <ProgressBar value={lp.fraction} label="Level progress" />
          <p className="mt-1 font-mono text-[11px] text-ink-3">{lp.into}/{lp.needed} XP to level {lp.level + 1}</p>
        </div>
      </section>

      <div className="stagger mt-3 grid grid-cols-3 gap-2">
        <MiniStat icon={<Bolt size={16} className="text-gold" />} value={d.xp.toLocaleString()} label="XP" />
        <MiniStat icon={<Flame size={16} className="text-brand" />} value={String(liveStreak(d))} label="Streak" />
        <MiniStat icon={<Award size={16} className="text-brand" />} value={String(d.streak.longest)} label="Longest" />
        <MiniStat icon={<BookOpen size={16} className="text-blue" />} value={`${lessonsDone}`} label="Lessons" />
        <MiniStat icon={<Check size={16} className="text-ok" />} value={d.stats.answered.toLocaleString()} label="Answered" />
        <MiniStat icon={<Target size={16} className="text-blue" />} value={d.stats.answered ? `${Math.round(accuracyOf(d) * 100)}%` : '—'} label="Accuracy" />
        <MiniStat icon={<Medal size={16} className="text-ok" />} value={String(mastered)} label="Mastered" />
        <MiniStat icon={<Wrench size={16} className="text-ink-2" />} value={`${projectsDone}/${projects.length}`} label="Projects" />
        <MiniStat icon={<Clock size={16} className="text-ink-2" />} value={formatDuration(d.stats.seconds)} label="Time" />
      </div>

      <SectionTitle>Current tracks</SectionTitle>
      <Card className="divide-y divide-line">
        {currentTracks.map((t) => {
          const ls = lessonsForTrack(t.id);
          const done = ls.filter((l) => d.lessons[l.id]).length;
          return (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3">
              <TrackEmblem icon={t.icon} size={36} />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2"><span className="truncate font-semibold">{t.title}</span><span className="font-mono text-xs font-bold text-ink-2">{done}/{ls.length}</span></div>
                <ProgressBar value={done / ls.length} className="mt-1.5" label={`${t.title} progress`} />
              </div>
            </div>
          );
        })}
      </Card>

      <SectionTitle action={<Link to="/profile/achievements" className="press flex min-h-[32px] items-center gap-1 text-sm font-bold text-blue">All {achievements.length} <ChevronRight size={16} /></Link>}>
        Achievements · {unlocked.length}
      </SectionTitle>
      <Link to="/profile/achievements" className="press block rounded-2xl border border-line bg-panel p-4" aria-label="View all achievements">
        <div className="grid grid-cols-4 gap-3">
          {achievements.slice(0, 8).map((a) => (
            <div key={a.id} className="flex flex-col items-center gap-1 text-center">
              <AchievementBadge icon={a.icon} tier={a.tier} unlocked={!!d.achievements[a.id]} size={52} />
              <span className={`line-clamp-2 text-[10.5px] font-semibold leading-tight ${d.achievements[a.id] ? '' : 'text-ink-3'}`}>{a.title}</span>
            </div>
          ))}
        </div>
      </Link>

      <Sheet open={colorSheet} onClose={() => setColorSheet(false)} title="Robot colour">
        <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Robot colour">
          {Object.entries(AVATAR_COLORS).map(([key, c]) => (
            <button key={key} role="radio" aria-checked={d.profile.avatarColor === key} onClick={() => { setAvatarColor(key); setColorSheet(false); }} className={`press flex flex-col items-center rounded-2xl border-2 p-2 ${d.profile.avatarColor === key ? 'border-ink bg-brand-soft' : 'border-line bg-panel'}`}>
              <Robot size={72} color={key} label={c.label} />
              <span className="mt-1 text-xs font-semibold">{c.label}</span>
            </button>
          ))}
        </div>
      </Sheet>
    </Page>
  );
}

function MiniStat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel px-2.5 py-2">
      <div className="flex items-center gap-1">{icon}<span className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-ink-3">{label}</span></div>
      <p className="tabular mt-0.5 truncate font-mono text-[17px] font-bold">{value}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Achievements                                                        */
/* ------------------------------------------------------------------ */
export function AchievementsPage() {
  const d = useData((x) => x);
  const navigate = useNavigate();
  useDocumentTitle('Achievements');
  const sorted = useMemo(() => [...achievements].sort((a, b) => Number(!!d.achievements[b.id]) - Number(!!d.achievements[a.id]) || a.tier - b.tier), [d.achievements]);
  return (
    <div className="min-h-[100dvh] pb-safe">
      <SubHeader title="Achievements" eyebrow={`${Object.keys(d.achievements).length} of ${achievements.length} unlocked`} onBack={() => navigate('/profile')} />
      <main className="mx-auto max-w-2xl px-4 pb-10 pt-4">
        <ul className="stagger space-y-2.5">
          {sorted.map((a) => {
            const p = a.progress(d);
            const at = d.achievements[a.id];
            return (
              <li key={a.id} className={`flex items-center gap-3 rounded-2xl border-2 p-3 ${at ? 'border-ink bg-panel' : 'border-line bg-panel/60'}`}>
                <AchievementBadge icon={a.icon} tier={a.tier} unlocked={!!at} size={58} />
                <div className="min-w-0 flex-1">
                  <p className="font-bold leading-tight">{a.title}</p>
                  <p className="text-sm text-ink-2">{a.description}</p>
                  {at ? (
                    <p className="mt-1 font-mono text-[11px] font-semibold text-ok">Unlocked {new Date(at).toLocaleDateString()}</p>
                  ) : (
                    <div className="mt-1.5 flex items-center gap-2">
                      <ProgressBar value={p.current / p.target} tone="blue" label={`${a.title} progress`} />
                      <span className="tabular shrink-0 font-mono text-[11px] font-bold text-ink-3">{Math.min(p.current, p.target)}/{p.target}</span>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Settings                                                            */
/* ------------------------------------------------------------------ */
export function SettingsPage() {
  const d = useData((x) => x);
  const update = useProgress((s) => s.updateSettings);
  const replaceAll = useProgress((s) => s.replaceAll);
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<ProgressData | null>(null);
  const [message, setMessage] = useState<{ tone: 'ok' | 'bad'; text: string } | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasted, setPasted] = useState('');
  const status = getStorageStatus();
  useDocumentTitle('Settings');

  const doExport = async () => {
    const json = exportJson(d);
    const name = `servolab-progress-${dayKey()}.json`;
    try {
      const file = new File([json], name, { type: 'application/json' });
      const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
      const isTouch = matchMedia('(pointer: coarse)').matches;
      if (isTouch && nav.canShare?.({ files: [file] }) && navigator.share) {
        await navigator.share({ files: [file], title: 'Servolab progress backup' });
        setMessage({ tone: 'ok', text: 'Backup shared. Choose “Save to Files” to keep it safe.' });
        return;
      }
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
    }
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    setMessage({ tone: 'ok', text: `Downloaded ${name}.` });
  };

  const copyBackup = async () => {
    try {
      await navigator.clipboard.writeText(exportJson(d));
      setMessage({ tone: 'ok', text: 'Backup copied to the clipboard. Paste it into Notes or Files to keep it.' });
    } catch {
      setMessage({ tone: 'bad', text: 'Copy failed. Use Export Progress instead.' });
    }
  };

  const readImport = (text: string) => {
    try {
      setPending(importJson(text));
      setMessage(null);
    } catch (e) {
      setMessage({ tone: 'bad', text: (e as Error).message || 'That file could not be read.' });
    }
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return setMessage({ tone: 'bad', text: 'That file is too large to be a Servolab backup.' });
    readImport(await f.text());
    if (fileRef.current) fileRef.current.value = '';
  };

  const confirmImport = () => {
    if (!pending) return;
    replaceAll(pending);
    setPending(null);
    setPasteOpen(false);
    setMessage({ tone: 'ok', text: 'Progress restored from backup.' });
  };

  const doReset = async () => {
    await clearProgress();
    replaceAll(createInitialProgress());
    setResetOpen(false);
    setMessage({ tone: 'ok', text: 'Progress reset. A fresh profile was created.' });
  };

  const set = <K extends keyof SettingsT>(k: K, v: SettingsT[K]) => update({ [k]: v } as Partial<SettingsT>);

  return (
    <div className="min-h-[100dvh] pb-safe">
      <SubHeader title="Settings" onBack={() => navigate('/profile')} />
      <main className="mx-auto max-w-2xl px-4 pb-12 pt-2">
        {message && (
          <p role="status" className={`mt-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${message.tone === 'ok' ? 'bg-ok-soft text-ok' : 'bg-bad-soft text-bad'}`}>{message.text}</p>
        )}

        <SectionTitle>Learning</SectionTitle>
        <Card className="p-4">
          <p className="font-semibold">Daily XP goal</p>
          <p className="text-sm text-ink-2">How much XP you aim to earn each day.</p>
          <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Daily goal">
            {[10, 20, 30, 50, 80, 120].map((g) => (
              <button key={g} role="radio" aria-checked={d.settings.dailyGoal === g} onClick={() => set('dailyGoal', g)} className={`press min-h-[52px] rounded-xl border-2 font-mono font-bold ${d.settings.dailyGoal === g ? 'border-ink bg-brand text-[#1C1F22] shadow-[0_3px_0_rgb(var(--ink))]' : 'border-line bg-panel'}`}>
                {g}
                <span className="block text-[10px] font-semibold opacity-70">{g <= 10 ? 'casual' : g <= 30 ? 'regular' : g <= 50 ? 'serious' : 'intense'}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 border-t border-line pt-3">
            <Toggle label="Show hints in lessons" checked={d.settings.showHints} onChange={(v) => set('showHints', v)} />
          </div>
        </Card>

        <SectionTitle>Appearance & accessibility</SectionTitle>
        <Card className="space-y-4 p-4">
          <Choice label="Theme" value={d.settings.theme} onChange={(v) => set('theme', v)} options={[['system', 'Auto'], ['light', 'Light'], ['dark', 'Dark']]} />
          <Choice label="Motion" value={d.settings.motion} onChange={(v) => set('motion', v)} options={[['system', 'Auto'], ['reduced', 'Reduced'], ['full', 'Full']]} />
          <Toggle label="High contrast" description="Stronger text and borders." checked={d.settings.highContrast} onChange={(v) => set('highContrast', v)} />
          <Toggle label="Vibration feedback" description="Where your device supports it." checked={d.settings.haptics} onChange={(v) => set('haptics', v)} />
        </Card>

        <SectionTitle>Backup & restore</SectionTitle>
        <Card className="p-4">
          <p className="text-sm leading-relaxed text-ink-2">Your progress is stored only on this device. Export a backup now and then — especially before clearing Safari data or switching phones.</p>
          <div className="mt-3 grid gap-2">
            <Button block onClick={doExport} icon={<Download size={18} />}>Export Progress</Button>
            <Button block variant="secondary" onClick={() => fileRef.current?.click()} icon={<Upload size={18} />}>Import Progress</Button>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="ghost" onClick={copyBackup} icon={<Copy size={16} />}>Copy backup</Button>
              <Button size="sm" variant="ghost" onClick={() => setPasteOpen(true)} icon={<Upload size={16} />}>Paste backup</Button>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="application/json,.json,text/plain" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} aria-label="Choose a backup file" />
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-sunken px-3 py-2.5 text-sm">
            <HardDrive size={18} className="mt-0.5 shrink-0" />
            <span>
              Storage: {status.indexedDB ? 'IndexedDB ✓' : 'IndexedDB unavailable'} · {status.localStorage ? 'local backup copy ✓' : 'no local copy'}
              {status.persisted === true && ' · protected from cleanup ✓'}
              {!status.indexedDB && !status.localStorage && <strong className="block text-bad">Saving is unavailable in this browser mode — export a backup before closing.</strong>}
            </span>
          </div>
        </Card>

        <SectionTitle>Danger zone</SectionTitle>
        <Card className="p-4">
          <Button variant="danger" block onClick={() => setResetOpen(true)} icon={<Trash2 size={18} />}>Reset all progress</Button>
          <p className="mt-2 text-sm text-ink-3">Deletes XP, streaks, lessons and achievements on this device.</p>
        </Card>

        <SectionTitle>About</SectionTitle>
        <Card className="p-4 text-sm leading-relaxed text-ink-2">
          <p><strong className="text-ink">Servolab</strong> · version 1.0 · schema v1</p>
          <p>{totalLessonCount} lessons · {totalQuestionCount} questions · {projects.length} projects · works offline.</p>
          <p className="mt-2">To install on iPhone: open this site in Safari, tap Share, then “Add to Home Screen”.</p>
        </Card>
      </main>

      <ConfirmSheet
        open={!!pending}
        title="Replace current progress?"
        message={
          pending && (
            <span className="block space-y-2">
              <span className="block">The backup contains <strong className="text-ink">{pending.xp.toLocaleString()} XP</strong>, <strong className="text-ink">{Object.keys(pending.lessons).length} lessons</strong> and a best streak of <strong className="text-ink">{pending.streak.longest} days</strong>.</span>
              <span className="block">Your current progress ({d.xp.toLocaleString()} XP, {Object.keys(d.lessons).length} lessons) will be overwritten. Consider exporting it first.</span>
            </span>
          )
        }
        confirmLabel="Restore backup"
        danger
        onConfirm={confirmImport}
        onCancel={() => setPending(null)}
      />
      <ConfirmSheet
        open={resetOpen}
        title="Reset all progress?"
        message="This permanently deletes everything on this device and cannot be undone. Export a backup first if you might want it back."
        confirmLabel="Reset everything"
        danger
        onConfirm={doReset}
        onCancel={() => setResetOpen(false)}
      />
      <Sheet open={pasteOpen} onClose={() => setPasteOpen(false)} title="Paste a backup">
        <label htmlFor="paste" className="text-sm text-ink-2">Paste the backup text you copied earlier.</label>
        <textarea id="paste" value={pasted} onChange={(e) => setPasted(e.target.value)} rows={7} className="mt-2 w-full rounded-xl border-2 border-ink bg-paper p-3 font-mono text-xs outline-none focus:border-blue" />
        <Button className="mt-3" block disabled={!pasted.trim()} onClick={() => readImport(pasted)}>Check backup</Button>
      </Sheet>
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="press flex min-h-[48px] w-full items-center justify-between gap-3 text-left">
      <span>
        <span className="block font-semibold">{label}</span>
        {description && <span className="block text-sm text-ink-2">{description}</span>}
      </span>
      <span className={`relative h-8 w-14 shrink-0 rounded-lg border-2 border-ink transition-colors ${checked ? 'bg-ok' : 'bg-sunken'}`}>
        <span className={`absolute top-0.5 h-6 w-6 rounded-md border-2 border-ink bg-panel transition-all ${checked ? 'left-[26px]' : 'left-0.5'}`} />
        <span className="sr-only">{checked ? 'On' : 'Off'}</span>
      </span>
    </button>
  );
}

function Choice<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div>
      <p className="mb-2 font-semibold">{label}</p>
      <div role="radiogroup" aria-label={label} className="grid grid-cols-3 gap-1 rounded-xl bg-sunken p-1">
        {options.map(([v, l]) => (
          <button key={v} role="radio" aria-checked={value === v} onClick={() => onChange(v)} className={`press min-h-[44px] rounded-lg text-sm font-bold ${value === v ? 'border-2 border-ink bg-panel' : 'text-ink-3'}`}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}
