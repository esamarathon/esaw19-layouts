'use strict';
$(() => {
	// JQuery selectors.
	var donationTotalElement = $('#donationTotal');
	var prizesContainer = $('#prizesContainer');
	var bidsContainer = $('#bidsContainer');
	var runsContainer = $('#runsContainer');
	var switchableInfoHeader = $('#switchableInfoHeader');
	var switchableInfoContainer = $('#switchableInfoContainer');
	
	// Declaring variables.
	var prizeHTML = $('<div class="prize"><span class="prizeName"></span><br>Provided by <span class="prizeProvider"></span><br>minimum donation <span class="prizeMinDonation"></span><br>Ends: <span class="prizeEnd"></span></div>');
	var bidHTML = $('<div class="bid"><span class="bidGame"></span><br><span class="bidName"></span></div>')
	var runHTML = $('<div class="run"><span class="justMissed">YOU HAVE JUST WATCHED<br></span><span class="gameName"></span><br><span class="gameCategory"></span><br><span class="gameConsole"></span><br><span class="gameRunners"></span><br><span class="gameTime"></span><br><span class="gameFinal"></span></div>');
	var stcInfoIndex = 0;
	var sponsorInfoIndex = 0;
	
	// This should go in external file really.
	var stcText = [
		'When the worst happens, children are always among the most vulnerable – and often suffer most. Save the Children responds to natural disasters, conflicts and other humanitarian emergencies across the globe with health, education and protection programs that address the unique needs of children in crisis.',
		'263 million children are out of school - that’s more than 1 in 6 school-aged children. Educating children gives the next generation the tools to fight poverty and prevent disease. A small contribution of $5 dollars can provide education supplies for one child, giving him/her the tools they need to continue their education.',
		'168 million children worldwide are involved in child labor - that’s more than all the children in Europe combined. Child labour deprives children the right to normal physical and mental development and often interferes with children’s education. $50 can pay for the attendance of an entire village school in a country like Uganda, including the cost of teacher training and salary, supplies, and curriculum. Educating children gives the next generation the tools to fight poverty and prevent disease.',
		'Save the Children was founded nearly 100 years ago and today works in 120 countries. Known to be one of the most efficient and effective charities in the world and one of a few that focus on children. Last year Save the Children helped more than 157 million children around the globe. Thank you all for donating.'
	]
	var sponsorText = [
		'<b>City of Malmö:</b><br><br>Supporting the event allowing the event to come to a hotel for the first time.',
		'<b>Twitch:</b><br><br>Strong supporters of Speedrunning and our community. We’ve grown together and will continue to grow even stronger with more speedrunning events in Europe in the future!',
		'<b>Western Digital Black</b><br><br>WD Black are gaming SSD made  for speed! Just like speedrunning! The lovely Brad from WD has been hanging out with us, getting to know our community and improved the meta-game of Quick and Crash! He caught the speed-bug!',
		'<b>Sigma IT Consulting</b><br><br>Sigma loves gaming and making a difference. Supporting ESA was a no-brainer as it combines all the core values of Sigma. All for a better tomorrow!<br><br>Sigma has been a partner of ESA for multiple years.',
		'<b>Toadman Interactive</b><br><br>Toadman Interactive is a Swedish game developing firm. The are currently working a their first solo AAA-title called Immortal: Unchained which will be released during 2018.<br><br>They are bringing a playable demo uniquely for ESA!<br><br>Many employees at Toadman are fans of speedrunning and thus it was a sure thing to support the event!',
		'<b>ViewSonic</b><br><br>ViewSonic are supporting the event with all monitors for the streaming area and a large amount of practice monitors. Obviously with minimal latency for speed and accuracy!<br><br>They simply get gamers, and want to show their support to continue ESA to spread love to gamers in Europe!',
		'<b>Elgato</b><br><br>Supporting ESA for the past 3 events. This year with 4 streaming pods on the back of the main streaming room, allowing attendees to stay connected with their community and bring their community a part of ESA.<br><br>Are also supporting the event with multiple prizes supporting the charitable cause!',
		'<b>ChronoGG (promote this a lot! It’s one of the few call to actions we have. And promote it during games)</b><br><br>For every game sold through www.chrono.gg a large part will be donated to charity. This is a site wide campaign! Consider taking a look and maybe you’ll find an offer of a great game that suits you!<br><br>A new game every 24 hours!<br><br>Examples of games that will be on sale:<br>7/25/2018    SUPERHOT    Confirmed    $9.00<br>7/26/2018    RUINER    Confirmed    $9.00',
		'<b>Dominos Pizza</b><br><br>Supporting the event with pizzas for all volunteers twice a day.<br><br>Together with a promotional offer (ESA2018) which anyone can use at any of the Swedish restaurants for at 20% discount!',
		'<b>Elgiganten</b><br><br>Supporting the event with several dozens top of the line gaming PCs! A very important part of making the event happen as we have a lot of PC runners coming to ESA!<br><br>All of the gaming PCs used on stream are provided by Elgiganten!',
		'<b>BandaiNamco</b><br><br>Strong supporters of the speedrunning community! They are working very closely with multiple runner of our community to showcase their new and old games.<br><br>They also have representatives on site hanging out and getting to know our community even better.<br><br>Even though they no longer actively support it, we’re forever grateful for Quick and Crash by Namco! “This is the final stage, shoot the cup” *Explosion noise*',
		'<b>Red Bull</b><br><br>Giving ESA wings!<br>Making sure runners stay hydrated for their runs!',
		'<b>Arozzi</b><br><br>Providing chairs for all PC runs as well as daily prizes for the raffle. Which hopefully will increase donations to charity!'
	];
	
	// Keep donation total updated.
	var donationTotal = nodecg.Replicant('donationTotal');
	donationTotal.on('change', newVal => {
		donationTotalElement.html(formatDollarAmount(donationTotal.value, true));
	});
	
	// Keep prizes updated.
	var prizes = nodecg.Replicant('prizes');
	prizes.on('change', newVal => {
		prizesContainer.html('');
		newVal.forEach(prize => {
			var prizeElement = prizeHTML.clone();
			$('.prizeName', prizeElement).html(prize.name);
			$('.prizeProvider', prizeElement).html(prize.provided);
			$('.prizeMinDonation', prizeElement).html(formatDollarAmount(prize.minimum_bid));
			$('.prizeEnd', prizeElement).html(moment(prize.end_timestamp).format('Do HH:mm'));
			prizesContainer.append(prizeElement);
		});
	});
	
	// Keep bids updated.
	var bids = nodecg.Replicant('bids');
	bids.on('change', newVal => {
		var i = 0;
		bidsContainer.html('');
		newVal.forEach(bid => {
			if (i >= 2) return;
			var bidElement = bidHTML.clone();
			$('.bidGame', bidElement).html(bid.game+' - '+bid.category);
			$('.bidName', bidElement).html(bid.name);
			// Donation Goal
			if (!bid.options) {
				var bidLeft = bid.goal - bid.total;
				bidElement.append('<br>'+formatDollarAmount(bid.total)+'/'+formatDollarAmount(bid.goal));
				bidElement.append('<br>'+formatDollarAmount(bidLeft)+' to goal'); 
			}
			// Bid War
			else {
				if (bid.options.length) {
					bid.options.forEach(option => {
						bidElement.append('<br>'+option.name+' ('+formatDollarAmount(option.total)+')')
					});
					
					if (bid.allow_user_options)
						bidElement.append('<br><i>Users can submit their own options.</i>')
				}
				else
					bidElement.append('<br><i>No options submitted yet.</i>')
			}
			bidsContainer.append(bidElement);
			i++;
		});
	});
	
	var runDataArray = nodecg.Replicant('runDataArray', 'nodecg-speedcontrol');
	var runDataActiveRun = nodecg.Replicant('runDataActiveRun', 'nodecg-speedcontrol');
	var runFinishTimes = nodecg.Replicant('runFinishTimes', 'nodecg-speedcontrol');
	var runFinishTimesInit = false;
	var runDataActiveRunInit = false;
	var runsInit = false;
	runFinishTimes.on('change', newVal => {
		runFinishTimesInit = true;
		if (!runsInit && runFinishTimesInit && runDataActiveRunInit) {
			setRuns();
			runsInit = true;
		}
	});
	runDataActiveRun.on('change', newVal => {
		runDataActiveRunInit = true;
		if (runFinishTimesInit && runDataActiveRunInit) {
			setRuns();
			runsInit = true;
		}
	});
	
	function setRuns() {
		runsContainer.html('');
		var indexOfCurrentRun = findIndexInRunDataArray(runDataActiveRun.value);
		for (var i = -1; i < 2; i++) {
			var run = runDataArray.value[indexOfCurrentRun+i];
			if (run) {
				var runElement = runHTML.clone();
				if (i === -1) {
					$('.justMissed', runElement).show();
					if (runFinishTimes.value[runDataActiveRun.value.id-1]) {
						$('.gameFinal', runElement).html(runFinishTimes.value[runDataActiveRun.value.id-1]);
						$('.gameFinal', runElement).show();
					}
				}
				else {
					$('.justMissed', runElement).hide();
					$('.gameFinal', runElement).hide();
				}
				$('.gameName', runElement).html(run.game);
				$('.gameCategory', runElement).html(run.category);
				$('.gameConsole', runElement).html(run.system);
				$('.gameRunners', runElement).html(formPlayerNamesString(run));
				$('.gameTime', runElement).html(run.estimate);
				runsContainer.append(runElement);
			}
		}
	}
	
	setStCText();
	nodecg.listenFor('hostdash_changeStCText', setStCText);
	function setStCText() {
		switchableInfoHeader.html('Save the Children Information');
		switchableInfoContainer.html(stcText[stcInfoIndex]);
		stcInfoIndex++;
		if (stcInfoIndex >= stcText.length) stcInfoIndex = 0;
	}

	nodecg.listenFor('hostdash_changeSponsorText', setSponsorText);
	function setSponsorText() {
		switchableInfoHeader.html('Sponsor Information');
		switchableInfoContainer.html(sponsorText[sponsorInfoIndex]);
		sponsorInfoIndex++;
		if (sponsorInfoIndex >= sponsorText.length) sponsorInfoIndex = 0;
	}
});