import type { ProgressData } from '../../lib/types';
import { allLessons, lessonsForTrack, lessonsForUnit } from '../../data/curriculum';

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string; // key into the badge icon map
  tier: 1 | 2 | 3;
  progress: (d: ProgressData) => { current: number; target: number };
}

const done = (d: ProgressData, ids: string[]): number => ids.filter((id) => !!d.lessons[id]).length;
const SENSOR_LESSONS = ['elec-sensors', 'robo-sensors', 'robo-ultrasonic', 'robo-ir-sensors', 'robo-light-sensors', 'robo-accelerometers', 'robo-gyroscopes', 'robo-imus', 'emb-sensors', 'robo-encoders'];
const ids = (list: { id: string }[]) => list.map((l) => l.id);

export const achievements: AchievementDef[] = [
  { id: 'power-on', title: 'Power On', description: 'Complete your first lesson.', icon: 'power', tier: 1, progress: (d) => ({ current: Object.keys(d.lessons).length, target: 1 }) },
  { id: 'first-circuit', title: 'First Circuit', description: 'Solve your first circuit lab challenge.', icon: 'circuit', tier: 1, progress: (d) => ({ current: Object.keys(d.circuits).length, target: 1 }) },
  { id: 'steady-current', title: 'Steady Current', description: 'Reach a 3-day streak.', icon: 'flame', tier: 1, progress: (d) => ({ current: d.streak.longest, target: 3 }) },
  { id: 'daily-driver', title: 'Daily Driver', description: 'Finish a daily challenge.', icon: 'calendar', tier: 1, progress: (d) => ({ current: Object.keys(d.dailyChallenges).length, target: 1 }) },
  { id: 'lab-tinkerer', title: 'Lab Tinkerer', description: 'Explore 5 different simulations.', icon: 'flask', tier: 1, progress: (d) => ({ current: Object.keys(d.simsOpened).length, target: 5 }) },
  { id: 'workbench-ready', title: 'Workbench Ready', description: 'Complete your first project.', icon: 'wrench', tier: 1, progress: (d) => ({ current: Object.values(d.projects).filter((p) => p.completedAt).length, target: 1 }) },
  { id: 'sensor-explorer', title: 'Sensor Explorer', description: 'Complete 4 sensor lessons.', icon: 'radar', tier: 2, progress: (d) => ({ current: done(d, SENSOR_LESSONS), target: 4 }) },
  { id: 'motor-master', title: 'Motor Master', description: 'Complete every lesson in the Motion unit.', icon: 'cog', tier: 2, progress: (d) => ({ current: done(d, ids(lessonsForUnit('robo-u2'))), target: lessonsForUnit('robo-u2').length }) },
  { id: 'control-systems', title: 'Control Systems', description: 'Complete the Control unit, including PID.', icon: 'gauge', tier: 2, progress: (d) => ({ current: done(d, ids(lessonsForUnit('robo-u5'))), target: lessonsForUnit('robo-u5').length }) },
  { id: 'embedded-builder', title: 'Embedded Builder', description: 'Complete 8 embedded systems lessons.', icon: 'cpu', tier: 2, progress: (d) => ({ current: done(d, ids(lessonsForTrack('embedded'))), target: 8 }) },
  { id: 'logic-designer', title: 'Logic Designer', description: 'Complete the Logic unit.', icon: 'binary', tier: 2, progress: (d) => ({ current: done(d, ids(lessonsForUnit('arch-u2'))), target: lessonsForUnit('arch-u2').length }) },
  { id: 'board-maker', title: 'Board Maker', description: 'Complete 6 PCB design lessons.', icon: 'board', tier: 2, progress: (d) => ({ current: done(d, ids(lessonsForTrack('pcb'))), target: 6 }) },
  { id: 'code-runner', title: 'Code Runner', description: 'Complete 5 programming lessons.', icon: 'code', tier: 1, progress: (d) => ({ current: done(d, ids(lessonsForTrack('programming'))), target: 5 }) },
  { id: 'robotics-apprentice', title: 'Robotics Apprentice', description: 'Complete 10 robotics lessons.', icon: 'bot', tier: 2, progress: (d) => ({ current: done(d, ids(lessonsForTrack('robotics'))), target: 10 }) },
  { id: 'sharpshooter', title: 'Sharpshooter', description: 'Finish 5 lessons with a perfect score.', icon: 'target', tier: 2, progress: (d) => ({ current: d.stats.perfectLessons, target: 5 }) },
  { id: 'calibrated', title: 'Calibrated', description: 'Complete 10 practice sessions.', icon: 'refresh', tier: 2, progress: (d) => ({ current: d.practiceHistory.length, target: 10 }) },
  { id: 'full-week', title: 'Full Week', description: 'Reach a 7-day streak.', icon: 'flame', tier: 2, progress: (d) => ({ current: d.streak.longest, target: 7 }) },
  { id: 'charged-up', title: 'Charged Up', description: 'Earn 500 XP.', icon: 'bolt', tier: 1, progress: (d) => ({ current: d.xp, target: 500 }) },
  { id: 'full-stack', title: 'Full Stack', description: 'Complete a lesson in all six tracks.', icon: 'layers', tier: 2, progress: (d) => ({ current: new Set(allLessons.filter((l) => d.lessons[l.id]).map((l) => l.track)).size, target: 6 }) },
  { id: 'mastery', title: 'Mastery', description: 'Master 10 concepts through review.', icon: 'medal', tier: 3, progress: (d) => ({ current: Object.values(d.concepts).filter((c) => c.state === 'MASTERED').length, target: 10 }) },
  { id: 'prolific-maker', title: 'Prolific Maker', description: 'Complete 5 projects.', icon: 'wrench', tier: 3, progress: (d) => ({ current: Object.values(d.projects).filter((p) => p.completedAt).length, target: 5 }) },
  { id: 'high-voltage', title: 'High Voltage', description: 'Earn 2,500 XP.', icon: 'bolt', tier: 3, progress: (d) => ({ current: d.xp, target: 2500 }) },
  { id: 'uptime-30', title: 'Thirty-Day Uptime', description: 'Reach a 30-day streak.', icon: 'flame', tier: 3, progress: (d) => ({ current: d.streak.longest, target: 30 }) },
  { id: 'robot-engineer', title: 'Robot Engineer', description: 'Complete every lesson in the Robotics track.', icon: 'trophy', tier: 3, progress: (d) => ({ current: done(d, ids(lessonsForTrack('robotics'))), target: lessonsForTrack('robotics').length }) }
];

export function getAchievement(id: string): AchievementDef | undefined {
  return achievements.find((a) => a.id === id);
}

export function isUnlocked(def: AchievementDef, d: ProgressData): boolean {
  const p = def.progress(d);
  return p.current >= p.target;
}
