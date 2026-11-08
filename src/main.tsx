import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/600.css';
import '@fontsource/jetbrains-mono/700.css';
import './styles/index.css';
import App from './App';
import { loadProgress, saveProgress, saveProgressSync } from './lib/persistence';
import { useProgress } from './store/useProgress';
import { registerServiceWorker } from './lib/pwa';

/**
 * Boot sequence:
 *  1. Load saved progress (IndexedDB → localStorage → backup). Never starts from defaults if data exists.
 *  2. Hydrate the Zustand store.
 *  3. Only THEN start auto-saving, so default state can never overwrite real progress.
 *  4. Render.
 */
async function boot() {
  const root = createRoot(document.getElementById('root')!);
  let result;
  try {
    result = await loadProgress();
  } catch (e) {
    console.error('Failed to load progress', e);
    const { createInitialProgress } = await import('./store/logic');
    result = { data: createInitialProgress(), isNew: true, recovered: true, source: 'new' as const, status: { indexedDB: false, localStorage: false, persisted: null } };
  }
  useProgress.getState().hydrate(result.data, {
    isNew: result.isNew,
    recovered: result.recovered && !result.isNew,
    source: result.source,
    storageOk: result.status.indexedDB || result.status.localStorage
  });

  // First save immediately for a brand-new profile so it exists on disk.
  if (result.isNew) void saveProgress(useProgress.getState().data);

  // Auto-save on every change (debounced), plus a synchronous flush when the app is hidden/closed.
  let timer: ReturnType<typeof setTimeout> | null = null;
  useProgress.subscribe((state, prev) => {
    if (state.data === prev.data || !state.hydrated) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      void saveProgress(useProgress.getState().data);
    }, 250);
  });
  const flush = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    saveProgressSync(useProgress.getState().data);
  };
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && flush());
  window.addEventListener('pagehide', flush);

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  registerServiceWorker();
}

void boot();
