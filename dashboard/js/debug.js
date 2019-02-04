'use strict';
$(() => {
	$('.debugSDKeyUp').on('click', (evt) => {
		evt.preventDefault();
		var location = $(evt.currentTarget).data('location');
		nodecg.sendMessage('debugSDKeyUp', location);
	})
});