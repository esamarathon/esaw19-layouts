var chosenVoice;
var alternate = false;
$(() => {
	var availableVoices = nodecg.Replicant('ttsVoices');
	chosenVoice = nodecg.Replicant('ttsChosenVoice');

	NodeCG.waitForReplicants(availableVoices, chosenVoice).then(() => {
		var voices = {};
		
		// Use alternate solution if available.
		if (nodecg.bundleConfig.altTTSVoiceAPI) {
			// We need to query an external API to get the available voices.
			alternate = true;
			nodecg.sendMessage('loadURL', `${nodecg.bundleConfig.altTTSVoiceAPI}/voices`, (err, resp, body) => {
				var voiceList = JSON.parse(body).voices;
				Object.keys(voiceList).forEach(code => {
					// Only use voices using the Wavenet tech and that are English based.
					if (voiceList[code].languageCode.includes('en-') && code.includes('Wavenet')) {
						voices[code] = {name: voiceList[code].name};
					}
				});

				availableVoices.value = voices;

				// Set the voice to a default if needed.
				if (!voices[chosenVoice.value] || !chosenVoice.value) {
					chosenVoice.value = 'en-US-Wavenet-A';
				}
			});
		}

		else {
			// Populate the list of available voices.
			var voiceList = responsiveVoice.getVoices();
			voiceList.forEach(voice => {
				voices[voice.name] = {name: voice.name};
			});

			availableVoices.value = voices;

			// Set the voice to a default if needed.
			if (!voices[chosenVoice.value] || !chosenVoice.value) {
				chosenVoice.value = 'UK English Female';
				responsiveVoice.setDefaultVoice('UK English Female');
			}
		}

		// Find the chosen voice's object for reference when we speak.
		chosenVoice.on('change', voice => {
			if (!alternate) responsiveVoice.setDefaultVoice(voice);
		});

		nodecg.listenFor('ttsSpeak', speak);
	});
});

// Speaks the donation supplied with the currently selected voice.
function speak(donation) {
	var text = `${donation.name} donated $${donation.amount.toFixed(2)}`;
	if (donation.comment) text += `: ${donation.comment}`;

	if (!alternate) responsiveVoice.speak(text, chosenVoice.value, {rate: 0.8});
	else {
		// Play audio from a URL if using the alternative option.
		var url = `${nodecg.bundleConfig.altTTSVoiceAPI}?voice=${chosenVoice.value}&text=${encodeURIComponent(text)}`;
		var audio = new Audio();
		audio.src = url;
		audio.play();
	}
}