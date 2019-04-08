'use strict';

// Referencing packages.
const request = require('request-promise').defaults({jar: true});
const moment = require('moment');

// Declaring other variables.
const nodecg = require('./utils/nodecg-api-context').get();
const apiURL = 'https://donations.esamarathon.com/search';
const refreshTime = 60000; // Get prizes every 1m.

// Replicants.
const prizes = nodecg.Replicant('prizes', {defaultValue: []});

// Get the prizes from the API.
updatePrizes();
function updatePrizes() {
	request({
		uri: `${apiURL}/?event=12&type=prize&state=ACCEPTED`,
		resolveWithFullResponse: true,
		json: true
	}).then(resp => {
		var currentPrizes = processRawPrizes(resp.body);
		prizes.value = currentPrizes;
		setTimeout(updatePrizes, refreshTime);
	}).catch(err => {
		nodecg.log.warn('Error updating prizes:', err);
		setTimeout(updatePrizes, refreshTime);
	});
}

// Processes the response from the API above.
function processRawPrizes(prizes) {
	var prizesArray = [];
	
	prizes.forEach(prize => {
		var formattedPrize = {
			id: prize.pk,
			name: prize.fields.name,
			provided: prize.fields.provider || 'Anonymous',
			minimum_bid: parseFloat(prize.fields.minimumbid),
			image: prize.fields.image
		};
		
		// If there's a start run, use it's starting time.
		if (prize.fields.startrun)
			formattedPrize.start_timestamp = prize.fields.startrun__starttime;
		else if (prize.fields.starttime)
			formattedPrize.start_timestamp = prize.fields.starttime;
		else
			formattedPrize.start_timestamp = null;
		
		// If there's an ending run, use it's end time.
		if (prize.fields.endrun)
			formattedPrize.end_timestamp = prize.fields.endrun__endtime;
		else if (prize.fields.endtime)
			formattedPrize.end_timestamp = prize.fields.endtime;
		else
			formattedPrize.end_timestamp = null;
		
		var currentTimestamp = moment().unix();
		var startTimestamp = moment(formattedPrize.start_timestamp).unix();
		var endTimestamp = moment(formattedPrize.end_timestamp).unix();
		
		// Prize not applicable right now, so don't add it.
		if (currentTimestamp < startTimestamp || currentTimestamp > endTimestamp)
			return;
		
		prizesArray.push(formattedPrize);
	});
	
	return prizesArray;
}