'use strict';

const nodecg = require('./utils/nodecg-api-context').get();
const WebSocket = require('ws');
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

var port = 1235;
var sdWS;

// Starting server.
server.listen(port, () => {
	//nodecg.log.info('Listening on port %s.', port);
});

// Listen to connections from the Stream Deck plugin, and listen for their data on connect.
io.on('connection', (socket) => {
	//nodecg.log.info('Stream Deck software connected on socket.io (ID: %s).', socket.id);
	socket.once('sdConnectSocket', data => {
		if (sdWS) sdWS.close();
		connectToWS(data);
	});
});

function connectToWS(data) {
	sdWS = new WebSocket(`ws://localhost:${data.port}`);
	nodecg.log.info('Connecting to Stream Deck software.');

	sdWS.on('error', error => {
		nodecg.log.warn('Error occured on the Stream Deck software connection: ', error);
	});

	sdWS.once('open', () => {
		nodecg.log.info('Connection to Stream Deck software successful.');
		sdWS.send(JSON.stringify({event: data.registerEvent, uuid: data.pluginUUID}));
	});

	sdWS.once('close', () => {
		nodecg.log.warn('Connection to Stream Deck software closed.');
	});

	sdWS.on('message', data => {
		// Some of the events that can be received are in the docs below, but I don't think this is all of them?
		// https://developer.elgato.com/documentation/stream-deck/sdk/events-received/
		//nodecg.log.info(data);
	});
}