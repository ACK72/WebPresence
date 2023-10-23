#![allow(non_snake_case)]
mod ids;

use ids::{
	DISCORD_APP_ID_YOUTUBE,
	DISCORD_APP_ID_YTMUSIC,
	DISCORD_APP_ID_SOUNDCLOUD,
	DISCORD_APP_ID_TWITCH,
	DISCORD_APP_ID_ALLEN
};
use std::{io, thread, process, sync::mpsc::channel, time::Duration};
use chrome_native_messaging::read_input;
use discord_rich_presence::{activity::{Activity, Assets, Timestamps}, DiscordIpc, DiscordIpcClient};

fn main() {
	let (tx, rx) = channel();
	thread::spawn(move || {
		loop {
			match rx.recv_timeout(Duration::from_secs(3)) {
				Ok(_) => continue,
				Err(_) => process::exit(0)
			}
		}
	});

	let mut lastData = None;
	let mut lastActivity = String::new();
	let mut discord = DiscordIpcClient::new(DISCORD_APP_ID_YOUTUBE).unwrap();
	discord.connect().unwrap();

	loop {
		let input = read_input(io::stdin()).unwrap();
		let data = input.as_object().unwrap();

		tx.send(0).unwrap();

		match lastData {
			Some(ref lastData) => {
				if lastData == data {
					continue;
				}
			},
			None => {}
		}

		let activity = data.get("activity").unwrap().as_str().unwrap();
		let state = data.get("state").unwrap().as_str().unwrap();
		let details = data.get("details").unwrap().as_str().unwrap();

		let largeImage = data.get("largeImage").unwrap().as_str().unwrap();
		let smallImage = data.get("smallImage").unwrap().as_str().unwrap();

		let startTimeStamp = data.get("startTimeStamp").unwrap().as_i64().unwrap();
		let endTimeStamp = data.get("endTimeStamp").unwrap().as_i64().unwrap();

		let mut payload = Activity::new();
		if !state.is_empty() { payload = payload.state(state); }
		if !details.is_empty() { payload = payload.details(details); }

		let mut assets = Assets::new();
		if !largeImage.is_empty() { assets = assets.large_image(largeImage); }
		if !smallImage.is_empty() { assets = assets.small_image(smallImage); }
		payload = payload.assets(assets);

		let mut timestamps = Timestamps::new();
		if startTimeStamp != -1 { timestamps = timestamps.start(startTimeStamp); }
		if endTimeStamp != -1 { timestamps = timestamps.end(endTimeStamp); }
		payload = payload.timestamps(timestamps);

		if lastActivity != activity.to_string() {
			discord.close().unwrap();

			discord = match activity {
				"YouTube" => DiscordIpcClient::new(DISCORD_APP_ID_YOUTUBE).unwrap(),
				"YouTube Music" => DiscordIpcClient::new(DISCORD_APP_ID_YTMUSIC).unwrap(),
				"SoundCloud" => DiscordIpcClient::new(DISCORD_APP_ID_SOUNDCLOUD).unwrap(),
				"Twitch" => DiscordIpcClient::new(DISCORD_APP_ID_TWITCH).unwrap(),
				"Allen's Library" => DiscordIpcClient::new(DISCORD_APP_ID_ALLEN).unwrap(),
				_ => DiscordIpcClient::new(DISCORD_APP_ID_YOUTUBE).unwrap()
			};
			discord.connect().unwrap();

			lastActivity = activity.to_string();
		}

		discord.set_activity(payload).unwrap();
		lastData = Some(data.clone());
	}
}