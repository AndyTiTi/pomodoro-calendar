const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  notify: (title, body) => ipcRenderer.send('notify', { title, body }),
});