import { useCallback, useEffect, useState } from 'react';
import { useCalendar } from '@/store/calendar-context';
import type { TimerMode } from '@/data/types';
import { todayKey } from '@/lib/date';
import { sendNotification } from '@/lib/notify';

const modeMinutes = (mode: TimerMode, focusMin: number, short: number, long: number): number => {
  if (mode === 'short') return short;
  if (mode === 'long') return long;
  return focusMin;
};

export const usePomodoro = () => {
  const { settings, addPomodoro } = useCalendar();
  const [mode, setMode] = useState<TimerMode>('focus');
  const [running, setRunning] = useState(false);
  const [completedFocus, setCompletedFocus] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(settings.focusMin * 60);
  const [secondsLeft, setSecondsLeft] = useState(settings.focusMin * 60);

  const goMode = useCallback(
    (next: TimerMode, autostart: boolean) => {
      const secs =
        modeMinutes(next, settings.focusMin, settings.shortBreakMin, settings.longBreakMin) * 60;
      setMode(next);
      setTotalSeconds(secs);
      setSecondsLeft(secs);
      setRunning(autostart);
    },
    [settings],
  );

  // 每秒递减
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  // 到 0 后结算并切换模式
  useEffect(() => {
    if (!running || secondsLeft !== 0) return;
    let nextMode: TimerMode;
    if (mode === 'focus') {
      const count = completedFocus + 1;
      setCompletedFocus(count);
      addPomodoro(todayKey());
      const isLong = count % settings.longBreakInterval === 0;
      nextMode = isLong ? 'long' : 'short';
      sendNotification('专注完成', isLong ? '进入长休息，放松一下' : '进入短休息');
    } else {
      nextMode = 'focus';
      sendNotification('休息结束', '开始下一个专注');
    }
    goMode(nextMode, settings.autoStart);
  }, [secondsLeft, running, mode, completedFocus, settings, addPomodoro, goMode]);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => goMode(mode, false), [goMode, mode]);
  const switchMode = useCallback((next: TimerMode) => goMode(next, false), [goMode]);

  return {
    mode,
    running,
    secondsLeft,
    totalSeconds,
    completedFocus,
    start,
    pause,
    reset,
    switchMode,
  };
};
