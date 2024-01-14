const screenshotButton_el = document.getElementById('screenshotButton');

screenshotButton_el.addEventListener('click', async () => {
    await api.captureScreenshots({windowIds: selected});
    selected.length = 0;
    clearSelection();
});

