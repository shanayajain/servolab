import { lazy, Suspense, type ComponentType } from 'react';
import type { SimId } from '../../lib/types';
import type { SimProps } from './sims/common';

export interface SimMeta {
  id: SimId;
  title: string;
  blurb: string;
  lessons: string[];
}

export const SIMS: SimMeta[] = [
  { id: 'pwm', title: 'PWM Explorer', blurb: 'Change the duty cycle and watch average voltage, LED brightness and motor speed.', lessons: ['elec-pwm', 'emb-pwm'] },
  { id: 'dc-motor', title: 'DC Motor', blurb: 'Voltage sets speed and direction; load slows it down and raises current.', lessons: ['robo-dc-motors'] },
  { id: 'ultrasonic', title: 'Ultrasonic Ranging', blurb: 'Watch a ping travel to an object and back, and convert echo time to distance.', lessons: ['robo-ultrasonic'] },
  { id: 'encoder', title: 'Wheel Encoder', blurb: 'Count slots passing a sensor and turn ticks into distance.', lessons: ['robo-encoders'] },
  { id: 'pid', title: 'PID Tuner', blurb: 'Tune Kp, Ki and Kd and see the step response, overshoot and steady-state error.', lessons: ['robo-pid'] },
  { id: 'diff-drive', title: 'Differential Drive', blurb: 'Steer a two-wheeled robot through an arena by setting each wheel speed.', lessons: ['robo-navigation'] },
  { id: 'line-follow', title: 'Line Follower', blurb: 'Compare bang-bang and proportional control on a curvy track.', lessons: ['robo-ir-sensors', 'robo-closed-loop'] },
  { id: 'wall-follow', title: 'Wall Follower', blurb: 'Hold a distance from a bumpy wall with a side sensor and P control.', lessons: ['robo-obstacle-avoidance'] },
  { id: 'frames', title: 'Coordinate Frames', blurb: 'Move the robot and a point; see the point in world and robot frames.', lessons: ['robo-frames'] },
  { id: 'odometry', title: 'Odometry Drift', blurb: 'Drive a square and watch encoder-based estimates drift from the truth.', lessons: ['robo-odometry'] }
];

const MotorSims = () => import('./sims/motorSims');
const RobotSims = () => import('./sims/robotSims');

const COMPONENTS: Record<SimId, ComponentType<SimProps>> = {
  pwm: lazy(() => MotorSims().then((m) => ({ default: m.PwmSim }))),
  'dc-motor': lazy(() => MotorSims().then((m) => ({ default: m.DcMotorSim }))),
  encoder: lazy(() => MotorSims().then((m) => ({ default: m.EncoderSim }))),
  pid: lazy(() => MotorSims().then((m) => ({ default: m.PidSim }))),
  ultrasonic: lazy(() => RobotSims().then((m) => ({ default: m.UltrasonicSim }))),
  'diff-drive': lazy(() => RobotSims().then((m) => ({ default: m.DiffDriveSim }))),
  'line-follow': lazy(() => RobotSims().then((m) => ({ default: m.LineFollowSim }))),
  'wall-follow': lazy(() => RobotSims().then((m) => ({ default: m.WallFollowSim }))),
  frames: lazy(() => RobotSims().then((m) => ({ default: m.FramesSim }))),
  odometry: lazy(() => RobotSims().then((m) => ({ default: m.OdometrySim }))),
};

export function getSim(id: string | undefined): SimMeta | undefined {
  return SIMS.find((s) => s.id === id);
}

export function SimView({ id, compact }: { id: SimId; compact?: boolean }) {
  const C = COMPONENTS[id];
  if (!C) return <p className="text-sm text-ink-3">This simulation is not available.</p>;
  return (
    <Suspense fallback={<div className="flex h-48 items-center justify-center rounded-2xl border border-line bg-panel font-mono text-xs text-ink-3">Loading simulation…</div>}>
      <C compact={compact} />
    </Suspense>
  );
}
