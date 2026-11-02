const { app, BrowserWindow, Tray, Menu, Notification, ipcMain, nativeImage } = require('electron');
const path = require('node:path');

const isDev = !app.isPackaged;
const DEV_URL = process.env.ELECTRON_DEV_URL || 'http://localhost:27890';

let mainWindow = null;
let tray = null;
let isQuitting = false;

function iconPath() {
  return isDev
    ? path.join(__dirname, '..', 'build', 'icon.png')
    : path.join(process.resourcesPath, 'icon.png');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 800,
    minWidth: 860,
    minHeight: 600,
    title: '桌面番茄日历',
    backgroundColor: '#faf7f2',
    autoHideMenuBar: true,
    icon: iconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL(DEV_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist-electron', 'renderer', 'index.html'));
  }

  // 关闭时最小化到托盘，保证番茄钟与发布提醒在后台继续运行
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  try {
    const image = nativeImage.createFromPath(iconPath()).resize({ width: 16, height: 16 });
    tray = new Tray(image);
    tray.setToolTip('桌面番茄日历');
    tray.setContextMenu(
      Menu.buildFromTemplate([
        { label: '打开主窗口', click: () => mainWindow && mainWindow.show() },
        { type: 'separator' },
        {
          label: '退出',
          click: () => {
            isQuitting = true;
            app.quit();
          },
        },
      ]),
    );
    tray.on('click', () => mainWindow && mainWindow.show());
  } catch {
    // 托盘创建失败不影响主窗口
  }
}

ipcMain.on('notify', (_event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body, icon: iconPath() }).show();
  }
});

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      mainWindow.show();
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    app.setAppUserModelId('com.yunzhanlab.pomodoro-calendar');
    createWindow();
    createTray();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('before-quit', () => {
    isQuitting = true;
  });

  app.on('window-all-closed', () => {
    // 托盘常驻，不随窗口关闭退出（macOS 惯例 likewise）
    if (process.platform !== 'darwin' && isQuitting) app.quit();
  });
}