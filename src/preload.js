const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getOpenWindows: () => ipcRenderer.invoke('get-open-windows'),
    captureScreenshot: (data) => ipcRenderer.invoke('capture-screenshot', data),
});