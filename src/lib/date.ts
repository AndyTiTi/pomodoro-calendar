// 日期辅助函数，统一用本地时区，输出 YYYY-MM-DD

const pad = (n: number): string => String(n).padStart(2, '0');

export const dateKey = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const todayKey = (): string => dateKey(new Date());

export const parseKey = (key: string): Date => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const monthLabel = (year: number, month: number): string =>
  `${year} 年 ${month + 1} 月`;

// 月历网格：周一为一周起点，返回 6 行 × 7 列共 42 个日期
export interface IMonthCell {
  date: Date;
  key: string;
  inMonth: boolean;
}

export const getMonthGrid = (year: number, month: number): IMonthCell[] => {
  const first = new Date(year, month, 1);
  // getDay: 0=周日 … 6=周六；转为周一起点的偏移
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - offset);
  const cells: IMonthCell[] = [];
  for (let i = 0; i < 42; i += 1) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    cells.push({ date: d, key: dateKey(d), inMonth: d.getMonth() === month });
  }
  return cells;
};

export const WEEK_HEADERS = ['一', '二', '三', '四', '五', '六', '日'];
