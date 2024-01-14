const { app, BrowserWindow, ipcMain, desktopCapturer, nativeImage, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const IS_OSX = process.platform === 'darwin';

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
      nodeIntegration: true,
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

ipcMain.handle('open-screen-security', () => util.openSystemPreferences('security', 'Privacy_ScreenCapture'));
ipcMain.handle('get-screen-access', () => !IS_OSX || systemPreferences.getMediaAccessStatus('screen') === 'granted');
ipcMain.handle('get-sources', async () => {
    return desktopCapturer.getSources({types: ['window', 'screen']}).then(async sources => {
        return sources.map(source => {
            source.thumbnailURL = source.thumbnail.toDataURL();
            return source;
        });
    });
});



ipcMain.handle('capture-screenshots', async (event, data) => {
  if (!data || !data.windowIds) {
    return;
  }

  console.log(data.windowIds);

  const screenshotsDirectory = path.join(__dirname, 'images');

  // Ensure the directory exists or create it
  if (!fs.existsSync(screenshotsDirectory)) {
    fs.mkdirSync(screenshotsDirectory);
  }

  // Iterate through each window id
  for (const windowId of data.windowIds) {
    try {
      // Get the display info for the screen containing the window
      const windowDisplay = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());

      // Capture the content of the window
      const sources = await desktopCapturer.getSources({
        types: ['window', 'screen'],
        thumbnailSize: {
          width: windowDisplay.workAreaSize.width,
          height: windowDisplay.workAreaSize.height,
        },
        fetchWindowIcons: true,
      });

      const windowSource = sources.find(source => source.id === windowId);
      if (!windowSource) {
        console.error(`Window with id ${windowId} not found.`);
        continue;
      }

      const image = nativeImage.createFromDataURL(windowSource.thumbnail.toDataURL());
      const imageBuffer = image.toPNG();

      // Sanitize windowId for filename
      const sanitizedWindowId = windowId.replace(/:/g, '_');
      const screenshotPath = path.join(screenshotsDirectory, `screenshot_${sanitizedWindowId}.png`);
      fs.writeFileSync(screenshotPath, imageBuffer);

      console.log(`Screenshot saved: ${screenshotPath}`);
    } catch (error) {
      console.error(`Error capturing screenshot for window ${windowId}:`, error.message);
    }
  }
});