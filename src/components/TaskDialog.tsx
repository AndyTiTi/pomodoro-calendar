import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { useCalendar } from '@/store/calendar-context';
import { PLATFORM_META, PLATFORM_ORDER, TASK_TYPE_META, TASK_TYPE_ORDER } from '@/data/constants';
import { genId } from '@/lib/import-export';
import { todayKey } from '@/lib/date';
import type { ITask, Platform, TaskType } from '@/data/types';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTask?: ITask | null;
  defaultDate?: string;
}

export default function TaskDialog({ open, onOpenChange, editingTask, defaultDate }: TaskDialogProps) {
  const { addTask, updateTask, deleteTask } = useCalendar();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayKey());
  const [time, setTime] = useState('');
  const [platform, setPlatform] = useState<Platform>('official');
  const [type, setType] = useState<TaskType>('publish');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editingTask) {
      setTitle(editingTask.title);
      setDate(editingTask.date);
      setTime(editingTask.time ?? '');
      setPlatform(editingTask.platform);
      setType(editingTask.type);
      setNote(editingTask.note ?? '');
    } else {
      setTitle('');
      setDate(defaultDate ?? todayKey());
      setTime('');
      setPlatform('official');
      setType('publish');
      setNote('');
    }
  }, [open, editingTask, defaultDate]);

  const handleSave = () => {
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      date,
      time: time || undefined,
      platform,
      type,
      note: note || undefined,
    };
    if (editingTask) {
      updateTask(editingTask.id, payload);
    } else {
      addTask({ id: genId(), done: false, ...payload });
    }
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (editingTask) deleteTask(editingTask.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingTask ? '编辑日程' : '新建日程'}</DialogTitle>
          <DialogDescription>记录写作与各平台发布安排，发布日会在日历上标记。</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="task-title">标题</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：掘金发布（技术社区版）"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="task-date">日期</Label>
              <Input id="task-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="task-time">时间（可选）</Label>
              <Input id="task-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="task-platform">平台</Label>
              <NativeSelect
                id="task-platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
              >
                {PLATFORM_ORDER.map((p) => (
                  <NativeSelectOption key={p} value={p}>
                    {PLATFORM_META[p].label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="task-type">类型</Label>
              <NativeSelect id="task-type" value={type} onChange={(e) => setType(e.target.value as TaskType)}>
                {TASK_TYPE_ORDER.map((t) => (
                  <NativeSelectOption key={t} value={t}>
                    {TASK_TYPE_META[t].label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="task-note">备注（可选）</Label>
            <Textarea
              id="task-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="分发要点、链接、注意事项"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          {editingTask && (
            <Button variant="destructive" onClick={handleDelete} className="sm:mr-auto">
              <Trash2 className="size-4" /> 删除
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
