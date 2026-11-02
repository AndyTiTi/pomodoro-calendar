import { useRef } from 'react';
import { toast } from 'sonner';
import { Download, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useCalendar } from '@/store/calendar-context';
import { ensureNotifyPermission } from '@/lib/notify';
import { downloadJson, parseImport } from '@/lib/import-export';
import { todayKey } from '@/lib/date';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const clampInt = (raw: string, min: number, max: number): number => {
  const n = Number(raw);
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
};

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { settings, updateSettings, exportData, importData } = useCalendar();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleNotifyToggle = async (checked: boolean) => {
    if (!checked) {
      updateSettings({ notifyEnabled: false });
      return;
    }
    const granted = await ensureNotifyPermission();
    if (granted) {
      updateSettings({ notifyEnabled: true });
    } else {
      toast.error('通知权限被拒绝，请在系统或浏览器设置中允许通知后再开启');
    }
  };

  const handleExport = () => {
    const filename = `pomodoro-calendar-${todayKey().replaceAll('-', '')}.json`;
    downloadJson(exportData(), filename);
    toast.success('已导出 JSON，把它纳入 git 即可跨设备同步');
  };

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text();
      importData(parseImport(text));
      toast.success('导入成功，数据已替换');
    } catch (err) {
      toast.error(`导入失败：${err instanceof Error ? err.message : '文件无法解析'}`);
    }
  };

  const numberField = (
    id: string,
    label: string,
    value: number,
    min: number,
    max: number,
    onChange: (n: number) => void,
  ) => (
    <div className="flex items-center justify-between gap-4">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(clampInt(e.target.value, min, max))}
        className="w-24 text-right"
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>设置</DialogTitle>
          <DialogDescription>番茄钟时长、发布提醒与数据导入导出。</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">番茄钟</h3>
            {numberField('focus-min', '专注时长（分钟）', settings.focusMin, 1, 120, (n) =>
              updateSettings({ focusMin: n }),
            )}
            {numberField('short-min', '短休息（分钟）', settings.shortBreakMin, 1, 60, (n) =>
              updateSettings({ shortBreakMin: n }),
            )}
            {numberField('long-min', '长休息（分钟）', settings.longBreakMin, 1, 120, (n) =>
              updateSettings({ longBreakMin: n }),
            )}
            {numberField('long-interval', '每几个专注进入长休息', settings.longBreakInterval, 2, 8, (n) =>
              updateSettings({ longBreakInterval: n }),
            )}
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="auto-start">结束后自动开始下一段</Label>
              <Switch
                id="auto-start"
                checked={settings.autoStart}
                onCheckedChange={(checked) => updateSettings({ autoStart: checked })}
              />
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">发布提醒</h3>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="notify-enabled">开启日程提醒</Label>
              <Switch
                id="notify-enabled"
                checked={settings.notifyEnabled}
                onCheckedChange={handleNotifyToggle}
              />
            </div>
            {numberField('remind-before', '提前提醒（分钟）', settings.remindBeforeMin, 0, 120, (n) =>
              updateSettings({ remindBeforeMin: n }),
            )}
            <p className="text-xs text-muted-foreground">
              带时间的日程会在到点前与准点各提醒一次；请保持应用运行（桌面版可最小化到托盘）。
            </p>
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">数据管理</h3>
            <p className="text-xs text-muted-foreground">
              数据保存在本机；导出 JSON 纳入 git 管理，即可在多台电脑间 pull / push 同步。
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="size-4" /> 导出 JSON
              </Button>
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload className="size-4" /> 导入 JSON
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleImportFile(file);
                  e.target.value = '';
                }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}