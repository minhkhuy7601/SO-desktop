const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  printHTML: (htmlContent) => ipcRenderer.invoke('print-html', htmlContent),
  exitApp: () => ipcRenderer.send('exit-app'),
});
