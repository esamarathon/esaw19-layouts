'use strict';
$(() => {
	var currentVideo = nodecg.Replicant('currentSponsorVideo');
	var lastTimePlayed = nodecg.Replicant('sponsorVideosLastTimePlayed');
	var playCount = nodecg.Replicant('sponsorVideosPlayCount');
	var videoPlayer = $('#videoPlayer')[0];
	var videoSource = $('#videoSrc')[0];

	// Only play the video once the OBS scene is active (won't play in Studio Mode).
	window.obsstudio.onActiveChange = function(active) {
		if (!active || !currentVideo.value || !currentVideo.value.info) {
			// Stop the video if the scene is changed.
			if (!active) {
				videoPlayer.pause();
				videoPlayer.removeEventListener('ended', changeFlags);
			}

			return;
		}

		// If the video has been played before, force back to the last scene.
		if (currentVideo.value.played) {
			setTimeout(() => nodecg.sendMessage('sponsorVideoFinished'), 5000);
			return;
		}

		// Load in and play the current video.
		videoSource.src = currentVideo.value.info.url;
		videoPlayer.load();
		videoPlayer.play();
		videoPlayer.addEventListener('ended', changeFlags);
	}

	// Update flags once video ends.
	function changeFlags() {
		currentVideo.value.played = true;
		lastTimePlayed.value[currentVideo.value.info.sum] = moment();
		if (!playCount.value[currentVideo.value.info.sum]) playCount.value[currentVideo.value.info.sum] = 1;
		else playCount.value[currentVideo.value.info.sum]++;
		nodecg.sendMessage('sponsorVideoFinished');
	}
});