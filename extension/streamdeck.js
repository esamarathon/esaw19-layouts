// Script only tested if using 1 Stream Deck, probably would be funky if using 2+.

'use strict';

const nodecg = require('./utils/nodecg-api-context').get();
const obs = nodecg.extensions['nodecg-obs-util'];
const WebSocket = require('ws');
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

var port = nodecg.bundleConfig.streamdeck.port;
var sdWS;
var buttonLocations = {};
var twitchAdPlaying = false;

// Starting server.
server.listen(port, 'localhost', () => {
	//nodecg.log.info('Listening on port %s.', port);
});

// Listen to connections from the Stream Deck plugin, and listen for their data on connect.
io.on('connection', (socket) => {
	// Disconnect client if key supplied is incorrect.
	var key = socket.handshake.query.key;
	if (!key || key !== nodecg.bundleConfig.streamdeck.key) {
		socket.disconnect();
	}

	else {
		//nodecg.log.info('Stream Deck software connected on socket.io (ID: %s).', socket.id);
		socket.once('sdConnectSocket', data => {
			if (sdWS) sdWS.close(); // Close current connection if one is active.
			connectToWS(data);
		});
	}
});

// Triggered when we start running a Twitch ad.
nodecg.listenFor('twitchAdStarted', 'nodecg-speedcontrol', adInfo => setAdCountdown(adInfo.duration));

var adEnds = 0;
function setAdCountdown(duration) {
	twitchAdPlaying = true;
	adEnds = Date.now()+(duration*1000);
	updateAdCountdown();
}

// Updates the ad timer every second.
function updateAdCountdown() {
	const remainingAdTime = (adEnds-Date.now())/1000;

	if (remainingAdTime > 0) {
		const minutes = `${Math.floor(remainingAdTime/60)}`;
		const seconds = `${Math.floor(remainingAdTime-(minutes*60))}`;
		var countdownText = `${lpad(minutes, '00')}:${lpad(seconds, '00')}`;
		setTimeout(updateAdCountdown, 1000);

		// Find all Twitch ad buttons and update the timer on them.
		var buttons = findButtonsWithAction('com.esamarathon.streamdeck.twitchads');
		buttons.forEach(button => updateButtonText(button.context, `Twitch Ad\nPlaying:\n${countdownText}`));
	}

	else {
		// Reset back to default.
		var buttons = findButtonsWithAction('com.esamarathon.streamdeck.twitchads');
		buttons.forEach(button => updateButtonText(button.context, 'Play\nTwitch Ad'));
		twitchAdPlaying = false;
	}
}

function connectToWS(data) {
	sdWS = new WebSocket(`ws://localhost:${data.port}`);
	nodecg.log.info('Connecting to Stream Deck software.');

	sdWS.on('error', error => {
		nodecg.log.warn('Error occured on the Stream Deck software connection: ', error);
	});

	sdWS.once('open', () => {
		nodecg.log.info('Connection to Stream Deck software successful.');
		buttonLocations = {};
		sdWS.send(JSON.stringify({event: data.registerEvent, uuid: data.pluginUUID}));
	});

	sdWS.once('close', () => {
		nodecg.log.warn('Connection to Stream Deck software closed.');
	});

	sdWS.on('message', data => {
		// Some of the events that can be received are in the docs below, but I don't think this is all of them?
		// https://developer.elgato.com/documentation/stream-deck/sdk/events-received/
		//nodecg.log.info(data);
		data = JSON.parse(data);
		var event = data.event;
		var action = data.action;
		var context = data.context;
		var payload = data.payload || {};

		// Adjust our button locations cache when buttons are added/removed, and set defaults.
		if (event === 'willAppear') {
			var location = `${payload.coordinates.column},${payload.coordinates.row}`;
			buttonLocations[location] = {};
			buttonLocations[location].context = context;
			buttonLocations[location].action = action;

			if (action === 'com.esamarathon.streamdeck.twitchads') updateButtonText(context, 'Play\nTwitch Ad');
		}
		else if (event === 'willDisappear') {
			var location = `${payload.coordinates.column},${payload.coordinates.row}`;
			delete buttonLocations[location];
		}

		// UNTESTED, I DO NOT HAVE THE HARDWARE
		if (event === 'keyUp') {
			if (action === 'com.esamarathon.streamdeck.twitchads' && !twitchAdPlaying) obs.send('SetCurrentScene', {'scene-name': 'Intermission (ads)'});
		}
	});
}

// Update button by it's context to a string.
function updateButtonText(context, text) {
	sdWS.send(JSON.stringify({
		event: 'setTitle',
		context: context,
		payload: {
			title: text
		}
	}));
}

// Supply an action, get an array with those buttons.
// Mostly used for getting the button's "context" to edit stuff.
function findButtonsWithAction(action) {
	var buttons = [];
	Object.keys(buttonLocations).forEach(location => {
		if (buttonLocations[location].action === action)
			buttons.push(buttonLocations[location]);
	});
	return buttons;
}

// For padding strings, mostly numbers for timing formats.
function lpad(str, format) {
	if (format.length > str.length)
		return format.slice(0, format.length-str.length)+str;
	else return str;
}