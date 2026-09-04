import type { AppState } from "../types/schema";
import { loadState, saveState } from "../storage/localStorage";
import { rolloverIfNewDay } from "../stats/todayStats";

type Listener = (state: AppState) => void;

let state: AppState = (() => {
  const loaded = loadState();
  return { ...loaded, todayStats: rolloverIfNewDay(loaded.todayStats) };
})();

const listeners = new Set<Listener>();

export function getState(): AppState {
  return state;
}

// 状態を部分更新し、購読者への通知とLocalStorageへの保存を行う
export function setState(patch: Partial<AppState> | ((prev: AppState) => Partial<AppState>)): void {
  const next = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...next };
  saveState(state);
  for (const listener of listeners) listener(state);
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
