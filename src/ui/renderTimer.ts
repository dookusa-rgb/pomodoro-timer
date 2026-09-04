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

const MODE_RING_CLASS: Record<TimerMode, string> = {
  work: "stroke-rose-500",
  shortBreak: "stroke-emerald-500",
  longBreak: "stroke-sky-500",
};

const MODE_PANEL_CLASS: Record<TimerMode, string> = {
  work: "from-rose-50 to-orange-50 dark:from-rose-950/40 dark:to-orange-950/40",
  shortBreak: "from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40",
  longBreak: "from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/40",
};

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const BASE_PANEL_CLASS =
  "flex flex-col items-center gap-6 rounded-3xl bg-gradient-to-br p-8 shadow-sm transition-colors duration-500";

export function createTimerView(container: HTMLElement): (state: TimerState) => void {
  const panel = el("div", { className: BASE_PANEL_CLASS });

  const modeLabel = el("p", { className: "text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400" });

  const svg = svgEl("svg", { viewBox: "0 0 200 200", class: "h-64 w-64 -rotate-90" });
  const trackCircle = svgEl("circle", {
    cx: "100",
    cy: "100",
    r: String(RADIUS),
    fill: "none",
    "stroke-width": "12",
    class: "stroke-slate-200 dark:stroke-slate-700",
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

  const timeText = el("span", { className: "text-5xl font-bold tabular-nums" });
  const timeTextWrapper = el("div", { className: "absolute" });
  timeTextWrapper.append(timeText);
  const timerFace = el("div", { className: "relative flex h-64 w-64 items-center justify-center" });
  timerFace.append(svg, timeTextWrapper);

  const startPauseButton = el("button", {
    className: "rounded-full bg-slate-900 px-8 py-3 text-white transition hover:bg-slate-700 active:scale-95 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200",
  });
  const resetButton = el("button", {
    text: "リセット",
    className: "rounded-full bg-slate-200 px-6 py-3 text-slate-700 transition hover:bg-slate-300 active:scale-95 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600",
  });
  const skipButton = el("button", {
    text: "スキップ",
    className: "rounded-full bg-slate-200 px-6 py-3 text-slate-700 transition hover:bg-slate-300 active:scale-95 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600",
  });

  const buttonRow = el("div", { className: "flex gap-3" });
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
      progressCircle.setAttribute("class", MODE_RING_CLASS[state.mode]);
    }

    modeLabel.textContent = MODE_LABEL[state.mode];
    timeText.textContent = formatTime(state.remainingMs);

    const total = modeDurationMs(state.mode);
    const ratio = total > 0 ? state.remainingMs / total : 0;
    progressCircle.setAttribute("stroke-dashoffset", String(CIRCUMFERENCE * (1 - ratio)));

    startPauseButton.dataset.status = state.status;
    startPauseButton.textContent = state.status === "running" ? "一時停止" : "開始";
  };
}
