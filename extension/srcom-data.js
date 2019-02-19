'use strict';

const nodecg = require('./utils/nodecg-api-context').get();
const needle = require('needle');
const async = require('async');
const lastChecked = nodecg.Replicant('srcomDataLastChecked');
const runDataArray = nodecg.Replicant('runDataArray', 'nodecg-speedcontrol');
var checkTimeout;

// Update data if it's been over 1 hour and the run data array has been updated.
runDataArray.on('change', runs => {
	if (runs && runs.length && Array.isArray(runs) && (!lastChecked.value || Date.now() > lastChecked.value+3600000)) {
		//updatePBs(runs);
	}
});

// Runs every 1 hour since the last check.
function intervalUpdatePBs() {
	if (!lastChecked.value || Date.now() > lastChecked.value+3600000) {
		updatePBs(runDataArray.value);
	}
}

// Actually get/process the information from speedrun.com
function updatePBs(runs) {
	nodecg.log.info('Attempting to update speedrun.com PB data for runs, this will take a while.');
	clearTimeout(checkTimeout);
	lastChecked.value = Date.now();
	var runsUpdated = runs.slice(0);
	
	// Looping through each run in the array.
	async.eachOfSeries(runsUpdated, (run, i, callback) => {
		var players = [];
		run.teams.forEach(team => team.players.forEach(player => players.push(player.name)));
		var playerPBs = [];

		// Looping through each player in the run.
		async.eachSeries(players, (player, callback) => {
			getPlayer(player, data => {
				if (!data) callback();
				else {
					getTopRuns(data.id, run.game, pbs => {
						data.pbs = pbs;
						playerPBs.push(data);
						setTimeout(callback, 1000); // Leave 1s before looking up next person.
					});
				}
			});
		}, err => {
			runsUpdated[i].esa_pbData = playerPBs;
			callback();
		});
	}, err => {
		// Update the array and set up the timeout.
		nodecg.log.info('Successfully updated the speedrun.com PB data for runs.');
		runDataArray.value = runsUpdated;
		checkTimeout = setTimeout(intervalUpdatePBs, 3600000);
	});
}

// Get information about the player from speedrun.com
function getPlayer(name, callback) {
	var url = `https://www.speedrun.com/api/v1/users?max=1&lookup=${name}`;

	getAPIData(url, (err, resp) => {
		if (!resp.body.data.length) return callback(); // Cannot find player.

		var data = resp.body.data[0];
		var player = {};
		player.id = data.id;
		player.name = data.names.international;
		if (data.twitch && data.twitch.uri)
			player.twitch = data.twitch.uri.split('/')[data.twitch.uri.split('/').length-1];
		if (data.twitter && data.twitter.uri)
			player.twitter = data.twitter.uri.split('/')[data.twitter.uri.split('/').length-1];
		if (data.location && data.location.country)
			player.country = data.location.country.code;

		callback(player);
	});
}

// Get information about the supplied player's top runs from speedrun.com
function getTopRuns(playerID, game, callback) {
	var url = `https://www.speedrun.com/api/v1/users/${playerID}/personal-bests?embed=game,category.variables,players`;

	getAPIData(url, (err, resp) => {
		var pbArray = resp.body.data;

		// Sort by highest placed runs first.
		pbArray.sort((a, b) => {
			if (a.place < b.place) return -1;
			if (a.place > b.place) return 1;
			return 0;
		});
		// Remove any ILs and limit to only 1 game.
		var gameSeen = [];
		pbArray = pbArray.filter(pb => {
			if (!gameSeen.includes(pb.run.game) && !pb.run.level) {
				gameSeen.push(pb.run.game);
				return true;
			}
		});
		// See if the runner has a top 10 time in the run, if so put this at the front of the list.
		pbArray.some(pb => {
			// Checking using the name, could be a better check.
			if (pb.game.data.names.international.toLowerCase().includes(game.toLowerCase()) && pb.place <= 10) {
				pbArray.unshift(pb);
				return true;
			}
		});
		pbArray.splice(3); // Limit to first 3 results.

		// Format data for each PB.
		var processedPBData = [];
		pbArray.forEach(pb => {
			// Grab names of other players if co-op run.
			var playerNames = {}, extraPlayers = [];
			pb.players.data.forEach(player => {
				if (player.rel === 'user') playerNames[player.id] = player.names.international;
			});
			pb.run.players.forEach(player => {
				if (player.rel === 'user' && player.id !== playerID)
					extraPlayers.push(playerNames[player.id]);
				else if (player.rel === 'guest') // Guests do not use IDs so just get their name.
					extraPlayers.push(player.name);
			});

			// Collect information on sub-categories/variables.
			var subCats = [], normalVars = [];
			pb.category.data.variables.data.forEach(variable => {
				if (!pb.run.values[variable.id]) return; // If a variable isn't set for this run, skip this bit.

				var variableName = variable.values.values[pb.run.values[variable.id]].label;
				if (variable['is-subcategory']) subCats.push(variableName); // Store sub-category names.
				else normalVars.push(variableName); // Store other variable names.
			});

			// Put all this information into an object in the array.
			processedPBData.push({
				game: pb.game.data.names.international,
				category: pb.category.data.name,
				place: pb.place,
				subcategories: subCats,
				variables: normalVars,
				extraPlayers: extraPlayers
			});
		});

		callback(processedPBData);
	});
}

// Keeps trying to get a response from the supplied URL if it fails.
// Checks there's no errors getting it and that it has received JSON.
// (speedrun.com sometimes returns a HTML error page).
function getAPIData(url, callback) {
	var success = false;
	async.whilst(
		() => {return !success},
		callback => {
			needle.get(url, (err, resp) => {
				if (!err && resp && resp.body && resp.parser === 'json') success = true;
				callback(null, resp);
			});
		},
		callback
	);
}