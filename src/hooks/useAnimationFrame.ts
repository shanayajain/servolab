import { useEffect, useRef } from 'react';

/** Calls `cb(dtSeconds)` every animation frame while `running`. Pauses when the tab is hidden. */
export function useAnimationFrame(cb: (dt: number) => void, running = true): void {
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      if (!document.hidden) ref.current(dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running]);
}
