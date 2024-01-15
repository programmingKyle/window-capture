const backButton_el = document.getElementById('backButton');
const saveDirectoryText_el = document.getElementById('saveDirectoryText');
const selectFolderButton_el = document.getElementById('selectFolderButton');
const setDefaultButton_el = document.getElementById('setDefaultButton');

let currentSaveDirectory;

backButton_el.addEventListener('click', async () => {
    await api.pageHandler({location: 'index'});
});


document.addEventListener('DOMContentLoaded', async () => {
    await populateSavedDirectory();
});

async function populateSavedDirectory(){
    currentSaveDirectory = await api.screenshotDirectoryHandler({request: 'getLocation'});
    saveDirectoryText_el.textContent = currentSaveDirectory;
}

selectFolderButton_el.addEventListener('click', async () => {
    const newLocation = await api.openSelectFolderDialog();
    if (newLocation !== null){
        await api.screenshotDirectoryHandler({request: 'setLocation', newLocation});
        saveDirectoryText_el.textContent = newLocation;    
    } else {
        saveDirectoryText_el.textContent = currentSaveDirectory;
    }
});

setDefaultButton_el.addEventListener('click', async () => {
    const location = await api.screenshotDirectoryHandler({request: 'defaultLocation'});
    saveDirectoryText_el.textContent = location;
});