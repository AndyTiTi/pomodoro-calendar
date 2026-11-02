import type { ICalendarData, ITask, ISettings } from '@/data/types';
import { DATA_VERSION } from '@/data/constants';

// 构造写入 git 的完整 JSON 对象
export const buildExportData = (
  tasks: ITask[],
  pomodoro: Record<string, number>,
  settings: ISettings,
): ICalendarData => ({
  version: DATA_VERSION,
  tasks,
  pomodoro,
  settings,
});

// 校验导入数据，返回清洗后的结构；非法则抛错
export const parseImport = (raw: string): ICalendarData => {
  const parsed = JSON.parse(raw) as Partial<ICalendarData>;
  if (!parsed || !Array.isArray(parsed.tasks) || typeof parsed.settings !== 'object') {
    throw new Error('文件格式不正确：缺少 tasks 或 settings');
  }
  return {
    version: typeof parsed.version === 'number' ? parsed.version : DATA_VERSION,
    tasks: parsed.tasks as ITask[],
    pomodoro: parsed.pomodoro ?? {},
    settings: parsed.settings as ISettings,
  };
};

// 触发浏览器下载 JSON 文件
export const downloadJson = (data: ICalendarData, filename: string): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// 生成简单唯一 id
export const genId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
