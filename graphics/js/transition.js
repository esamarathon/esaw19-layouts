'use strict';
$(() => {
	var animationTimeout;
	nodecg.listenFor('startTransition', () => {
		// Stop any currently running animations.
		clearTimeout(animationTimeout);
		$('#light').stop();
		$('#dark').stop();
		$('#light').css('opacity', '0');
		$('#dark').css('opacity', '0');

		// Animate sections.
		$('#light').fadeTo(400, 1, () => {
			$('#dark').fadeTo(400, 1);
		});

		// After a small amount of time, animate the sections off again.
		animationTimeout = setTimeout(() => {
			$('#light').fadeTo(800, 0);
			$('#dark').fadeTo(800, 0, () => {
				$('#light').removeAttr('style');
				$('#dark').removeAttr('style');
			});
		}, 1000);
	});
});