const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getOpenWindows: () => ipcRenderer.invoke('get-open-windows'),

    isOSX: () => process.platform === 'darwin',
    isWindows: () => process.platform === 'win32',
    isLinux: () => /linux/.test(process.platform),
    openScreenSecurity: () => ipcRenderer.invoke('open-screen-security'),
    getScreenAccess: () => ipcRenderer.invoke('get-screen-access'),
    getScreenSources: () => ipcRenderer.invoke('get-sources'),

    captureScreenshots: (data) => ipcRenderer.invoke('capture-screenshots', data),
    openScreenshotFolder: (data) => ipcRenderer.invoke('open-screenshot-folder', data),
});