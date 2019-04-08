'use strict';

// Referencing packages.
const request = require('request-promise').defaults({jar: true});

// Declaring other variables.
const nodecg = require('./utils/nodecg-api-context').get();
const apiURL = 'https://donations.esamarathon.com/search';
const apiEditURL = 'https://donations.esamarathon.com/edit';
const refreshTime = 10000; // 10 seconds
const donationsToRead = nodecg.Replicant('donationsToRead');
var updateTimeout;

var eventID = 12;

nodecg.listenFor('markDonationAsRead', markDonationAsRead);

// Get the donations still to be read from the API.
updateToReadDonations();
function updateToReadDonations(data) {
	clearTimeout(updateTimeout); // Clear timeout in case this is triggered from a message.
	request({
		uri: `${apiURL}/?event=${eventID}&type=donation&feed=toread`,
		resolveWithFullResponse: true,
		json: true
	}).then(resp => {
		var currentDonations = processToReadDonations(resp.body);
		donationsToRead.value = currentDonations;
		updateTimeout = setTimeout(updateToReadDonations, refreshTime);
	}).catch(err => {
		nodecg.log.warn('Error updating to read donations:', err);
		updateTimeout = setTimeout(updateToReadDonations, refreshTime);
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

function markDonationAsRead(id, callback) {
	request({
		uri: `${apiEditURL}/?type=donation&id=${id}&readstate=READ&commentstate=APPROVED`,
		resolveWithFullResponse: true,
		json: true
	}).then(resp => {
		nodecg.log.info(`Successfully marked donation ${id} as read.`);
		updateToReadDonations();
		if (callback) callback();
	}).catch(err => {
		nodecg.log.warn(`Error marking donation ${id} as read:`, err);
		updateToReadDonations();
		if (callback) callback();
	});
}