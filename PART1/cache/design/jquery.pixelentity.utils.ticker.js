(function($) { 	

	$.pixelentity = $.pixelentity || {version: '1.0.0'};

	var ticker = $.pixelentity.ticker = $("<div>");
	
	function now() {
		return (new Date).getTime();
	}
					
	var last=now();
	
	var t1,t2;
	
	function tick() {
		var n = now();
		if (n-last >= 30) {
			ticker.triggerHandler("tick");
			last = n;
		}
	}
	
	setInterval(tick, 16);
	setInterval(tick, 30);
		
})(jQuery);

		

