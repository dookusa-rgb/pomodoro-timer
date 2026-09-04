import { el } from "./components";
import type { AppState } from "../types/schema";

export function createStatsView(container: HTMLElement): (state: AppState) => void {
  const wrapper = el("div", {
    className: "flex items-center justify-between rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-800",
  });
  wrapper.append(el("span", { className: "text-sm text-slate-500 dark:text-slate-400", text: "今日の完了ポモドーロ数" }));
  const count = el("span", { className: "text-3xl font-bold tabular-nums" });
  wrapper.append(count);
  container.append(wrapper);

  return (state: AppState) => {
    count.textContent = String(state.todayStats.completedPomodoros);
  };
}
