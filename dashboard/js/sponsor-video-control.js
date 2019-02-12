'use strict';
$(() => {
	// Replicants
	var videos = nodecg.Replicant('assets:sponsor-videos');
	var currentVideo = nodecg.Replicant('currentSponsorVideo');
	var lastTimePlayed = nodecg.Replicant('sponsorVideosLastTimePlayed');
	
	// Adds the available layouts to the dropdown list.
	videos.on('change', newVal => {
		if (newVal) {
			$('#videoOption').empty();
			$.each(newVal, (i, videoInfo) => {
				$('#videoOption').append($('<option>', {
					value: videoInfo.sum,
					text: videoInfo.name
				}));
			});

			// Select the current video if the replicant is already available.
			if (currentVideo.value && currentVideo.value.info && currentVideo.value.info.sum)
				$('#videoOption').val(currentVideo.value.info.sum);
		}
	});

	// Sets the currently selected layout in the dropdown as the current one.
	$('#chooseVideo').click(() => {
		var videoChosen = findVideoBySum($('#videoOption').val());
		currentVideo.value.info = JSON.parse(JSON.stringify(videoChosen));
		currentVideo.value.played = false;
	});

	// Both of these replicants rely on each other here, so wait for both of them to be ready.
	NodeCG.waitForReplicants(currentVideo, lastTimePlayed).then(() => {
		currentVideo.on('change', newVal => {
			if (newVal) {
				// Set page element that tells you if the video has been played or not.
				if (newVal.played)
					$('#hasBeenPlayed').html('Yes');
				else
					$('#hasBeenPlayed').html('No');
	
				// Change displayed "last played" time if available when the video is changed.
				if (lastTimePlayed.value[newVal.info.sum])
					$('#lastTimePlayed').html(moment(lastTimePlayed.value[newVal.info.sum]).format('dddd (MMMM Do) h:mm a'));
				else
					$('#lastTimePlayed').html('Never');
			}
	
			// Change the dropdown to the currently active video.
			if (newVal && newVal.info && newVal.info.sum) {
				$('#videoOption').val(newVal.info.sum);
			}
		});

		// Change displayed "last played" time if available when the value is changed.
		lastTimePlayed.on('change', newVal => {
			if (newVal[currentVideo.value.info.sum])
				$('#lastTimePlayed').html(moment(newVal[currentVideo.value.info.sum]).format('dddd (MMMM Do) h:mm a'));
			else
				$('#lastTimePlayed').html('Never');
		});
	});

	// Finds a video with the supplied checksum.
	function findVideoBySum(sum) {
		var videoInfo;

		for (var i = 0; i < videos.value.length; i++) {
			if (videos.value[i].sum === sum) {
				videoInfo = videos.value[i];
				break;
			}
		}

		return videoInfo;
	}
});