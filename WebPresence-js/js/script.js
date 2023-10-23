const Type = {
	YouTube: 'YouTube',
	YTMusic: 'YouTube Music',
	SoundCloud: 'SoundCloud',
	Twitch: 'Twitch',
	Allen: 'Allen\'s Library'
}

const State = {
	Play: 0,
	Pause: 1,
	Search: 2
}

const getType = () => {
	const url = window.location.href.toLowerCase();
	if (url.includes('music.youtube.com')) {
		return Type.YTMusic;
	} else if (url.includes('youtube.com')) {
		return Type.YouTube;
	} else if (url.includes('soundcloud.com')) {
		return Type.SoundCloud;
	} else if (url.includes('twitch.tv')) {
		return Type.Twitch;
	} else if (url.includes('allenslibrary.com')) {
		return Type.Allen;
	}

	return -1;
}

const mediaInfo = (type) => {
	if (navigator.mediaSession.playbackState === 'none' || !navigator.mediaSession.metadata) {
		return {
			details: '탐색 중',
			state: '',
			largeImage: 'logo',
			smallImage: 'search',
			mediaState: State.Search
		}
	}

	let timePlayed, playbackTime;
	switch (type) {
		case Type.YouTube:
		case Type.YTMusic:
			const player = document.getElementById("movie_player");
			timePlayed = player ? Math.trunc(player.getCurrentTime() * 1000) : 0;
			playbackTime = player ? Math.trunc(player.getDuration() * 1000) : 0;
			break;
		case Type.SoundCloud:
			timePlayed = 0; // TODO: Add SoundCloud support
			playbackTime = 0;
			break;
	}

	return {
		details: navigator.mediaSession.metadata.title,
		state: navigator.mediaSession.metadata.album === '' ? navigator.mediaSession.metadata.artist : `[${navigator.mediaSession.metadata.artist}] ${navigator.mediaSession.metadata.album}`,
		largeImage: navigator.mediaSession.metadata.artwork[0].src.split('?')[0],
		smallImage: navigator.mediaSession.playbackState === 'playing' ? 'play' : 'pause',

		mediaState: navigator.mediaSession.playbackState === 'playing' ? State.Play : State.Pause,
		timePlayed: timePlayed,
		playbackTime: playbackTime,
	}
}

const twitchInfo = () => {
	if (!document.querySelector('div.channel-info-content h1')
	|| !document.querySelector('div.channel-info-content h2')
	|| !document.querySelector('div.channel-info-content a')
	|| !document.querySelector('div.player-controls button')) {
		return {
			details: '탐색 중',
			state: '',
			largeImage: 'logo',
			smallImage: 'search'
		}
	}

	return {
		details: document.querySelector('div.channel-info-content h2').innerText,
		state: document.querySelector('div.channel-info-content h1').innerText,
		//largeImage: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${document.querySelector('div.channel-info-content a').href.split('/').at(-1)}-1920x1080.png`,
		largeImage: document.querySelector('.channel-root__info .tw-image-avatar').src.replace('70x70.', '600x600.'),
		smallImage: document.querySelector('div.player-controls button').getAttribute('data-a-player-state') === 'playing' ? 'play' : 'pause'
	}
}

const allenInfo = () => {
	const url = window.location.href.toLowerCase();
	const subject = url.split('/')[3];

	let details = '공부하는 중', state = '', smallImage = 'study';
	switch (subject) {
		case 'study':
			const subjectType = url.split('/')[4];
			switch (subjectType) {
				case 'chapter':
					details = '문제풀이 중';
					state = document.evaluate('//*[@id="page-container"]/div[1]/div/div[1]/p/text()', document, null, XPathResult.STRING_TYPE, null).stringValue;
					break;
				case 'theory':
					details = '이론학습 중';
					state = document.evaluate('//*[@id="__next"]/div[1]/header/div/div[1]/p[2]/text()', document, null, XPathResult.STRING_TYPE, null).stringValue;
					break;
			}
			//smallImage = 'study';
			break;
		case 'exam':
			details = '시험보는 중'
			//smallImage = 'exam';
			break;
		case 'mynote':
			details = '노트정리 중'
			//smallImage = 'note';
			break;
		case 'community':
			details = '커뮤니티 중'
			//smallImage = 'forum';
			break;
	}
	
	return {
		details: details,
		state: state,
		largeImage: 'logo',
		smallImage: smallImage
	}
}

window.addEventListener('beforeunload', () => {
	let event = new CustomEvent("WebPresence", { detail: {
		live: false,
		activity: getType()
	}});
	window.dispatchEvent(event);
});

const loop = () => {
	let data;
	const type = getType();
	switch (type) {
		case Type.YouTube:
		case Type.YTMusic:
		case Type.SoundCloud:
			data = mediaInfo(type);
			break;
		case Type.Twitch:
			data = twitchInfo();
			break;
		case Type.Allen:
			data = allenInfo();
			break;
	}

	let event = new CustomEvent("WebPresence", { detail: {
		live: true,
		activity: type,
		...data
	}});
	window.dispatchEvent(event);

	setTimeout(loop, 1000);
}
setTimeout(loop, 1000);