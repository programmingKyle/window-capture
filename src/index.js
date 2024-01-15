const { app, BrowserWindow, ipcMain, desktopCapturer, nativeImage, screen, shell } = require('electron');
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
  initialLaunch();
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
function initialLaunch() {
  const screenshotsDirectory = path.join(__dirname, 'images');

  if (!fs.existsSync(screenshotsDirectory)) {
    fs.mkdirSync(screenshotsDirectory);
  }

  const optionsJSON = path.join(__dirname, 'options.json');
  if (fs.existsSync(optionsJSON)) {
    console.log(`${optionsJSON} already exists.`);
    return;
  }
  const options = {
    ScreenshotDirectory: screenshotsDirectory
  };

  const optionsJson = JSON.stringify(options, null, 2);

  try {
    fs.writeFileSync(optionsJSON, optionsJson);
    console.log(`${optionsJSON} created with default options.`);
  } catch (error) {
    console.error(`Error creating ${optionsJSON}: ${error.message}`);
  }
}

function getScreenshotLocation() {
  const optionsJSON = path.join(__dirname, 'options.json');

  try {
    const optionsContent = fs.readFileSync(optionsJSON, 'utf-8');
    const options = JSON.parse(optionsContent);
    return options.ScreenshotDirectory;
  } catch (error) {
    console.error(`Error reading options.json: ${error.message}`);
    return null;
  }
}

ipcMain.handle('screenshot-directory-handler', async (event, data) => {
  if (!data || !data.request) return null;

  switch(data.request) {
    case 'getLocation':
      const location = getScreenshotLocation();
      return location;
    default:
      return null;
  }
});

ipcMain.handle('open-screen-security', () => util.openSystemPreferences('security', 'Privacy_ScreenCapture'));
ipcMain.handle('get-screen-access', () => !IS_OSX || systemPreferences.getMediaAccessStatus('screen') === 'granted');
ipcMain.handle('get-sources', async () => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
      thumbnailSize: {
        width: 320, // Adjust as needed
        height: 180, // Adjust as needed
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

  const screenshotsDirectory = getScreenshotLocation();

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


ipcMain.handle('open-screenshot-folder', (event, data) => {
  if (!data) return;
  let absolutePath;

  if (data.path === ''){
    const appPath = app.getAppPath();
    absolutePath = path.join(appPath, 'src', 'images');
  } else {
    absolutePath = data.path;
  }

  shell.openPath(absolutePath);
});


ipcMain.handle('page-handler', (req, data) => {
  if (!data || !data.location) return;
  const htmlFilePath = path.join(__dirname, `${data.location}.html`);
  mainWindow.loadFile(htmlFilePath);

});