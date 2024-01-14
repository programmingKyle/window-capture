const contentDiv_el = document.getElementById('contentDiv');

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
		contentItemDiv_el.onclick = () => {
      console.log(source.id);
		};
		contentDiv_el.append(contentItemDiv_el);
	});
}