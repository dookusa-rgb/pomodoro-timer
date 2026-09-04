import type { TodayStats } from "../types/schema";

// ローカルタイムゾーンでの "YYYY-MM-DD" を返す
export function todayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 日付が変わっていればカウントをリセットした新しい状態を返す
export function rolloverIfNewDay(stats: TodayStats): TodayStats {
  const today = todayDateString();
  if (stats.date === today) return stats;
  return { date: today, completedPomodoros: 0 };
}

export function incrementTodayCompleted(stats: TodayStats): TodayStats {
  const rolled = rolloverIfNewDay(stats);
  return { ...rolled, completedPomodoros: rolled.completedPomodoros + 1 };
}
