const Type = {
	YouTube: 'YouTube',
	YTMusic: 'YouTube Music',
	SoundCloud: 'SoundCloud',
	Twitch: 'Twitch',
	Allen: 'Allen'
}

const State = {
	Play: 0,
	Pause: 1,
	Search: 2
}

let invert = false; // TODO: Add option to invert
const infos = {}
const getLastActiveTime = (data) => {
	const current = new Date().getTime();
	for (const key in infos) {
		if (current - infos[key].updated > 3000) {
			delete infos[key];
		}
	}

	if (!(data.activity in infos)) {
		infos[data.activity] = {
			created: current
		};
	}
	infos[data.activity].updated = current;
	infos[data.activity].live = data.live;

	if (!data.live) {
		return { update: false };
	}

	const last = infos[data.activity].created;
	for (const key in infos) {
		if (infos[key].live && infos[key].created > last) {
			return { update: false };
		}
	}

	switch (data.mediaState) {
		case State.Play:
			const timePlayed = current - data.timePlayed;
			if (!infos[data.activity].timePlayed || Math.abs(infos[data.activity].timePlayed - timePlayed) > 200) {
				infos[data.activity].timePlayed = current - data.timePlayed;
			}

			if (invert) {
				return {
					update: true,
					startTimeStamp: -1,
					endTimeStamp: infos[data.activity].timePlayed + data.playbackTime
				}
			}
			
			return {
				update: true,
				startTimeStamp: infos[data.activity].timePlayed,
				endTimeStamp: -1
			}
		case State.Pause:
			return {
				update: true,
				startTimeStamp: -1,
				endTimeStamp: -1
			}
		case State.Search:
		default:
			delete infos[data.activity].timePlayed;
			return {
				update: true,
				startTimeStamp: last,
				endTimeStamp: -1
			}
	}
}

let nativePort = undefined;
let isPortLive = false;
const getNativePort = () => {
	if (isPortLive === false) {
		isPortLive = true;
		nativePort = chrome.runtime.connectNative('ack72.webpresence');

		nativePort.onDisconnect.addListener((event) => {
			isPortLive = false;
		});
	}

	return nativePort;
}

const postMessage = (data) => {
	const nativePort = getNativePort();
	if (nativePort) {
		nativePort.postMessage(data);
	}
}

chrome.runtime.onMessage.addListener((message, _s, _c) => {
	const time = getLastActiveTime(message);

	if (time.update) {
		let data = {
			...time,
			...message
		};

		delete data.mediaState;
		delete data.timePlayed;
		delete data.playbackTime;

		postMessage(data);
	}
	return true;
});