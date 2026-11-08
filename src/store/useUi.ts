import { create } from 'zustand';
import type { GameEvent } from './logic';

export interface Toast {
  id: number;
  event: GameEvent;
}

interface UiStore {
  toasts: Toast[];
  push: (events: GameEvent[]) => void;
  dismiss: (id: number) => void;
}

let seq = 1;

/** Transient UI state (not persisted): celebration toasts for levels, achievements, goals. */
export const useUi = create<UiStore>()((set) => ({
  toasts: [],
  push: (events) => {
    // Streak "touch" events are shown on the lesson-complete screen instead of as toasts.
    const shown = events.filter((e) => e.kind !== 'streak');
    if (!shown.length) return;
    set((s) => ({ toasts: [...s.toasts, ...shown.map((event) => ({ id: seq++, event }))].slice(-4) }));
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
}));
