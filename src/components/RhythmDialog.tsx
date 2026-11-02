import { useState } from 'react';
import { toast } from 'sonner';
import { CalendarPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCalendar } from '@/store/calendar-context';
import { PLATFORM_META } from '@/data/constants';
import { RHYTHM_STEPS, WEEKDAY_LABELS, addDays, mondayOf } from '@/lib/rhythm';
import { genId } from '@/lib/import-export';
import { todayKey } from '@/lib/date';

interface RhythmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
}

export default function RhythmDialog({ open, onOpenChange, defaultDate }: RhythmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && (
          <RhythmForm
            key={defaultDate ?? todayKey()}
            onOpenChange={onOpenChange}
            defaultDate={defaultDate}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function RhythmForm({
  onOpenChange,
  defaultDate,
}: Omit<RhythmDialogProps, 'open'>) {
  const { tasks, addTask } = useCalendar();
  const [topic, setTopic] = useState('');
  const [monday, setMonday] = useState(() => mondayOf(defaultDate ?? todayKey()));

  const handleGenerate = () => {
    if (!topic.trim()) return;
    let added = 0;
    let skipped = 0;
    for (const step of RHYTHM_STEPS) {
      const date = addDays(monday, step.offset);
      const exists = tasks.some(
        (t) => t.date === date && t.platform === step.platform && t.type === step.type,
      );
      if (exists) {
        skipped += 1;
        continue;
      }
      addTask({
        id: genId(),
        title: `${step.title}：${topic.trim()}`,
        date,
        time: step.time,
        platform: step.platform,
        type: step.type,
        done: false,
        note: step.note,
      });
      added += 1;
    }
    if (added > 0) {
      toast.success(
        `已按 7 天分发流水线生成 ${added} 条日程${skipped > 0 ? `，跳过 ${skipped} 条已存在` : ''}`,
      );
    } else {
      toast.info('该周各平台日程均已存在，未重复生成');
    }
    onOpenChange(false);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>生成发文节奏</DialogTitle>
        <DialogDescription>
          按 code-blog 发布 SOP：周一官网首发 → 周二掘金 → 周三 CSDN → 周四知乎 → 周五公众号 → 周日复盘。
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="rhythm-topic">本篇选题</Label>
          <Input
            id="rhythm-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="例如：Next.js 渲染模式长文"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="rhythm-monday">起始周一（D0 官网首发日）</Label>
          <Input
            id="rhythm-monday"
            type="date"
            value={monday}
            onChange={(e) => e.target.value && setMonday(mondayOf(e.target.value))}
          />
        </div>

        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/40 p-3">
          {RHYTHM_STEPS.map((step) => (
            <div key={step.offset} className="flex items-center gap-2 text-sm">
              <span className="w-10 shrink-0 text-muted-foreground">{WEEKDAY_LABELS[step.offset]}</span>
              <Badge variant="secondary">{PLATFORM_META[step.platform].label}</Badge>
              <span className="truncate">{step.title}</span>
              {step.time && (
                <span className="ml-auto shrink-0 text-muted-foreground">{step.time}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          取消
        </Button>
        <Button onClick={handleGenerate} disabled={!topic.trim() || !monday}>
          <CalendarPlus className="size-4" /> 生成一周日程
        </Button>
      </DialogFooter>
    </>
  );
}