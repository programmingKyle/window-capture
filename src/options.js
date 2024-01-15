const backButton_el = document.getElementById('backButton');
const saveDirectoryText_el = document.getElementById('saveDirectoryText');
const selectFolderButton_el = document.getElementById('selectFolderButton');
const setDefaultButton_el = document.getElementById('setDefaultButton');

backButton_el.addEventListener('click', async () => {
    await api.pageHandler({location: 'index'});
});


document.addEventListener('DOMContentLoaded', async () => {
    await populateSavedDirectory();
});

async function populateSavedDirectory(){
    const location = await api.screenshotDirectoryHandler({request: 'getLocation'});
    saveDirectoryText_el.textContent = location;
}

selectFolderButton_el.addEventListener('click', async () => {
    const newLocation = await api.openSelectFolderDialog();
    await api.screenshotDirectoryHandler({request: 'setLocation', newLocation});
    saveDirectoryText_el.textContent = newLocation;
});

setDefaultButton_el.addEventListener('click', () => {

});