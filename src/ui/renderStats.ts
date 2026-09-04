import { el } from "./components";
import type { AppState } from "../types/schema";

export function createStatsView(container: HTMLElement): (state: AppState) => void {
  const wrapper = el("div", {
    className: "flex items-center justify-between border-y border-stone-200 py-6 dark:border-stone-800",
  });
  const labelGroup = el("div", { className: "flex flex-col gap-1" });
  labelGroup.append(
    el("p", { className: "text-[11px] font-semibold uppercase tracking-[0.3em] text-stone-400 dark:text-stone-500", text: "Today" }),
    el("span", { className: "text-sm text-stone-500 dark:text-stone-400", text: "今日の完了ポモドーロ数" }),
  );
  wrapper.append(labelGroup);
  const count = el("span", { className: "text-4xl font-bold tabular-nums text-stone-800 dark:text-stone-100" });
  wrapper.append(count);
  container.append(wrapper);

  return (state: AppState) => {
    count.textContent = String(state.todayStats.completedPomodoros);
  };
}
