// 通知封装：桌面端走 Electron 原生通知，浏览器走 Web Notification，均静默降级

interface ElectronBridge {
  isElectron: boolean;
  notify: (title: string, body: string) => void;
}

const bridge = (): ElectronBridge | undefined =>
  (window as Window & { electronAPI?: ElectronBridge }).electronAPI;

export const ensureNotifyPermission = async (): Promise<boolean> => {
  if (bridge()?.isElectron) return true;
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
};

export const sendNotification = (title: string, body: string): void => {
  try {
    const api = bridge();
    if (api?.isElectron) {
      api.notify(title, body);
      return;
    }
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  } catch {
    // 通知失败不影响主流程
  }
};