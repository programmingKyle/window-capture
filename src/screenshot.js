const screenshotButton_el = document.getElementById('screenshotButton');

screenshotButton_el.addEventListener('click', async () => {
    await api.captureScreenshots({detials: selected});
    selected.length = 0;
    clearSelection();
});

