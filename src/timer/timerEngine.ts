import type { TimerMode } from "../types/schema";
import type { TimerState } from "./timerTypes";
import { getState, setState } from "../store/appStore";
import { incrementTodayCompleted } from "../stats/todayStats";
import { playCompleteSound } from "../sound/playSound";

type TimerListener = (state: TimerState) => void;

export function modeDurationMs(mode: TimerMode): number {
  const { settings } = getState();
  const minutes =
    mode === "work"
      ? settings.workMinutes
      : mode === "shortBreak"
        ? settings.shortBreakMinutes
        : settings.longBreakMinutes;
  return minutes * 60 * 1000;
}

let timer: TimerState = {
  mode: "work",
  status: "idle",
  remainingMs: modeDurationMs("work"),
  endTime: null,
  completedCycles: 0,
};

const listeners = new Set<TimerListener>();
let intervalId: number | undefined;

function notify(): void {
  for (const listener of listeners) listener(timer);
}

export function subscribeTimer(listener: TimerListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTimerState(): TimerState {
  return timer;
}

// endTime基準で残り時間を再計算する。setIntervalの間引き(タブ非アクティブ時など)による誤差を毎tick補正する
function tick(): void {
  if (timer.status !== "running" || timer.endTime === null) return;
  const remaining = timer.endTime - Date.now();
  if (remaining <= 0) {
    handleCompletion();
  } else {
    timer = { ...timer, remainingMs: remaining };
    notify();
  }
}

function startInterval(): void {
  if (intervalId !== undefined) return;
  intervalId = window.setInterval(tick, 250);
}

function stopInterval(): void {
  if (intervalId === undefined) return;
  window.clearInterval(intervalId);
  intervalId = undefined;
}

export function start(): void {
  if (timer.status === "running") return;
  timer = { ...timer, status: "running", endTime: Date.now() + timer.remainingMs };
  startInterval();
  notify();
}

export function pause(): void {
  if (timer.status !== "running" || timer.endTime === null) return;
  const remaining = Math.max(0, timer.endTime - Date.now());
  timer = { ...timer, status: "paused", remainingMs: remaining, endTime: null };
  stopInterval();
  notify();
}

export function reset(): void {
  stopInterval();
  timer = { ...timer, status: "idle", remainingMs: modeDurationMs(timer.mode), endTime: null };
  notify();
}

// 現在のモードの完了処理(タスク加算等)を行わずに次のモードへ進める
export function skip(): void {
  stopInterval();
  advanceMode();
}

// 設定画面で時間設定が変更された際、idle状態なら残り時間を最新の設定値に合わせ直す
export function syncDurationWithSettings(): void {
  if (timer.status !== "idle") return;
  timer = { ...timer, remainingMs: modeDurationMs(timer.mode) };
  notify();
}

function handleCompletion(): void {
  stopInterval();
  playCompleteSound();

  if (timer.mode === "work") {
    const { selectedTaskId, tasks, todayStats } = getState();
    const updatedTasks = selectedTaskId
      ? tasks.map((t) => (t.id === selectedTaskId ? { ...t, completedPomodoros: t.completedPomodoros + 1 } : t))
      : tasks;
    setState({ tasks: updatedTasks, todayStats: incrementTodayCompleted(todayStats) });
  }

  advanceMode();
}

function advanceMode(): void {
  const { settings } = getState();

  let nextMode: TimerMode;
  let nextCycles = timer.completedCycles;

  if (timer.mode === "work") {
    nextCycles = timer.completedCycles + 1;
    nextMode = nextCycles >= settings.cyclesBeforeLongBreak ? "longBreak" : "shortBreak";
  } else {
    nextMode = "work";
    if (timer.mode === "longBreak") nextCycles = 0;
  }

  timer = {
    mode: nextMode,
    status: "idle",
    remainingMs: modeDurationMs(nextMode),
    endTime: null,
    completedCycles: nextCycles,
  };
  notify();
}
