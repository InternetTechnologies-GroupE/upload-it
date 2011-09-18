$(document).ready(function() {
	if($('aside.sticky').length > 0) {
		sticky_origin = $('aside.sticky').position().top;
		window.onscroll = function() {
			if( window.XMLHttpRequest ) { // IE 6 doesn't implement position fixed nicely...
				if (document.documentElement.scrollTop > sticky_origin) {
					$('aside.sticky').addClass('fixed');
				} else {
					$('aside.sticky').removeClass('fixed');
				}
			}
		}
	}
	
	$('a[data-rel]').each(function() {
	    $(this).attr('rel', $(this).data('rel'));
	});
	
	$(".gallery a.prettyPhoto").prettyPhoto();
});