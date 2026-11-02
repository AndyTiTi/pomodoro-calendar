import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CalendarContext } from './calendar-context';
import type { CalendarContextValue } from './calendar-context';
import type { ITask, ISettings, ICalendarData } from '@/data/types';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '@/data/constants';
import { SAMPLE_TASKS } from '@/data/sample';
import { storage } from '@/lib/storage';
import { buildExportData } from '@/lib/import-export';

export default function CalendarProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<ITask[]>(() =>
    storage.get<ITask[]>(STORAGE_KEYS.tasks, SAMPLE_TASKS),
  );
  const [pomodoro, setPomodoro] = useState<Record<string, number>>(() =>
    storage.get<Record<string, number>>(STORAGE_KEYS.pomodoro, {}),
  );
  const [settings, setSettings] = useState<ISettings>(() =>
    storage.get<ISettings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS),
  );

  useEffect(() => storage.set(STORAGE_KEYS.tasks, tasks), [tasks]);
  useEffect(() => storage.set(STORAGE_KEYS.pomodoro, pomodoro), [pomodoro]);
  useEffect(() => storage.set(STORAGE_KEYS.settings, settings), [settings]);

  const value = useMemo<CalendarContextValue>(() => {
    const addTask = (task: ITask) => setTasks((prev) => [...prev, task]);

    const updateTask = (id: string, patch: Partial<ITask>) =>
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

    const deleteTask = (id: string) =>
      setTasks((prev) => prev.filter((t) => t.id !== id));

    const toggleDone = (id: string) =>
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

    const updateSettings = (patch: Partial<ISettings>) =>
      setSettings((prev) => ({ ...prev, ...patch }));

    const addPomodoro = (date: string) =>
      setPomodoro((prev) => ({ ...prev, [date]: (prev[date] ?? 0) + 1 }));

    const importData = (data: ICalendarData) => {
      setTasks(data.tasks);
      setPomodoro(data.pomodoro);
      setSettings(data.settings);
    };

    const exportData = () => buildExportData(tasks, pomodoro, settings);

    return {
      tasks,
      pomodoro,
      settings,
      addTask,
      updateTask,
      deleteTask,
      toggleDone,
      updateSettings,
      addPomodoro,
      importData,
      exportData,
    };
  }, [tasks, pomodoro, settings]);

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
}
