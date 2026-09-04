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
  className: "mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10",
});

const title = el("h1", { className: "text-center text-2xl font-bold", text: "ポモドーロ・タスクタイマー" });

const timerSection = el("section");
const statsSection = el("section");
const bottomGrid = el("div", { className: "grid gap-6 sm:grid-cols-2" });
const taskSection = el("section");
const settingsSection = el("section");

bottomGrid.append(taskSection, settingsSection);
page.append(title, timerSection, statsSection, bottomGrid);
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
