'use strict';

// https://github.com/GamesDoneQuick/agdq18-layouts/blob/master/extension/bids.js

// Referencing packages.
const request = require('request-promise').defaults({jar: true});

// Declaring other variables.
var nodecg = require('./utils/nodecg-api-context').get();
var apiURL = 'https://donations.esamarathon.com/search';
var refreshTime = 60000; // Get bids every 60s.

// ID 9: Stream 1
// ID 10: Stream 2
var eventID = 9;
if (nodecg.bundleConfig.stream2)
	eventID = 10;

// Replicants.
var bids = nodecg.Replicant('bids', {defaultValue: []});

// Get the open bids from the API.
updateBids();
function updateBids() {
	request({
		uri: `${apiURL}/?event=${eventID}&type=allbids&state=OPENED`,
		resolveWithFullResponse: true,
		json: true
	}).then(resp => {
		var currentBids = processRawBids(resp.body);
		bids.value = currentBids;
		setTimeout(updateBids, refreshTime);
	}).catch(err => {
		nodecg.log.warn('Error updating bids:', err);
		setTimeout(updateBids, refreshTime);
	});
}

// Processes the response from the API above.
function processRawBids(bids) {
	var parentBidsByID = {};
	var childBids = [];
	
	bids.forEach(bid => {
		// Ignore denied/pending entries.
		if (bid.fields.state === 'DENIED' || bid.fields.state === 'PENDING')
			return;
		
		// bid is an option for a bid war if the parent is set.
		if (bid.fields.parent)
			childBids.push(bid);
		else {
			// We want to use the short description if possible.
			var description = bid.fields.shortdescription;
			if (!description || description === '')
				description = bid.fields.description;
			
			var formattedParentBid = {
				id: bid.pk,
				name: bid.fields.name,
				total: parseFloat(bid.fields.total),
				game: bid.fields.speedrun__name,
				category: bid.fields.speedrun__category,
				description: description,
				end_time: Date.parse(bid.fields.speedrun__endtime)
			};
			
			// If the bid isn't a target, it will be a bid war.
			if (!bid.fields.istarget) {
				formattedParentBid.war = true;
				formattedParentBid.allow_user_options = bid.fields.allowuseroptions;
				formattedParentBid.options = [];
			}
			else
				formattedParentBid.goal = parseFloat(bid.fields.goal);
			
			parentBidsByID[bid.pk] = formattedParentBid;
		}
	});
	
	childBids.forEach(bid => {
		var formattedChildBid = {
			id: bid.pk,
			parent: bid.fields.parent,
			name: bid.fields.name,
			total: parseFloat(bid.fields.total)
		}
		
		// If we have a parent for this child, add it to the parent.
		var parent = parentBidsByID[bid.fields.parent];
		if (parent)
			parentBidsByID[bid.fields.parent].options.push(formattedChildBid);
	});
	
	// Transfer object made above to an array instead.
	var bidsArray = [];
	for (var id in parentBidsByID) {
		if (!{}.hasOwnProperty.call(parentBidsByID, id))
			continue;
		
		var bid = parentBidsByID[id];
		
		if (bid.options && bid.options.length) {
			// Sort bid war options from largest to smallest.
			bid.options = bid.options.sort((a, b) => {
				if (a.total > b.total)
					return -1;
				if (a.total < b.total)
					return 1;
				
				// a must be equal to b
				return 0;
			});
		}
		
		bidsArray.push(bid);
	}
	
	// Sort by earliest first.
	bidsArray.sort((a, b) => {
		if (a.end_time < b.end_time)
			return -1;
		if (a.end_time > b.end_time)
			return 1;
		
		// a must be equal to b
		return 0;
	});
	
	return bidsArray;
}