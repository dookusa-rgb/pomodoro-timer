import { TaskSchema, type Task } from "../types/schema";
import { getState, setState } from "../store/appStore";

export interface TaskInput {
  name: string;
  estimatedPomodoros: number;
}

export type TaskValidationResult = { success: true; task: Task } | { success: false; errors: string[] };

// 入力値をZodで検証し、問題なければタスクを追加する
export function addTask(input: TaskInput): TaskValidationResult {
  const candidate = {
    id: crypto.randomUUID(),
    name: input.name,
    estimatedPomodoros: input.estimatedPomodoros,
    completedPomodoros: 0,
    createdAt: Date.now(),
  };

  const parsed = TaskSchema.safeParse(candidate);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.issues.map((issue) => issue.message) };
  }

  const { tasks } = getState();
  setState({ tasks: [...tasks, parsed.data] });
  return { success: true, task: parsed.data };
}

export function deleteTask(taskId: string): void {
  const { tasks, selectedTaskId } = getState();
  setState({
    tasks: tasks.filter((t) => t.id !== taskId),
    selectedTaskId: selectedTaskId === taskId ? null : selectedTaskId,
  });
}

export function selectTask(taskId: string | null): void {
  setState({ selectedTaskId: taskId });
}
