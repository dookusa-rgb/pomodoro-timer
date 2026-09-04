import { el, svgEl } from "./components";
import type { TimerMode } from "../types/schema";
import type { TimerState } from "../timer/timerTypes";
import { start, pause, reset, skip, modeDurationMs } from "../timer/timerEngine";

const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const MODE_LABEL: Record<TimerMode, string> = {
  work: "作業中",
  shortBreak: "小休憩",
  longBreak: "長休憩",
};

// 残り時間の割合に応じてリング色を3段階に変化させる（余裕→通常→残りわずか）
const MODE_RING_CALM_CLASS: Record<TimerMode, string> = {
  work: "stroke-rose-300",
  shortBreak: "stroke-emerald-300",
  longBreak: "stroke-teal-300",
};
const MODE_RING_CLASS: Record<TimerMode, string> = {
  work: "stroke-rose-400",
  shortBreak: "stroke-emerald-500",
  longBreak: "stroke-teal-600",
};
const MODE_RING_URGENT_CLASS: Record<TimerMode, string> = {
  work: "stroke-rose-600",
  shortBreak: "stroke-emerald-700",
  longBreak: "stroke-teal-800",
};

function ringClassForRatio(mode: TimerMode, ratio: number): string {
  if (ratio > 0.5) return MODE_RING_CALM_CLASS[mode];
  if (ratio > 0.15) return MODE_RING_CLASS[mode];
  return MODE_RING_URGENT_CLASS[mode];
}

// 白地に淡いラジアルグラデーションを重ね、単色塗りより奥行きのある質感にする
const MODE_PANEL_CLASS: Record<TimerMode, string> = {
  work: "bg-white bg-[radial-gradient(circle_at_50%_32%,var(--tw-gradient-stops))] from-rose-100 to-white dark:bg-stone-900 dark:from-rose-950/30 dark:to-stone-900",
  shortBreak:
    "bg-white bg-[radial-gradient(circle_at_50%_32%,var(--tw-gradient-stops))] from-emerald-100 to-white dark:bg-stone-900 dark:from-emerald-950/30 dark:to-stone-900",
  longBreak:
    "bg-white bg-[radial-gradient(circle_at_50%_32%,var(--tw-gradient-stops))] from-teal-100 to-white dark:bg-stone-900 dark:from-teal-950/30 dark:to-stone-900",
};

const MODE_ACCENT_CLASS: Record<TimerMode, string> = {
  work: "text-rose-500",
  shortBreak: "text-emerald-600",
  longBreak: "text-teal-700",
};

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const BASE_PANEL_CLASS =
  "flex flex-col items-center gap-10 rounded-[2rem] border border-stone-200/70 px-8 py-14 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] transition-colors duration-500 sm:py-16 dark:border-stone-800";

const BASE_LABEL_CLASS = "text-xs font-semibold uppercase tracking-[0.3em] transition-colors duration-500";
const TIME_CLASS = "text-6xl font-bold tracking-tight tabular-nums text-stone-800 dark:text-stone-100";

export function createTimerView(container: HTMLElement): (state: TimerState) => void {
  const panel = el("div", { className: BASE_PANEL_CLASS });

  const modeLabel = el("p", { className: BASE_LABEL_CLASS });

  const svg = svgEl("svg", { viewBox: "0 0 200 200", class: "h-72 w-72 -rotate-90" });
  const trackCircle = svgEl("circle", {
    cx: "100",
    cy: "100",
    r: String(RADIUS),
    fill: "none",
    "stroke-width": "12",
    class: "stroke-stone-200 dark:stroke-stone-700",
  });
  const progressCircle = svgEl("circle", {
    cx: "100",
    cy: "100",
    r: String(RADIUS),
    fill: "none",
    "stroke-width": "12",
    "stroke-linecap": "round",
    "stroke-dasharray": String(CIRCUMFERENCE),
  });
  svg.append(trackCircle, progressCircle);

  const timeText = el("span", { className: TIME_CLASS });
  const timeTextWrapper = el("div", { className: "absolute" });
  timeTextWrapper.append(timeText);
  const timerFace = el("div", { className: "relative flex h-72 w-72 items-center justify-center" });
  timerFace.append(svg, timeTextWrapper);

  const startPauseButton = el("button", {
    className: "rounded-md bg-stone-800 px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone-50 transition hover:bg-stone-700 active:scale-95 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300",
  });
  const resetButton = el("button", {
    text: "リセット",
    className: "text-xs font-semibold uppercase tracking-[0.2em] text-stone-400 underline-offset-4 transition hover:text-stone-700 hover:underline dark:text-stone-500 dark:hover:text-stone-200",
  });
  const skipButton = el("button", {
    text: "スキップ",
    className: "text-xs font-semibold uppercase tracking-[0.2em] text-stone-400 underline-offset-4 transition hover:text-stone-700 hover:underline dark:text-stone-500 dark:hover:text-stone-200",
  });

  const buttonRow = el("div", { className: "flex items-center gap-6" });
  buttonRow.append(startPauseButton, resetButton, skipButton);

  panel.append(modeLabel, timerFace, buttonRow);
  container.append(panel);

  let currentMode: TimerMode | null = null;

  startPauseButton.addEventListener("click", () => {
    const isRunning = startPauseButton.dataset.status === "running";
    if (isRunning) pause();
    else start();
  });
  resetButton.addEventListener("click", () => reset());
  skipButton.addEventListener("click", () => skip());

  return (state: TimerState) => {
    if (state.mode !== currentMode) {
      currentMode = state.mode;
      panel.className = `${BASE_PANEL_CLASS} ${MODE_PANEL_CLASS[state.mode]}`;
      modeLabel.className = `${BASE_LABEL_CLASS} ${MODE_ACCENT_CLASS[state.mode]}`;
    }

    modeLabel.textContent = MODE_LABEL[state.mode];
    timeText.textContent = formatTime(state.remainingMs);

    const total = modeDurationMs(state.mode);
    const ratio = total > 0 ? state.remainingMs / total : 0;
    progressCircle.setAttribute("class", `${ringClassForRatio(state.mode, ratio)} transition-colors duration-500`);
    progressCircle.setAttribute("stroke-dashoffset", String(CIRCUMFERENCE * (1 - ratio)));

    startPauseButton.dataset.status = state.status;
    startPauseButton.textContent = state.status === "running" ? "一時停止" : "開始";
  };
}
