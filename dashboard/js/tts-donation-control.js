$(() => {
	const availableVoices = nodecg.Replicant('ttsVoices');
	const chosenVoice = nodecg.Replicant('ttsChosenVoice');
	const ttsGraphicOpen = nodecg.Replicant('ttsGraphicOpen', {defaultValue: false});

	ttsGraphicOpen.on('change', open => {
		if (open) {
			$('#disabedSpan').hide();
			$('#enabledSpan').show();
		} else {
			$('#disabedSpan').show();
			$('#enabledSpan').hide();
		}
	});

	// Compile the list of voices when the graphic tells us what is available.
	availableVoices.on('change', voices => {
		voices.forEach(voice => {
			$('#voiceOption').append($('<option>', {
				value: voice,
				text: voice
			}));
		});

		// If a voice is already set, select it.
		if (chosenVoice.value)
			$('#voiceOption').val(chosenVoice.value);
	});

	// Set the selection voice as the chosen one.
	$('#chooseVoice').click(() => {
		chosenVoice.value = $('#voiceOption').val();
	});

	// Tell the graphic to play an example.
	$('#voiceExample').click(() => {
		nodecg.sendMessage('loadURL', 'https://taskinoz.com/gdq/api', (err, resp, body) => {
			nodecg.sendMessage('ttsSpeak', body);
		});
	});
});