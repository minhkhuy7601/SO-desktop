const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  printHTML: (htmlContent) => ipcRenderer.send('print-html', htmlContent),
});
