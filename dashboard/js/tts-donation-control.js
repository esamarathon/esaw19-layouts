$(() => {
	const availableVoices = nodecg.Replicant('ttsVoices');
	const chosenVoice = nodecg.Replicant('ttsChosenVoice');
	const ttsGraphicOpen = nodecg.Replicant('ttsGraphicOpen');

	// Hide/show the settings depending on if the graphic is open or not.
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
		$('#voiceOption').empty();
		Object.keys(voices).forEach(code => {
			$('#voiceOption').append($('<option>', {
				value: code,
				text: voices[code].name
			}));
		});

		// If a voice is already set, select it.
		if (chosenVoice.value) $('#voiceOption').val(chosenVoice.value);
	});

	// Select a voice if it's been selected.
	chosenVoice.on('change', voice => {
		if (voice) $('#voiceOption').val(voice);
	});

	// Set the selection voice as the chosen one.
	$('#chooseVoice').click(() => {
		chosenVoice.value = $('#voiceOption').val();
	});

	// Tell the graphic to play an example.
	$('#voiceExample').click(() => {
		var amount = 100*Math.random();
		nodecg.sendMessage('loadURL', 'https://taskinoz.com/gdq/api', (err, resp, body) => {
			nodecg.sendMessage('ttsSpeak', {
				name: 'Anonymous',
				amount: amount,
				comment: body
			});
		});
	});
});