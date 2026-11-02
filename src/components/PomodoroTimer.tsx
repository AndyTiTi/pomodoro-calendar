import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePomodoro } from '@/hooks/usePomodoro';
import type { TimerMode } from '@/data/types';

const MODE_LABEL: Record<TimerMode, string> = {
  focus: '专注',
  short: '短休息',
  long: '长休息',
};

const MODE_TABS: TimerMode[] = ['focus', 'short', 'long'];

const formatClock = (total: number): string => {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const SIZE = 260;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function PomodoroTimer() {
  const { mode, running, secondsLeft, totalSeconds, completedFocus, start, pause, reset, switchMode } =
    usePomodoro();

  const progress = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const ringColor = mode === 'focus' ? 'var(--primary)' : 'var(--accent)';

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-1 rounded-full bg-muted p-1">
        {MODE_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => switchMode(tab)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              mode === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            {MODE_LABEL[tab]}
          </button>
        ))}
      </div>

      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--border)"
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={ringColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-medium text-muted-foreground">{MODE_LABEL[mode]}</span>
          <span className="font-mono text-6xl font-semibold tracking-tight text-foreground">
            {formatClock(secondsLeft)}
          </span>
          <span className="mt-1 text-sm text-muted-foreground">今日已完成 {completedFocus} 个番茄</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={reset} aria-label="重置">
          <RotateCcw className="size-4" />
        </Button>
        {running ? (
          <Button size="lg" className="w-40" onClick={pause}>
            <Pause className="size-4" /> 暂停
          </Button>
        ) : (
          <Button size="lg" className="w-40" onClick={start}>
            <Play className="size-4" /> 开始
          </Button>
        )}
      </div>
    </div>
  );
}
