/*
	Miniport by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var	$window = $(window),
		$body = $('body'),
		$nav = $('#nav');

	// Breakpoints.
		breakpoints({
			xlarge:  [ '1281px',  '1680px' ],
			large:   [ '981px',   '1280px' ],
			medium:  [ '737px',   '980px'  ],
			small:   [ null,      '736px'  ]
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Scrolly.
		$('#nav a, .scrolly').scrolly({
			speed: 1000,
			offset: function() { return $nav.height(); }
		});

	// Animate stats counter when scrolled into view
	function animateStats() {
		const statNumbers = document.querySelectorAll('.stat-number');
		
		if (statNumbers.length > 0) {
			const observer = new IntersectionObserver((entries) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						const target = entry.target;
						const targetValue = parseInt(target.getAttribute('data-count'));
						const duration = 2000; // 2 seconds
						const step = targetValue / (duration / 16); // 60fps
						let current = 0;
						
						const updateCount = () => {
							current += step;
							if (current >= targetValue) {
								target.textContent = targetValue + (target.getAttribute('data-suffix') || '');
							} else {
								target.textContent = Math.floor(current) + (target.getAttribute('data-suffix') || '');
								requestAnimationFrame(updateCount);
							}
						};
						
						updateCount();
						observer.unobserve(target);
					}
				});
			}, { threshold: 0.5 });
			
			statNumbers.forEach(stat => {
				observer.observe(stat);
			});
		}
	}

	// Initialize stats counter when document is ready
	document.addEventListener('DOMContentLoaded', function() {
		animateStats();
		
		// Re-run counter animation when navigating back to the page
		document.addEventListener('visibilitychange', function() {
			if (!document.hidden) {
				animateStats();
			}
		});
	});

})(jQuery);