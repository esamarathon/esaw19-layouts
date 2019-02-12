'use strict';

// Declaring other variables.
var nodecg = require('./utils/nodecg-api-context').get();
var app = require('express')();

// Play Sponsor Video
app.get('/api/playsponsorvideo', (req, res) => {
	nodecg.sendMessage('playSponsorVideo');
	res.status(200);
	res.end();
});

nodecg.mount(app);