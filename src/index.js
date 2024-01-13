const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron');
const path = require('path');

let mainWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 450,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////

ipcMain.handle('get-open-windows', async () => {
  try {
    // Get sources using desktopCapturer
    const sources = await desktopCapturer.getSources({ types: ['window', 'screen'] });
    // Filter out sources with the same name as your application (excluding duplicates)
    const filteredSources = sources.filter((source, index, self) => {
      return source.name !== 'window-capture' || index === self.findIndex(s => s.name === 'window-capture');
    });
    return filteredSources;
  } catch (error) {
    console.error('Error getting screen sources:', error.message);
    return [];
  }
});
