const contentDiv_el = document.getElementById('contentDiv');

document.addEventListener('DOMContentLoaded', () => {
  populateContent();
});

async function populateContent() {
  try {
    // Await the asynchronous function before using the result
    const result = await api.getOpenWindows();

    result.forEach(element => {

      const contentItemDiv_el = document.createElement('div');
      contentItemDiv_el.classList = 'window-content-item';

      const itemImage_el = document.createElement('img');
      const itemHeader_el = document.createElement('h6');

      // Check if element.thumbnail is a NativeImage object
      if (element.thumbnail && typeof element.thumbnail.toDataURL === 'function') {
        // Convert NativeImage to Base64-encoded image
        const imageData = element.thumbnail.toDataURL();
        console.log('Base64-encoded image data:', imageData);
        itemImage_el.src = imageData;
      } else {
        console.warn('Invalid image representation:', element.thumbnail);
      }

      // Set header text
      itemHeader_el.innerText = element.name;

      contentItemDiv_el.append(itemImage_el);
      contentItemDiv_el.append(itemHeader_el);

      contentDiv_el.append(contentItemDiv_el);
    });
  } catch (error) {
    console.error('Error populating content:', error.message);
  }
}

