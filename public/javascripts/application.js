$(document).ready(function() {
	// Fix placeholders
	if (!("placeholder" in document.createElement("input"))) {
		$('input, textarea').focus(function() {
			if($(this).attr('placeholder') && $(this).val()==$(this).attr('placeholder')) {
				$(this).removeClass('faded').val('');
			}
		}).blur(function() {
			if($(this).attr('placeholder') && ($(this).val()=="" || $(this).val()==$(this).attr('placeholder'))) {
				$(this).addClass('faded').val($(this).attr('placeholder'));
			} else {
				$(this).removeClass('faded');
			}
		}).blur();
	}
	
	
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