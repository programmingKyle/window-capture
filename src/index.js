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
  try {
    const sources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
      thumbnailSize: {
        width: 1920, // Set the desired width
        height: 1080, // Set the desired height
      },
    });

    return sources.map(source => {
      source.thumbnailURL = source.thumbnail.toDataURL();
      return source;
    });
  } catch (error) {
    console.error('Error getting sources:', error.message);
    return [];
  }
});



ipcMain.handle('capture-screenshots', async (event, data) => {
  if (!data || !data.detials) {
    return;
  }

  const screenshotsDirectory = path.join(__dirname, 'images');

  // Ensure the directory exists or create it
  if (!fs.existsSync(screenshotsDirectory)) {
    fs.mkdirSync(screenshotsDirectory);
  }

  // Iterate through each window id
  for (const windowId of data.detials) {
    const id = windowId.id;
    const name = windowId.name;

    try {
      // Get the display info for the screen containing the window
      const windowDisplay = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());

      // Capture the content of the window
      const sources = await desktopCapturer.getSources({
        types: ['window', 'screen'],
        thumbnailSize: {
          width: 1920, // Set the desired width
          height: 1080, // Set the desired height
        },
        fetchWindowIcons: true,
      });

      const windowSource = sources.find(source => source.id === id);
      if (!windowSource) {
        console.error(`Window with id ${id} not found.`);
        continue;
      }

      const image = nativeImage.createFromDataURL(windowSource.thumbnail.toDataURL());
      const imageBuffer = image.toPNG();

      // Sanitize windowId for filename
      const sanitizedWindowId = id.replace(/:/g, '_');

      // Find an available filename
      const availableFilename = findAvailableFilename(path.join(screenshotsDirectory, `${name}_${sanitizedWindowId}`), 'png');

      const screenshotPath = availableFilename; // Don't join again with screenshotsDirectory
      fs.writeFileSync(screenshotPath, imageBuffer);

      captureScreenshot();

    } catch (error) {
      console.error(`Error capturing screenshot for window ${windowId}:`, error.message);
    }
  }
});

// Function to find a non-existing filename by appending a counter
function findAvailableFilename(basePath, extension) {
  let counter = 1;
  let fileName = `${basePath}.${extension}`;

  while (fs.existsSync(fileName)) {
    fileName = `${basePath} (${counter}).${extension}`;
    counter++;
  }

  return fileName;
}
