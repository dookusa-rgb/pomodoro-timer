import { el, svgEl, clearChildren } from "./components";
import type { AppState, Task } from "../types/schema";
import { addTask, deleteTask, selectTask } from "../tasks/taskActions";

function buildTaskRow(task: Task, isSelected: boolean): HTMLElement {
  const row = el("li", {
    className: `flex items-center justify-between gap-3 border-l-2 py-4 pl-4 -ml-4 transition ${
      isSelected ? "border-rose-400" : "border-transparent"
    }`,
  });

  const info = el("button", {
    className: "flex flex-1 flex-col items-start gap-0.5 text-left",
  });
  info.append(
    el("span", {
      className: `font-medium transition ${
        isSelected ? "text-rose-600 dark:text-rose-400" : "text-stone-800 dark:text-stone-100"
      }`,
      text: task.name,
    }),
    el("span", {
      className: "text-sm text-stone-400 dark:text-stone-500",
      text: `${task.completedPomodoros} / ${task.estimatedPomodoros} 完了`,
    }),
  );
  info.addEventListener("click", () => selectTask(isSelected ? null : task.id));

  const deleteButton = el("button", {
    className: "flex shrink-0 items-center gap-1 text-xs text-stone-300 transition hover:text-rose-500 dark:text-stone-600 dark:hover:text-rose-400",
  });
  const trashIcon = svgEl("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "1.5",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    class: "h-3.5 w-3.5",
  });
  trashIcon.append(
    svgEl("path", { d: "M4 7h16" }),
    svgEl("path", { d: "M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" }),
    svgEl("path", { d: "M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" }),
  );
  deleteButton.append(trashIcon, el("span", { text: "削除" }));
  deleteButton.addEventListener("click", () => deleteTask(task.id));

  row.append(info, deleteButton);
  return row;
}

export function createTaskListView(container: HTMLElement): (state: AppState) => void {
  const wrapper = el("div", { className: "flex flex-col gap-6" });

  const headingGroup = el("div", { className: "flex flex-col gap-1" });
  headingGroup.append(
    el("p", { className: "text-[11px] font-semibold uppercase tracking-[0.3em] text-stone-400 dark:text-stone-500", text: "Tasks" }),
    el("h2", { className: "text-xl font-bold text-stone-800 dark:text-stone-100", text: "タスク" }),
  );

  const nameInput = el("input", {
    className: "min-w-0 flex-1 border-b border-stone-300 bg-transparent px-1 py-2 text-sm text-stone-700 placeholder:text-stone-400 focus:border-stone-800 focus:outline-none dark:border-stone-600 dark:text-stone-100 dark:focus:border-stone-200",
    attrs: { type: "text", placeholder: "タスク名", maxlength: "50" },
  });
  const estimateInput = el("input", {
    className: "w-16 border-b border-stone-300 bg-transparent px-1 py-2 text-sm text-stone-700 focus:border-stone-800 focus:outline-none dark:border-stone-600 dark:text-stone-100 dark:focus:border-stone-200",
    attrs: { type: "number", min: "1", max: "20", value: "1" },
  });
  const addButton = el("button", {
    className: "rounded-md bg-stone-800 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-50 transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300",
    text: "追加",
  });
  const errorText = el("p", { className: "min-h-[1.25rem] text-sm text-rose-500 dark:text-rose-400" });

  const form = el("div", { className: "flex flex-wrap items-end gap-3 sm:flex-nowrap" });
  form.append(nameInput, estimateInput, addButton);

  const list = el("ul", { className: "flex flex-col divide-y divide-stone-200 dark:divide-stone-700" });

  wrapper.append(headingGroup, form, errorText, list);
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
      list.append(el("li", { className: "py-4 text-sm text-stone-400", text: "タスクがまだありません" }));
      return;
    }
    for (const task of state.tasks) {
      list.append(buildTaskRow(task, task.id === state.selectedTaskId));
    }
  };
}
