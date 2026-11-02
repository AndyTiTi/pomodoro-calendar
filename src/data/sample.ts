import type { ITask } from './types';

// 示例数据（可整体删除）：以 2026-11-02 周一为 D0 的一篇技术长文分发节奏
export const SAMPLE_TASKS: ITask[] = [
  { id: '1', title: '官网首发：Next.js 渲染模式长文', date: '2026-11-02', time: '10:00', platform: 'official', type: 'publish', done: true },
  { id: '2', title: '掘金发布（技术社区版）', date: '2026-11-03', time: '11:00', platform: 'juejin', type: 'publish', done: false },
  { id: '3', title: 'CSDN 发布（再改写版）', date: '2026-11-04', time: '14:00', platform: 'csdn', type: 'publish', done: false },
  { id: '4', title: '知乎选问题作答 + 同步专栏', date: '2026-11-05', time: '20:00', platform: 'zhihu', type: 'publish', done: false },
  { id: '5', title: '公众号精排版，阅读原文挂项目页', date: '2026-11-06', time: '18:00', platform: 'wechat', type: 'publish', done: false },
  { id: '6', title: '数据复盘 + 下一篇选题', date: '2026-11-08', platform: 'other', type: 'review', done: false },
];
