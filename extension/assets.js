'use strict';

const nodecg = require('./utils/nodecg-api-context').get();
const clone = require('clone');

const sponsorLogosAssetArr = nodecg.Replicant('assets:sponsor-logos');
const sponsorSlidesAssetArr = nodecg.Replicant('assets:sponsor-slides');

const sponsorLogos = nodecg.Replicant('sponsor-logos_assets', {defaultValue: []});
const sponsorSlides = nodecg.Replicant('sponsor-slides_assets', {defaultValue: []});

sponsorLogosAssetArr.on('change', (newVal, oldVal, changes) => {
	if (changes) {
		changes.forEach(change => {
			if (change.method === 'push' && !findAssetBySum(change.args[0].sum, sponsorLogos.value)[0]) {
				var asset = clone(change.args[0]);
				asset['chance'] = 1;
				sponsorLogos.value.push(asset);
			}
			if (change.method === 'splice') {
				var index = findAssetBySum(oldVal[change.args[0]].sum, sponsorLogos.value)[1];
				sponsorLogos.value.splice(index, 1);
			}
		});
	}
});

sponsorSlidesAssetArr.on('change', (newVal, oldVal, changes) => {
	if (changes) {
		changes.forEach(change => {
			if (change.method === 'push' && !findAssetBySum(change.args[0].sum, sponsorSlides.value)[0]) {
				var asset = clone(change.args[0]);
				asset['chance'] = 1;
				sponsorSlides.value.push(asset);
			}
			if (change.method === 'splice') {
				var index = findAssetBySum(oldVal[change.args[0]].sum, sponsorSlides.value)[1];
				sponsorSlides.value.splice(index, 1);
			}
		});
	}
});

function findAssetBySum(sum, assetRep) {
	for (var i = 0; i < assetRep.length; i++) {
		if (assetRep[i].sum === sum)
			return [assetRep[i].name, i];
	}

	return [null, -1];
}