export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  completedAt: string | null;
  details: string;
  subTasks: SubTask[];
}

export interface Firm {
  id: string;
  code: string;
  name: string;
}

export interface Visit {
  id: string;
  firmId: string;
  firmName: string;
  date: string;
  status: 'pending' | 'completed';
  todos: Todo[];
}

export interface FrequentTask {
  id: string;
  text: string;
  defaultSubTasks: string[];
}

export interface CarriedOverTodoItem {
  id: string;
  text: string;
  subTasks: SubTask[];
}

export interface CarriedOverFirmData {
  firm: CarriedOverTodoItem[];
  client: CarriedOverTodoItem[];
}

export type CarriedOverTodos = Record<string, CarriedOverFirmData>;

export interface ProcessedFirm extends Firm {
  status: 'unvisited' | 'scheduled' | 'visited';
  statusLabel: string;
  monthCount: number;
  alertLevel: number;
  daysSince: number;
}

export interface Alert {
  firm: Firm;
  level: number;
  daysSince: number;
  lastVisitDate: string;
}

// --- タスク進捗管理 ---

export type TaskCategory = '研修' | 'TPS' | 'その他';

export interface TaskAssignment {
  firmId: string;
  completed: boolean;
  completedAt?: string;
}

export interface ProgressTask {
  id: string;
  title: string;
  category: TaskCategory;
  deadline: string;
  assignments: TaskAssignment[];
  createdAt: string;
  archived: boolean;
}

export interface RecurringTaskTemplate {
  id: string;
  title: string;
  category: TaskCategory;
  triggerMonth: number;
}
