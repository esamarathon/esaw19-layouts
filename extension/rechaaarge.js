'use strict';

const nodecg = require('./utils/nodecg-api-context').get();
const WebSocket = require('ws');
const donationTotal = nodecg.Replicant('rechaaargeDonationTotal', {defaultValue: 0});
var ws;

connect();
function connect() {
	if (ws) ws.close(); // Close current connection if one is active.

	ws = new WebSocket('wss://rechaaarge.com/obs_plugin/notifications_ws/');
	nodecg.log.info('Connecting to Rechaaarge WebSocket.');

	ws.on('error', error => {
		nodecg.log.warn('Error occured on the Rechaaarge WebSocket connection: ', error);
	});

	ws.once('open', () => {
		nodecg.log.info('Connection to Rechaaarge WebSocket successful.');
		ws.send(JSON.stringify({creator_name: 'esamarathon'}));
	});

	ws.once('close', (code) => {
		nodecg.log.warn('Connection to Rechaaarge WebSocket closed (%s).', code);
		setTimeout(connectToWS, 5000);
	});

	ws.on('message', data => onMessage(JSON.parse(data)));
}

function onMessage(data) {
	//if (data.empty) return;
	if (data['total_amount']) donationTotal.value = data['total_amount'];
}