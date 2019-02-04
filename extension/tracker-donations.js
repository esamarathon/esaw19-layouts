'use strict';

// Referencing packages.
const request = require('request-promise').defaults({jar: true});

// Declaring other variables.
const nodecg = require('./utils/nodecg-api-context').get();
const apiURL = 'https://donations.esamarathon.com/search';
const refreshTime = 100000;
const donationsToRead = nodecg.Replicant('donationsToRead', {defaultValue: []});

// ID 9: Stream 1
// ID 10: Stream 2
var eventID = 9;
if (nodecg.bundleConfig.stream2)
	eventID = 10;

// Get the donations still to be read from the API.
updateToReadDonations();
function updateToReadDonations() {
	request({
		uri: `${apiURL}/?event=${eventID}&type=donation&feed=toread`,
		resolveWithFullResponse: true,
		json: true
	}).then(resp => {
		var currentDonations = processToReadDonations(resp.body);
		donationsToRead.value = currentDonations;
		setTimeout(updateToReadDonations, refreshTime);
	}).catch(err => {
		nodecg.log.warn('Error updating to read donations:', err);
		setTimeout(updateToReadDonations, refreshTime);
	});
}

function processToReadDonations(donations) {
	var donationsArray = [];

	donations.forEach(donation => {
		donationsArray.push({
			id: donation.pk,
			name: donation.fields.donor__public,
			amount: parseFloat(donation.fields.amount),
			comment: (donation.fields.commentstate === 'APPROVED') ? donation.fields.comment : '',
			timestamp: donation.fields.timereceived
		});
	});

	// Sort by earliest first.
	donationsArray.sort((a, b) => {
		if (a.timestamp < b.timestamp)
			return -1;
		if (a.timestamp > b.timestamp)
			return 1;
		
		// a must be equal to b
		return 0;
	});

	return donationsArray;
}