// Sets this Twitch extension to the same as the FFZ featured buttons when a token is supplied in the config.
// https://www.twitch.tv/ext/3zorofke3r7bu8pd0mb7s86qtfrgzj

'use strict';

// Referencing packages.
var request = require('request');

// Declaring other variables.
var nodecg = require('./utils/nodecg-api-context').get();

if (!nodecg.bundleConfig.twitchExt || !nodecg.bundleConfig.twitchExt.token)
	return;

nodecg.listenFor('updateFFZFollowing', 'nodecg-speedcontrol', setButtons);

function setButtons(usernames) {
	var usernamesString = usernames.join(',');
	if (!usernames.length) usernamesString = '';
	nodecg.log.info('Attempting to update Twitch extension "Featured Channels" information.');
	request(`https://api.furious.pro/featuredchannels/bot/${nodecg.bundleConfig.twitchExt.token}/${usernamesString}`, (err, resp, body) => {
		if (!err && resp.statusCode === 200)
			nodecg.log.info('Successfully updated Twitch extension "Featured Channels" information.');
		else
			nodecg.log.warn('Error updating Twitch extension "Featured Channels" information.');
	});
}