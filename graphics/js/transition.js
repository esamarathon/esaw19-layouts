'use strict';
$(() => {
	var animationTimeout;
	nodecg.listenFor('startTransition', () => {
		// Stop any currently running animations.
		clearTimeout(animationTimeout);
		$('#light').stop();
		$('#dark').stop();

		// Show the elements (in case they are hidden).
		$('#light').show();
		$('#dark').show();

		// Return images to correct positions.
		$('#light').css({left: '623px', top: '1080px'});
		$('#dark').css({left: '-623px', top: '-1080px'});

		// Animate lines to center.
		$('#light').animate({left: '0', top: '0'}, 800);
		$('#dark').animate({left: '0', top: '0'}, 800);

		// After a small amount of time, animate the lines off the other side.
		animationTimeout = setTimeout(() => {
			$('#light').animate({left: '-623px', top: '-1080px'}, 800);
			$('#dark').animate({left: '623px', top: '1080px'}, 800, () => {
				$('#light').removeAttr('style');
				$('#dark').removeAttr('style');
				
				// Hide the elements.
				$('#light').hide();
				$('#dark').hide();
			});
		}, 1000);
	});
});