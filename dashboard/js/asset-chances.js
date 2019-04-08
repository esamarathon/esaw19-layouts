'use strict';
$(() => {
	const sponsorLogos = nodecg.Replicant('sponsor-logos_assets');
	const sponsorSlides = nodecg.Replicant('sponsor-slides_assets');

	const sponsorLogosElem = $('#sponsorLogos');
	const sponsorSlidesElem = $('#sponsorSlides');

	NodeCG.waitForReplicants(sponsorLogos, sponsorSlides).then(() => {
		sponsorLogos.on('change', newVal => {
			sponsorLogosElem.empty();
			newVal.forEach(asset => {
				var assetFileName = asset.name;
				var elem = $('<div>');
				elem.append(`<input type="number" min="1" value="${asset.chance}" data-sum="${asset.sum}">`);
				elem.append(assetFileName);
				sponsorLogosElem.append(elem);
			});
		});

		sponsorSlides.on('change', newVal => {
			sponsorSlidesElem.empty();
			newVal.forEach(asset => {
				var assetFileName = asset.name;
				var elem = $('<div>');
				elem.append(`<input type="number" min="1" value="${asset.chance}" data-sum="${asset.sum}">`);
				elem.append(assetFileName);
				sponsorSlidesElem.append(elem);
			});
		});

		$('#save').click(() => {
			$('input', sponsorLogosElem).each((i, elem) => {
				var asset = findAssetBySum($(elem).data('sum'), sponsorLogos.value);
				sponsorLogos.value[asset[1]]['chance'] = parseInt($(elem).val());
			});

			$('input', sponsorSlidesElem).each((i, elem) => {
				var asset = findAssetBySum($(elem).data('sum'), sponsorSlides.value);
				sponsorSlides.value[asset[1]]['chance'] = parseInt($(elem).val());
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

function findAssetBySum(sum, assetRep) {
	for (var i = 0; i < assetRep.length; i++) {
		if (assetRep[i].sum === sum)
			return [assetRep[i].name, i];
	}

	return [null, -1];
}