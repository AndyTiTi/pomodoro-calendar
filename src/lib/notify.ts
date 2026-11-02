// 浏览器通知封装，权限不足或不支持时静默降级

export const ensureNotifyPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
};

export const sendNotification = (title: string, body: string): void => {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  } catch {
    // 通知失败不影响主流程
  }
};
