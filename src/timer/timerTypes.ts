import type { TimerMode } from "../types/schema";

export type TimerStatus = "idle" | "running" | "paused";

export interface TimerState {
  mode: TimerMode;
  status: TimerStatus;
  // 現在のモードにおける残り時間（ミリ秒）
  remainingMs: number;
  // running中のみ設定される、カウントダウンの終了予定時刻（Date.now()基準）
  endTime: number | null;
  // longBreakへ遷移するまでに完了したworkサイクル数
  completedCycles: number;
}
