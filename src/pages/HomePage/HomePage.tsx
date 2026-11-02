import { useMemo, useState } from 'react';
import { BellRing, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PomodoroTimer from '@/components/PomodoroTimer';
import TaskDialog from '@/components/TaskDialog';
import { useCalendar } from '@/store/calendar-context';
import { PLATFORM_META, TASK_TYPE_META } from '@/data/constants';
import { todayKey } from '@/lib/date';
import type { ITask } from '@/data/types';

export default function HomePage() {
  const { tasks, pomodoro, toggleDone } = useCalendar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ITask | null>(null);

  const today = todayKey();
  const todayTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.date === today)
        .sort((a, b) => (a.time ?? '99:99').localeCompare(b.time ?? '99:99')),
    [tasks, today],
  );
  const publishAlerts = todayTasks.filter((t) => t.type === 'publish' && !t.done);
  const todayCount = pomodoro[today] ?? 0;

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <Card className="flex shrink-0 justify-center py-8 lg:w-[380px]">
        <PomodoroTimer />
      </Card>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="flex flex-col items-center gap-1 py-6">
              <span className="text-4xl font-semibold text-primary">{todayCount}</span>
              <span className="text-sm text-muted-foreground">今日番茄数</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center gap-1 py-6">
              <span className="text-4xl font-semibold text-accent">{publishAlerts.length}</span>
              <span className="text-sm text-muted-foreground">今日待发布</span>
            </CardContent>
          </Card>
        </div>

        {publishAlerts.length > 0 && (
          <Card className="border-primary/40 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-primary">
                <BellRing className="size-4" /> 今日发布提醒
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {publishAlerts.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => {
                    setEditingTask(task);
                    setDialogOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-lg bg-card p-3 text-left shadow-sm"
                >
                  <Badge>{PLATFORM_META[task.platform].label}</Badge>
                  <span className="flex-1 truncate text-sm font-medium">{task.title}</span>
                  {task.time && <span className="text-sm text-muted-foreground">{task.time}</span>}
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">今日任务</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingTask(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" /> 新建
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {todayTasks.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                今天还没有安排。新建一条日程，或到发布日历生成本周的发文节奏。
              </p>
            )}
            {todayTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-2 rounded-lg border border-border p-3">
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
                <button
                  type="button"
                  onClick={() => {
                    setEditingTask(task);
                    setDialogOpen(true);
                  }}
                  className="flex-1 text-left"
                >
                  <p className={`text-sm font-medium ${task.done ? 'text-muted-foreground line-through' : ''}`}>
                    {task.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary">{PLATFORM_META[task.platform].label}</Badge>
                    <Badge variant="outline">{TASK_TYPE_META[task.type].label}</Badge>
                    {task.time && <span className="text-xs text-muted-foreground">{task.time}</span>}
                  </div>
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingTask={editingTask}
        defaultDate={today}
      />
    </div>
  );
}