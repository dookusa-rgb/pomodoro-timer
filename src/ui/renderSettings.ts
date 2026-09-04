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
  const wrapper = el("div", { className: "flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-800" });
  wrapper.append(el("h2", { className: "text-lg font-semibold", text: "設定" }));

  const inputs = new Map<keyof Settings, HTMLInputElement>();

  for (const field of FIELDS) {
    const row = el("label", { className: "flex items-center justify-between gap-3 text-sm" });
    row.append(el("span", { text: field.label }));
    const input = el("input", {
      className: "w-20 rounded-lg border border-slate-300 px-3 py-1.5 text-right dark:border-slate-600 dark:bg-slate-900",
      attrs: { type: "number", min: String(field.min), max: String(field.max) },
    });
    inputs.set(field.key, input);
    row.append(input);
    wrapper.append(row);
  }

  const errorText = el("p", { className: "min-h-[1.25rem] text-sm text-red-500" });
  const saveButton = el("button", {
    className: "rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200",
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
