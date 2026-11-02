import { NS } from '@/data/constants';

// 带命名空间的 localStorage 封装，读写均包 try/catch，防止隐私模式白屏
export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(`${NS}:${key}`);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown): void {
    try {
      localStorage.setItem(`${NS}:${key}`, JSON.stringify(value));
    } catch {
      // 隐私模式 / 存储被禁用时静默降级
    }
  },
};
