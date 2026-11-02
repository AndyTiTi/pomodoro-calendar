import { useCallback, useEffect, useRef, useState } from 'react';
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

  // interval 回调里读取最新状态，避免闭包过期
  const liveRef = useRef({ secondsLeft, mode, completedFocus, settings, addPomodoro, goMode });
  useEffect(() => {
    liveRef.current = { secondsLeft, mode, completedFocus, settings, addPomodoro, goMode };
  });

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const live = liveRef.current;
      if (live.secondsLeft > 1) {
        setSecondsLeft(live.secondsLeft - 1);
        return;
      }
      // 到 0：结算并切换模式
      setSecondsLeft(0);
      let nextMode: TimerMode;
      if (live.mode === 'focus') {
        const count = live.completedFocus + 1;
        setCompletedFocus(count);
        live.addPomodoro(todayKey());
        const isLong = count % live.settings.longBreakInterval === 0;
        nextMode = isLong ? 'long' : 'short';
        sendNotification('专注完成', isLong ? '进入长休息，放松一下' : '进入短休息');
      } else {
        nextMode = 'focus';
        sendNotification('休息结束', '开始下一个专注');
      }
      live.goMode(nextMode, live.settings.autoStart);
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

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