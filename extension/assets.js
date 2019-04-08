'use strict';

const nodecg = require('./utils/nodecg-api-context').get();

const sponsorLogos = nodecg.Replicant('assets:sponsor-logos');
const sponsorSlides = nodecg.Replicant('assets:sponsor-slides');

const sponsorLogosChance = nodecg.Replicant('sponsor-logos_chance', {defaultValue: {}});
const sponsorSlidesChance = nodecg.Replicant('sponsor-slides_chance', {defaultValue: {}});

sponsorLogos.on('change', (newVal, oldVal, changes) => {
	if (changes) {
		changes.forEach(change => {
			if (change.method === 'push' && !sponsorLogosChance.value[change.args[0].sum])
				sponsorLogosChance.value[change.args[0].sum] = 1;
			if (change.method === 'splice')
				delete sponsorLogosChance.value[oldVal[change.args[0]].sum];
		});
	}
});

sponsorSlides.on('change', (newVal, oldVal, changes) => {
	if (changes) {
		changes.forEach(change => {
			if (change.method === 'push' && !sponsorSlidesChance.value[change.args[0].sum])
				sponsorSlidesChance.value[change.args[0].sum] = 1;
			if (change.method === 'splice')
				delete sponsorSlidesChance.value[oldVal[change.args[0]].sum];
		});
	}
});