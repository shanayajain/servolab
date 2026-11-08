import { useEffect, useState } from 'react';
import { useData } from '../store/useProgress';

/** True if the user prefers reduced motion (system setting or the in-app override). */
export function useReducedMotion(): boolean {
  const setting = useData((d) => d.settings.motion);
  const [system, setSystem] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    if (typeof matchMedia === 'undefined') return;
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setSystem(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return setting === 'reduced' || (setting === 'system' && system);
}
