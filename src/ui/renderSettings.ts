import { el } from "./components";
import { SettingsSchema, type AppState, type Settings } from "../types/schema";
import { setState } from "../store/appStore";
import { syncDurationWithSettings } from "../timer/timerEngine";

interface FieldConfig {
  key: keyof Settings;
  label: string;
  min: number;
  max: number;
}

const FIELDS: FieldConfig[] = [
  { key: "workMinutes", label: "作業時間（分）", min: 1, max: 120 },
  { key: "shortBreakMinutes", label: "小休憩（分）", min: 1, max: 60 },
  { key: "longBreakMinutes", label: "長休憩（分）", min: 1, max: 60 },
  { key: "cyclesBeforeLongBreak", label: "長休憩までのサイクル数", min: 1, max: 10 },
];

export function createSettingsView(container: HTMLElement): (state: AppState) => void {
  const wrapper = el("div", { className: "flex flex-col gap-6" });
  const headingGroup = el("div", { className: "flex flex-col gap-1" });
  headingGroup.append(
    el("p", { className: "text-[11px] font-semibold uppercase tracking-[0.3em] text-stone-400 dark:text-stone-500", text: "Settings" }),
    el("h2", { className: "text-xl font-bold text-stone-800 dark:text-stone-100", text: "設定" }),
  );
  wrapper.append(headingGroup);

  const inputs = new Map<keyof Settings, HTMLInputElement>();

  for (const field of FIELDS) {
    const row = el("label", {
      className: "flex items-center justify-between gap-3 border-b border-stone-100 py-3 text-sm text-stone-600 dark:border-stone-800 dark:text-stone-300",
    });
    row.append(el("span", { text: field.label }));
    const input = el("input", {
      className: "w-16 border-b border-transparent bg-transparent px-1 py-1 text-right text-stone-800 focus:border-stone-800 focus:outline-none dark:text-stone-100 dark:focus:border-stone-200",
      attrs: { type: "number", min: String(field.min), max: String(field.max) },
    });
    inputs.set(field.key, input);
    row.append(input);
    wrapper.append(row);
  }

  const errorText = el("p", { className: "min-h-[1.25rem] text-sm text-rose-500 dark:text-rose-400" });
  const saveButton = el("button", {
    className: "self-start rounded-md bg-stone-800 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-50 transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300",
    text: "保存",
  });
  wrapper.append(errorText, saveButton);
  container.append(wrapper);

  saveButton.addEventListener("click", () => {
    const candidate = Object.fromEntries(
      FIELDS.map((field) => [field.key, Number(inputs.get(field.key)!.value)]),
    );
    const parsed = SettingsSchema.safeParse(candidate);
    if (!parsed.success) {
      errorText.textContent = parsed.error.issues[0]?.message ?? "入力内容を確認してください";
      return;
    }
    errorText.textContent = "";
    setState({ settings: parsed.data });
    syncDurationWithSettings();
  });

  let initialized = false;
  return (state: AppState) => {
    if (initialized) return; // 入力中の値を保存操作以外で上書きしないよう、初期表示時のみ反映する
    initialized = true;
    for (const field of FIELDS) {
      inputs.get(field.key)!.value = String(state.settings[field.key]);
    }
  };
}
