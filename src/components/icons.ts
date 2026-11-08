import {
  Binary, Bolt, Bot, Calendar, CircuitBoard, Code, Cog, Cpu, Flame, FlaskConical, Gauge, Layers, Medal, Power, Radar, RefreshCw, Target, Trophy, Wrench, Zap
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/** Single icon library (lucide) for consistency. Content refers to icons by key. */
export const ICONS: Record<string, LucideIcon> = {
  zap: Zap,
  bot: Bot,
  cpu: Cpu,
  binary: Binary,
  board: CircuitBoard,
  code: Code,
  power: Power,
  circuit: CircuitBoard,
  flame: Flame,
  calendar: Calendar,
  flask: FlaskConical,
  wrench: Wrench,
  radar: Radar,
  cog: Cog,
  gauge: Gauge,
  target: Target,
  refresh: RefreshCw,
  bolt: Bolt,
  layers: Layers,
  medal: Medal,
  trophy: Trophy
};

export function iconFor(key: string): LucideIcon {
  return ICONS[key] ?? Zap;
}
