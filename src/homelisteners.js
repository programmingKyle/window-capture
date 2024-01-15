const screenshotButton_el = document.getElementById('screenshotButton');
const openScreenshotFolder_el = document.getElementById('openScreenshotFolder');
const optionsButton_el = document.getElementById('optionsButton');
const refreshButton_el = document.getElementById('refreshButton');

screenshotButton_el.addEventListener('click', async () => {
    await api.captureScreenshots({detials: selected});
    selected.length = 0;
    clearSelection();
});

openScreenshotFolder_el.addEventListener('click', async () => {
    const location = await api.screenshotDirectoryHandler({request: 'getLocation'});
    await api.openScreenshotFolder({path: location});
});

optionsButton_el.addEventListener('click', async () => {
    await api.pageHandler({location: 'options'});
});

refreshButton_el.addEventListener('click', async () => {
    getDisplayMedia();
});