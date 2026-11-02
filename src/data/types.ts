// EXPORTS: Platform, TaskType, ITask, ISettings, ICalendarData, TimerMode
// 全局数据模型，所有业务代码以本文件为准，不自行脑补字段

// 发布平台（对应 D0–D5 分发节奏）
export type Platform =
  | 'official' // 官网 D0
  | 'juejin' // 掘金 D1
  | 'csdn' // CSDN D2
  | 'zhihu' // 知乎 D3–D4
  | 'wechat' // 公众号 D5
  | 'other';

// 任务性质
export type TaskType = 'writing' | 'publish' | 'review' | 'other';

// 番茄钟模式
export type TimerMode = 'focus' | 'short' | 'long';

// 一条发布 / 写作日程
export interface ITask {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  platform: Platform;
  type: TaskType;
  done: boolean;
  note?: string;
}

// 番茄钟与提醒设置
export interface ISettings {
  focusMin: number;
  shortBreakMin: number;
  longBreakMin: number;
  longBreakInterval: number; // 每完成几个专注进入一次长休息
  autoStart: boolean;
  notifyEnabled: boolean;
  remindBeforeMin: number;
}

// 导出 / 导入 JSON 的完整结构（git 管理对象）
export interface ICalendarData {
  version: number;
  tasks: ITask[];
  pomodoro: Record<string, number>; // date -> 当日完成番茄数
  settings: ISettings;
}
