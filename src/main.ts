import "./styles.css";
import { el } from "./ui/components";
import { getState, subscribe } from "./store/appStore";
import { subscribeTimer, getTimerState } from "./timer/timerEngine";
import { createTimerView } from "./ui/renderTimer";
import { createTaskListView } from "./ui/renderTaskList";
import { createSettingsView } from "./ui/renderSettings";
import { createStatsView } from "./ui/renderStats";

const app = document.querySelector<HTMLDivElement>("#app")!;

const page = el("div", {
  className: "mx-auto flex max-w-3xl flex-col gap-12 px-6 py-16 sm:py-20",
});

const header = el("div", { className: "flex flex-col items-center gap-3 text-center" });
const kicker = el("p", {
  className: "text-[11px] font-semibold uppercase tracking-[0.35em] text-stone-400 dark:text-stone-500",
  text: "Focus · Pomodoro",
});
const title = el("h1", {
  className: "text-3xl font-bold tracking-tight text-stone-800 dark:text-stone-100 sm:text-4xl",
  text: "ポモドーロ・タスクタイマー",
});
const rule = el("div", { className: "h-px w-12 bg-stone-300 dark:bg-stone-700" });
header.append(kicker, title, rule);

const timerSection = el("section");
const statsSection = el("section");
const bottomGrid = el("div", {
  className:
    "grid gap-10 border-t border-stone-200 pt-10 dark:border-stone-800 sm:grid-cols-2 sm:gap-12 sm:divide-x sm:divide-stone-200 sm:dark:divide-stone-800",
});
const taskSection = el("section", { className: "sm:pr-8" });
const settingsSection = el("section", { className: "sm:pl-8" });

bottomGrid.append(taskSection, settingsSection);
page.append(header, timerSection, statsSection, bottomGrid);
app.append(page);

const updateTimerView = createTimerView(timerSection);
const updateTaskListView = createTaskListView(taskSection);
const updateSettingsView = createSettingsView(settingsSection);
const updateStatsView = createStatsView(statsSection);

subscribeTimer(updateTimerView);
subscribe((state) => {
  updateTaskListView(state);
  updateSettingsView(state);
  updateStatsView(state);
});

// 初回描画
updateTimerView(getTimerState());
updateTaskListView(getState());
updateSettingsView(getState());
updateStatsView(getState());
