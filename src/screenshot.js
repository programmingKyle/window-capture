const screenshotButton_el = document.getElementById('screenshotButton');
const openScreenshotFolder_el = document.getElementById('openScreenshotFolder');

screenshotButton_el.addEventListener('click', async () => {
    await api.captureScreenshots({detials: selected});
    selected.length = 0;
    clearSelection();
});

openScreenshotFolder_el.addEventListener('click', async () => {
    await api.openScreenshotFolder({path: ''});
});