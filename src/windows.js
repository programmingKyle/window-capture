const contentDiv_el = document.getElementById('contentDiv');

const selected = [];


document.addEventListener('DOMContentLoaded', () => {
  getDisplayMedia();
});

function getDisplayMedia() {
	if (api.isOSX()) {
		screenPickerOptions.system_preferences = true;
	}

	return new Promise(async (resolve, reject) => {
		let has_access = await api.getScreenAccess();
		if (!has_access) {
			return reject('none');
		}

		try {
			const sources = await api.getScreenSources();
      console.log(sources);
			populateAvailableWindows(sources, async (id) => {
				try {
					const source = sources.find(source => source.id === id);
					if (!source) {
						return reject('none');
					}

					const stream = await window.navigator.mediaDevices.getUserMedia({
						audio: false,
						video: {
							mandatory: {
								chromeMediaSource: 'desktop',
								chromeMediaSourceId: source.id
							}
						}
					});
					resolve(stream);
				}
				catch (err) {
					reject(err);
				}
			}, {});
		}
		catch (err) {
			reject(err);
		}
	});
}


function populateAvailableWindows(sources) {
	contentDiv_el.innerHTML = '';

	sources.forEach(source => {
    console.log(source.id);
    if (source.thumbnailURL === 'data:image/png;base64,') return; // If there is no screenshot move on
    
    const contentItemDiv_el = document.createElement('div');
    contentItemDiv_el.classList = 'window-content-item';

    const itemImage_el = document.createElement('img');
		itemImage_el.src = source.thumbnailURL;
    const itemHeader_el = document.createElement('h6');
    itemHeader_el.innerText = source.name;


		contentItemDiv_el.append(itemImage_el);
		contentItemDiv_el.append(itemHeader_el);
		contentDiv_el.append(contentItemDiv_el);

    handleContentClick(contentItemDiv_el, itemImage_el, source.id);

	});
}

function handleContentClick(item, image, id){
  item.addEventListener('click', () => {
    if (image.classList.contains('select')) {
      image.classList.remove('select');
      removeIDFromArray(id);
    } else {
      image.classList.add('select');
      selected.push(id);
      console.log(selected);
    }
  });
}

function removeIDFromArray(id){
  const index = selected.indexOf(id);
  if (index !== -1) {
    selected.splice(index, 1);
    console.log(selected);
  }
}