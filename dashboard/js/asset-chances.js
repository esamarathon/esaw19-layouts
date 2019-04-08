'use strict';
$(() => {
	const sponsorLogos = nodecg.Replicant('assets:sponsor-logos');
	const sponsorSlides = nodecg.Replicant('assets:sponsor-slides');
	const sponsorLogosChance = nodecg.Replicant('sponsor-logos_chance');
	const sponsorSlidesChance = nodecg.Replicant('sponsor-slides_chance');

	const sponsorLogosElem = $('#sponsorLogos');
	const sponsorSlidesElem = $('#sponsorSlides');

	NodeCG.waitForReplicants(sponsorLogos, sponsorSlides, sponsorLogosChance, sponsorSlidesChance).then(() => {
		console.log(sponsorLogos.value[0]);
		sponsorLogosChance.on('change', newVal => {
			sponsorLogosElem.empty();
			const entries = Object.entries(newVal);
			entries.forEach(asset => {
				var assetFileName = getAssetFileName(asset[0], sponsorLogos.value);
				var elem = $('<div>');
				elem.append(`<input type="number" min="1"  value="${asset[1]}" data-sum="${asset[0]}">`);
				elem.append(assetFileName);
				sponsorLogosElem.append(elem);
			});
		});

		sponsorSlidesChance.on('change', newVal => {
			sponsorSlidesElem.empty();
			const entries = Object.entries(newVal);
			entries.forEach(asset => {
				var assetFileName = getAssetFileName(asset[0], sponsorSlides.value);
				var elem = $('<div>');
				elem.append(`<input type="number" min="1" value="${asset[1]}" data-sum="${asset[0]}">`);
				elem.append(assetFileName);
				sponsorSlidesElem.append(elem);
			});
		});

		$('#save').click(() => {
			$('input', sponsorLogosElem).each((i, elem) => {
				sponsorLogosChance.value[$(elem).data('sum')] = parseInt($(elem).val());
			});

			$('input', sponsorSlidesElem).each((i, elem) => {
				sponsorSlidesChance.value[$(elem).data('sum')] = parseInt($(elem).val());
			});

			$('#save').text('Saved!');
			$('#save').attr('disabled', true);
			setTimeout(() => {
				$('#save').attr('disabled', false);
				$('#save').text('Save');
			}, 2000);
		});
	});
});

function getAssetFileName(sum, assetRep) {
	for (var i = 0; i < assetRep.length; i++) {
		if (assetRep[i].sum === sum)
			return assetRep[i].name;
	}
}