'use strict';

// Referencing packages.
var request = require('request');

// Declaring other variables.
var nodecg = require('./utils/nodecg-api-context').get();
var refreshTime = 1800000; // Get emotes every 30m.
var twitchURL = 'https://twitchemotes.com/api_cache/v3/global.json';

// Replicants.
var emotes = nodecg.Replicant('emotes', {defaultValue: {}});

updateEmotes();
function updateEmotes() {
	getTwitchEmotes();
	setTimeout(updateEmotes, refreshTime);
}

// Get Twitch global emoticons.
function getTwitchEmotes(callback) {
	request(twitchURL, (err, resp, body) => {
		if (!err && resp.statusCode === 200) {
			var twitchEmotes = JSON.parse(body);
			emotes.value = twitchEmotes;
		}
		else
			nodecg.log.warn('Error updating Twitch emoticons: ', err);
		
		if (callback) callback();
	});
}