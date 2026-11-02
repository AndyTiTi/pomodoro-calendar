import type { Platform, TaskType } from '@/data/types';
import { dateKey, parseKey } from '@/lib/date';

// code-blog《内容发布节奏与官网植入规划》5.2 节「7 天分发流水线」
// D0 周一官网首发 → D1 掘金 → D2 CSDN → D3–D4 知乎 → D5 周五公众号 → 周末复盘
export interface RhythmStep {
  offset: number; // 相对周一的天数
  platform: Platform;
  type: TaskType;
  time?: string;
  title: string;
  note: string;
}

export const RHYTHM_STEPS: RhythmStep[] = [
  {
    offset: 0,
    platform: 'official',
    type: 'publish',
    time: '10:00',
    title: '官网首发',
    note: '原创与 SEO 源头，完整内链体系，保证版权归属',
  },
  {
    offset: 1,
    platform: 'juejin',
    type: 'publish',
    time: '11:00',
    title: '掘金发布（技术社区版）',
    note: '保留 1–2 个链接；选好分类、标签、摘要；文末标注首发于 yunzhanlab.com',
  },
  {
    offset: 2,
    platform: 'csdn',
    type: 'publish',
    time: '14:00',
    title: 'CSDN 发布（再改写版）',
    note: '链接作参考资料；个人主页简介同步放网址；无联系方式及变体',
  },
  {
    offset: 3,
    platform: 'zhihu',
    type: 'publish',
    time: '20:00',
    title: '知乎选问题作答 + 同步专栏',
    note: '问答体先干货后身份；不放 URL，用品牌词「云栈工坊」；一个主题只答 1 个问题',
  },
  {
    offset: 4,
    platform: 'wechat',
    type: 'publish',
    time: '18:00',
    title: '公众号精排版发布',
    note: '阅读原文挂具体项目页；中性引导；先在微信内实测落地页可打开',
  },
  {
    offset: 6,
    platform: 'other',
    type: 'review',
    title: '数据复盘 + 轻互动',
    note: '看阅读、点赞、收藏、引流点击；掘金沸点 / CSDN 动态轻互动；定下一篇选题',
  },
];

// 给定日期所在周的周一
export const mondayOf = (key: string): string => {
  const d = parseKey(key);
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  return dateKey(d);
};

export const addDays = (key: string, days: number): string => {
  const d = parseKey(key);
  d.setDate(d.getDate() + days);
  return dateKey(d);
};

export const WEEKDAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];