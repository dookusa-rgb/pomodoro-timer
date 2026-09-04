import { z } from "zod";

// タイマーのモード
export const TimerModeSchema = z.enum(["work", "shortBreak", "longBreak"]);
export type TimerMode = z.infer<typeof TimerModeSchema>;

// タスク1件
export const TaskSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, "タスク名を入力してください").max(50, "タスク名は50文字以内で入力してください"),
  estimatedPomodoros: z
    .number()
    .int("整数で入力してください")
    .min(1, "1以上で入力してください")
    .max(20, "20以下で入力してください"),
  completedPomodoros: z.number().int().min(0),
  createdAt: z.number(),
});
export type Task = z.infer<typeof TaskSchema>;

// タイマーの各種設定（分単位）
export const SettingsSchema = z.object({
  workMinutes: z.number().int().min(1, "1分以上で入力してください").max(120, "120分以下で入力してください"),
  shortBreakMinutes: z.number().int().min(1, "1分以上で入力してください").max(60, "60分以下で入力してください"),
  longBreakMinutes: z.number().int().min(1, "1分以上で入力してください").max(60, "60分以下で入力してください"),
  cyclesBeforeLongBreak: z
    .number()
    .int("整数で入力してください")
    .min(1, "1以上で入力してください")
    .max(10, "10以下で入力してください"),
});
export type Settings = z.infer<typeof SettingsSchema>;

export const DEFAULT_SETTINGS: Settings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
};

// 今日の完了ポモドーロ数（日付が変わったらリセットする）
export const TodayStatsSchema = z.object({
  date: z.string(), // "YYYY-MM-DD"
  completedPomodoros: z.number().int().min(0),
});
export type TodayStats = z.infer<typeof TodayStatsSchema>;

// LocalStorageに保存するアプリ全体の状態
export const AppStateSchema = z.object({
  tasks: z.array(TaskSchema),
  settings: SettingsSchema,
  todayStats: TodayStatsSchema,
  selectedTaskId: z.string().nullable(),
});
export type AppState = z.infer<typeof AppStateSchema>;
