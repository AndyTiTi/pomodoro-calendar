// 通知封装：Tauri 桌面端走原生通知，浏览器走 Web Notification，均静默降级

// Tauri v2 运行时会注入 __TAURI_INTERNALS__
const isTauri = (): boolean =>
  typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export const ensureNotifyPermission = async (): Promise<boolean> => {
  if (isTauri()) {
    try {
      const { isPermissionGranted, requestPermission } = await import(
        '@tauri-apps/plugin-notification'
      );
      if (await isPermissionGranted()) return true;
      return (await requestPermission()) === 'granted';
    } catch {
      return false;
    }
  }
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
};

export const sendNotification = (title: string, body: string): void => {
  try {
    if (isTauri()) {
      void import('@tauri-apps/plugin-notification')
        .then(({ sendNotification: send }) => send({ title, body }))
        .catch(() => {
          // 通知失败不影响主流程
        });
      return;
    }
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  } catch {
    // 通知失败不影响主流程
  }
};
