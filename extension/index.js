'use strict';

const nodecgAPIContext = require('./utils/nodecg-api-context');
module.exports = function(nodecg) {
	// Store a reference to this NodeCG API context in a place where other libs can easily access it.
	// This must be done before any other files are `require`d.
	nodecgAPIContext.set(nodecg);

	// Initalising some replicants.
	// Doing this in an extension so we don't need to declare the options everywhere else.
	nodecg.Replicant('ttsVoices', {defaultValue: []});
	nodecg.Replicant('ttsChosenVoice');
	nodecg.Replicant('donationsToRead', {defaultValue: []});
	const ttsGraphicOpen = nodecg.Replicant('ttsGraphicOpen', {defaultValue: false});

	// Other extension files we need to load.
	require('./layouts');
	require('./emotes');
	require('./tracker');
	require('./music');
	require('./streamdeck');
	require('./srcom-data');

	// Using an internal NodeCG lib to find out when the tts-donations.html graphic is opened.
	const registration = require('../../../lib/graphics/registration');
	registration.on('graphicAvailable', path => {
		if (path.includes('graphics/tts-donations.html')) ttsGraphicOpen.value = false;
	});
	registration.on('graphicOccupied', path => {
		if (path.includes('graphics/tts-donations.html')) ttsGraphicOpen.value = true;
	});

	nodecg.listenFor('loadURL', loadURL);
}

// Simple function to load a URL to get around browser restrictions.
function loadURL(url, callback) {
	require('request')(url, (err, resp, body) => {
		callback(err, resp, body);
	});
}