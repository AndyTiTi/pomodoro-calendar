import { useEffect, useRef } from 'react';
import { useCalendar } from '@/store/calendar-context';
import { parseKey } from '@/lib/date';
import { sendNotification } from '@/lib/notify';
import { PLATFORM_META } from '@/data/constants';

// 到点前 remindBeforeMin 分钟与准点各提醒一次；仅处理带时间的未完成日程
export const useReminders = (): void => {
  const { tasks, settings } = useCalendar();
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!settings.notifyEnabled) return;

    const check = () => {
      const now = Date.now();
      for (const task of tasks) {
        if (task.done || !task.time) continue;
        const [h, m] = task.time.split(':').map(Number);
        const due = parseKey(task.date);
        due.setHours(h, m, 0, 0);
        const dueMs = due.getTime();
        const remindMs = dueMs - settings.remindBeforeMin * 60_000;

        const slots: Array<[number, string, string]> = [
          [remindMs, `${task.id}:before`, `${settings.remindBeforeMin} 分钟后：${task.title}`],
          [dueMs, `${task.id}:due`, `现在该发布了：${task.title}`],
        ];
        for (const [at, key, body] of slots) {
          if (now >= at && now < at + 60_000 && !firedRef.current.has(key)) {
            firedRef.current.add(key);
            sendNotification(`${PLATFORM_META[task.platform].label} · ${task.time}`, body);
          }
        }
      }
    };

    check();
    const id = window.setInterval(check, 20_000);
    return () => window.clearInterval(id);
  }, [tasks, settings]);
};