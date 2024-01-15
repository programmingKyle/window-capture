const contentDiv_el = document.getElementById('contentDiv');

const selected = [];


document.addEventListener('DOMContentLoaded', () => {
  getDisplayMedia();
});

function getDisplayMedia() {
	if (api.isOSX()) {
		screenPickerOptions.system_preferences = true;
	}

	contentDiv_el.innerHTML = '<h3 style="grid-column: span 2">Populating... </h3>';

	return new Promise(async (resolve, reject) => {
		let has_access = await api.getScreenAccess();
		if (!has_access) {
			return reject('none');
		}

		try {
			const sources = await api.getScreenSources();
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

		const detials = {
			id: source.id,
			name: source.name,
		}

		handleContentClick(contentItemDiv_el, itemImage_el, detials);

	});
}

function handleContentClick(item, image, detials){
  item.addEventListener('click', () => {
    if (image.classList.contains('select')) {
      image.classList.remove('select');
      removeIDFromArray(detials);
    } else {
      image.classList.add('select');
      selected.push(detials);
    }
  });
}

function removeIDFromArray(id){
  const index = selected.indexOf(id);
  if (index !== -1) {
    selected.splice(index, 1);
  }
}

function clearSelection() {
  const selectedImages = document.querySelectorAll('.window-content-item img.select');
  selectedImages.forEach(image => {
    image.classList.remove('select');
  });
}