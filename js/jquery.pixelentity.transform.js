(function($) { 	

	var origin = "0px 0px";
	// nearest
	var scalingMode = "bilinear";

	/*
		very stipped down version of 
		https://github.com/heygrady/transform/blob/master/README.md
	*/
	
	var rmatrix = /progid:DXImageTransform\.Microsoft\.Matrix\(.*?\)/;
	
	// Steal some code from Modernizr
	var m = document.createElement( 'modernizr' ),
		m_style = m.style;
		
	/**
	 * Find the prefix that this browser uses
	 */	
	function getVendorPrefix() {
		var property = {
			transformProperty : '',
			MozTransform : '-moz-',
			WebkitTransform : '-webkit-',
			OTransform : '-o-',
			msTransform : '-ms-'
		};
		for (var p in property) {
			if (typeof m_style[p] != 'undefined') {
				return property[p];
			}
		}
		return null;
	}
	
	function supportCssTransforms() {
		var props = [ 'transformProperty', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform' ];
		for ( var i in props ) {
			if ( m_style[ props[i] ] !== undefined  ) {
				return true;
			}
		}
	}
		
	// Capture some basic properties
	var vendorPrefix			= getVendorPrefix(),
		transformProperty		= vendorPrefix !== null ? vendorPrefix + 'transform' : false,
		transformOriginProperty	= vendorPrefix !== null ? vendorPrefix + 'transform-origin' : false;
	
	// store support in the jQuery Support object
	$.support.csstransforms = supportCssTransforms();
	
	// IE9 public preview 6 requires the DOM names
	if (vendorPrefix == '-ms-') {
		transformProperty = 'msTransform';
		transformOriginProperty = 'msTransformOrigin';
	}

	function transform(el,ratio,dx,dy) {
		if ($.support.csstransforms) {
			var offs = (dx != undefined ) ? "translate("+dx+"px,"+dy+"px) " : "";
			$(el).css(transformOriginProperty,origin).css(transformProperty,offs+"scale("+ratio+")");
		} else if ($.browser.msie) {
			var style = el.style;
			var matrixFilter = 'progid:DXImageTransform.Microsoft.Matrix(FilterType="'+scalingMode+'",M11='+ratio+',M12=0,M21=0,M22='+ratio+',Dx='+dx+',Dy='+dy+')';
			var filter = style.filter || $.curCSS( el, "filter" ) || "";
			style.filter = rmatrix.test(filter) ? filter.replace(rmatrix, matrixFilter) : filter ? filter + ' ' + matrixFilter : matrixFilter;
		}
	}

	$.fn.transform = function(ratio,dx,dy) {
		
		this.each(function() {
			transform(this,ratio,dx,dy);
		});
		
		return this;		 
	};	
		
})(jQuery);

		

