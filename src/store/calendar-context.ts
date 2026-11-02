import { createContext, useContext } from 'react';
import type { ITask, ISettings, ICalendarData } from '@/data/types';

// EXPORTS: CalendarContextValue, useCalendar
export interface CalendarContextValue {
  tasks: ITask[];
  pomodoro: Record<string, number>;
  settings: ISettings;
  addTask: (task: ITask) => void;
  updateTask: (id: string, patch: Partial<ITask>) => void;
  deleteTask: (id: string) => void;
  toggleDone: (id: string) => void;
  updateSettings: (patch: Partial<ISettings>) => void;
  addPomodoro: (date: string) => void;
  importData: (data: ICalendarData) => void;
  exportData: () => ICalendarData;
}

export const CalendarContext = createContext<CalendarContextValue | null>(null);

export const useCalendar = (): CalendarContextValue => {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error('useCalendar 必须在 CalendarProvider 内使用');
  return ctx;
};
