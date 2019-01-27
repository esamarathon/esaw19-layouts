var chosenVoice;
$(() => {
	var availableVoices = nodecg.Replicant('ttsVoices');
	chosenVoice = nodecg.Replicant('ttsChosenVoice');

	NodeCG.waitForReplicants(availableVoices, chosenVoice).then(() => {
		// Populate the list of available voices.
		var voiceList = responsiveVoice.getVoices();
		var voices = [];
		voiceList.forEach(voice => voices.push(voice.name));
		availableVoices.value = voices;

		// Find the chosen voice's object for reference when we speak.
		chosenVoice.on('change', voice => {
			responsiveVoice.setDefaultVoice(voice);
		});

		nodecg.listenFor('ttsSpeak', speak);
	});
});

// Speaks the text supplied with the currently selected voice.
function speak(text) {
	responsiveVoice.speak(text, chosenVoice.value, {rate: 0.8});
}