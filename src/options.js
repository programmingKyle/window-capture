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
    console.log(location);
    saveDirectoryText_el.textContent = location;
}