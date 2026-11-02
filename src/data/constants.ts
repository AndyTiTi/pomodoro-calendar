import type { Platform, TaskType, ISettings } from './types';

// localStorage 命名空间（= 工程目录名，全项目唯一）
export const NS = 'pomodoro-calendar';

export const STORAGE_KEYS = {
  tasks: 'tasks',
  pomodoro: 'pomodoro',
  settings: 'settings',
} as const;

export const DATA_VERSION = 1;

export const PLATFORM_META: Record<Platform, { label: string; short: string }> = {
  official: { label: '官网', short: '官网' },
  juejin: { label: '掘金', short: '掘金' },
  csdn: { label: 'CSDN', short: 'CSDN' },
  zhihu: { label: '知乎', short: '知乎' },
  wechat: { label: '公众号', short: '公众号' },
  other: { label: '其他', short: '其他' },
};

export const TASK_TYPE_META: Record<TaskType, { label: string }> = {
  writing: { label: '写作' },
  publish: { label: '发布' },
  review: { label: '复盘' },
  other: { label: '其他' },
};

export const DEFAULT_SETTINGS: ISettings = {
  focusMin: 25,
  shortBreakMin: 5,
  longBreakMin: 15,
  longBreakInterval: 4,
  autoStart: false,
  notifyEnabled: true,
  remindBeforeMin: 30,
};

// 平台顺序（用于表单选择与发布节奏）
export const PLATFORM_ORDER: Platform[] = [
  'official',
  'juejin',
  'csdn',
  'zhihu',
  'wechat',
  'other',
];

export const TASK_TYPE_ORDER: TaskType[] = ['writing', 'publish', 'review', 'other'];
