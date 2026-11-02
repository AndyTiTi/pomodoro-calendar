import { useMemo, useState } from 'react';
import { CalendarPlus, Check, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TaskDialog from '@/components/TaskDialog';
import RhythmDialog from '@/components/RhythmDialog';
import { useCalendar } from '@/store/calendar-context';
import { PLATFORM_META, TASK_TYPE_META } from '@/data/constants';
import { WEEK_HEADERS, getMonthGrid, monthLabel, parseKey, todayKey } from '@/lib/date';
import type { ITask } from '@/data/types';

export default function CalendarPage() {
  const { tasks, toggleDone } = useCalendar();
  const [view, setView] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedKey, setSelectedKey] = useState(() => todayKey());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ITask | null>(null);
  const [rhythmOpen, setRhythmOpen] = useState(false);

  const today = todayKey();
  const cells = useMemo(() => getMonthGrid(view.year, view.month), [view]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, ITask[]>();
    for (const task of tasks) {
      const list = map.get(task.date) ?? [];
      list.push(task);
      map.set(task.date, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.time ?? '99:99').localeCompare(b.time ?? '99:99'));
    }
    return map;
  }, [tasks]);

  const dayTasks = tasksByDate.get(selectedKey) ?? [];

  const shiftMonth = (delta: number) => {
    setView((prev) => {
      const d = new Date(prev.year, prev.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const openCreate = (key: string) => {
    setSelectedKey(key);
    setEditingTask(null);
    setDialogOpen(true);
  };

  const selectDay = (key: string) => {
    setSelectedKey(key);
  };

  const openEdit = (task: ITask) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const selectedLabel = (() => {
    const d = parseKey(selectedKey);
    return `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
  })();

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <Card className="flex-1">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">{monthLabel(view.year, view.month)}</CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="上一月" onClick={() => shiftMonth(-1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const now = new Date();
                setView({ year: now.getFullYear(), month: now.getMonth() });
                setSelectedKey(todayKey());
              }}
            >
              今天
            </Button>
            <Button variant="ghost" size="icon" aria-label="下一月" onClick={() => shiftMonth(1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {WEEK_HEADERS.map((w) => (
              <div key={w} className="py-1 text-center text-xs font-medium text-muted-foreground">
                {w}
              </div>
            ))}
            {cells.map((cell) => {
              const hasTasks = tasksByDate.has(cell.key);
              const isToday = cell.key === today;
              const isSelected = cell.key === selectedKey;
              return (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => selectDay(cell.key)}
                  className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-lg text-sm transition-colors hover:bg-muted ${
                    cell.inMonth ? 'text-foreground' : 'text-muted-foreground/50'
                  } ${isSelected ? 'bg-muted ring-1 ring-border' : ''} ${
                    isToday ? 'font-semibold text-primary ring-2 ring-primary' : ''
                  }`}
                >
                  <span>{cell.date.getDate()}</span>
                  <span
                    className={`size-1.5 rounded-full ${hasTasks ? 'bg-primary' : 'bg-transparent'}`}
                  />
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setRhythmOpen(true)}>
              <CalendarPlus className="size-4" /> 生成发文节奏
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full lg:w-80">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">
            {selectedLabel}
            {selectedKey === today && <span className="ml-2 text-sm text-primary">今天</span>}
          </CardTitle>
          <Button size="sm" onClick={() => openCreate(selectedKey)}>
            <Plus className="size-4" /> 添加日程
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {dayTasks.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              这一天还没有安排，点右上「添加日程」新建，或用「生成发文节奏」排一整周。
            </p>
          )}
          {dayTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-2 rounded-lg border border-border p-3"
            >
              <button
                type="button"
                aria-label={task.done ? '标记未完成' : '标记完成'}
                onClick={() => toggleDone(task.id)}
                className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
                  task.done
                    ? 'border-accent bg-accent text-accent-foreground'
                    : 'border-border text-transparent hover:border-primary'
                }`}
              >
                <Check className="size-3" />
              </button>
              <button type="button" onClick={() => openEdit(task)} className="flex-1 text-left">
                <p className={`text-sm font-medium ${task.done ? 'text-muted-foreground line-through' : ''}`}>
                  {task.title}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary">{PLATFORM_META[task.platform].label}</Badge>
                  <Badge variant="outline">{TASK_TYPE_META[task.type].label}</Badge>
                  {task.time && <span className="text-xs text-muted-foreground">{task.time}</span>}
                </div>
                {task.note && <p className="mt-1 text-xs text-muted-foreground">{task.note}</p>}
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingTask={editingTask}
        defaultDate={selectedKey}
      />
      <RhythmDialog open={rhythmOpen} onOpenChange={setRhythmOpen} defaultDate={selectedKey} />
    </div>
  );
}