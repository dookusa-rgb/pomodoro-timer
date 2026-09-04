import { AppStateSchema, DEFAULT_SETTINGS, type AppState } from "../types/schema";
import { todayDateString } from "../stats/todayStats";

// スキーマを変更したら末尾のバージョンを上げ、古いデータと衝突しないようにする
const STORAGE_KEY = "pomodoro-app-state-v1";

function createDefaultState(): AppState {
  return {
    tasks: [],
    settings: DEFAULT_SETTINGS,
    todayStats: { date: todayDateString(), completedPomodoros: 0 },
    selectedTaskId: null,
  };
}

// 保存されている状態を読み込む。壊れている/存在しない場合はデフォルト値を返す
export function loadState(): AppState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createDefaultState();

  try {
    const parsed = AppStateSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : createDefaultState();
  } catch {
    return createDefaultState();
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
