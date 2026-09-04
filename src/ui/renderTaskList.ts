import { el, clearChildren } from "./components";
import type { AppState, Task } from "../types/schema";
import { addTask, deleteTask, selectTask } from "../tasks/taskActions";

function buildTaskRow(task: Task, isSelected: boolean): HTMLElement {
  const row = el("li", {
    className: `flex items-center justify-between gap-3 rounded-xl border p-3 transition ${
      isSelected
        ? "border-rose-400 bg-rose-50 dark:border-rose-500 dark:bg-rose-950/40"
        : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
    }`,
  });

  const info = el("button", {
    className: "flex flex-1 flex-col items-start text-left",
  });
  info.append(
    el("span", { className: "font-medium", text: task.name }),
    el("span", {
      className: "text-sm text-slate-500 dark:text-slate-400",
      text: `${task.completedPomodoros} / ${task.estimatedPomodoros} 完了`,
    }),
  );
  info.addEventListener("click", () => selectTask(isSelected ? null : task.id));

  const deleteButton = el("button", {
    className: "shrink-0 rounded-full px-3 py-1 text-sm text-slate-400 transition hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-700",
    text: "削除",
  });
  deleteButton.addEventListener("click", () => deleteTask(task.id));

  row.append(info, deleteButton);
  return row;
}

export function createTaskListView(container: HTMLElement): (state: AppState) => void {
  const wrapper = el("div", { className: "flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-800" });

  const heading = el("h2", { className: "text-lg font-semibold", text: "タスク" });

  const nameInput = el("input", {
    className: "flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900",
    attrs: { type: "text", placeholder: "タスク名", maxlength: "50" },
  });
  const estimateInput = el("input", {
    className: "w-20 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900",
    attrs: { type: "number", min: "1", max: "20", value: "1" },
  });
  const addButton = el("button", {
    className: "rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200",
    text: "追加",
  });
  const errorText = el("p", { className: "min-h-[1.25rem] text-sm text-red-500" });

  const form = el("div", { className: "flex flex-wrap gap-2" });
  form.append(nameInput, estimateInput, addButton);

  const list = el("ul", { className: "flex flex-col gap-2" });

  wrapper.append(heading, form, errorText, list);
  container.append(wrapper);

  const submit = () => {
    const result = addTask({
      name: nameInput.value,
      estimatedPomodoros: Number(estimateInput.value),
    });
    if (result.success) {
      nameInput.value = "";
      estimateInput.value = "1";
      errorText.textContent = "";
    } else {
      errorText.textContent = result.errors[0];
    }
  };

  addButton.addEventListener("click", submit);
  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submit();
  });

  return (state: AppState) => {
    clearChildren(list);
    if (state.tasks.length === 0) {
      list.append(el("li", { className: "text-sm text-slate-400", text: "タスクがまだありません" }));
      return;
    }
    for (const task of state.tasks) {
      list.append(buildTaskRow(task, task.id === state.selectedTaskId));
    }
  };
}
