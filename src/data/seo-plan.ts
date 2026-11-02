import type { ICalendarData } from './types';
import raw from '../../public/data/seo-plan-2026-11.json';

// 默认数据 = SEO 执行排期（2026-11），与 public/data 下的导入文件同源
export const SEO_PLAN = raw as unknown as ICalendarData;