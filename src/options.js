const backButton_el = document.getElementById('backButton');

backButton_el.addEventListener('click', async () => {
    await api.pageHandler({location: 'index'});
});