(function($) { 	

	$.pixelentity = $.pixelentity || {version: '1.0.0'};

	$.pixelentity.kenburnsSlider = {	
		conf: {
			externalFont:false 
		} 
	};
	
	// common stuff
	
	function _rgb2hex(rgb_string, r, g, b)  {
		var rgb = (1 << 24) | (parseInt(r) << 16) | (parseInt(g) << 8) | parseInt(b); 
		return '#' + rgb.toString(16).substr(1);
	}
	
	function KenBurnsSlider(t, conf) {

		/* private vars */
		var self = this;
 		var target = t.addClass("peKenBurns").removeClass("peNoJs");
 		var hoverMode = false;
 		
 		if (target.is("img")) {
 			var hasLink = false;
 			if (t.parent().is("a")) {
 				hasLink = true;
 			}
 			var imgHtml = '<img src="'+t.attr("src")+'" data-src="'+(t.attr("data-src") || "")+'"/>';
 			var newTarget = $(''+
'<div class="peKenBurns" data-autopause="none" data-controls="disabled" data-shadow="'+(t.attr("data-shadow") || "disabled")+'" data-logo="disabled">'+
		'<div class="peKb_slides" >'+
		'<div class="peKb_active" data-delay="'+(t.attr("data-delay") || "3" ) +'" data-duration="'+(t.attr("data-duration") || "10" ) +'">'+
			imgHtml+
			( t.attr("alt") ? '<h1>'+t.attr("alt")+'</h1>' : '' )+
		'</div>'+
		'<div data-delay="'+(t.attr("data-delay") || "3" ) +'" data-duration="'+(t.attr("data-duration") || "15" ) +'">'+
			imgHtml+
		'</div>'+
	'</div>'+
'</div>'+	
 			'');
 			
 			t.replaceWith(newTarget);
 			target = t = newTarget;
 			t.data("peKenburnsSlider",this);
 			
 			if (hasLink) {
 				t.css("cursor","pointer");
 			}
 			
 			hoverMode = true;
 		} else {
 			t.css({
 				"background-color":"transparent",
  				"-moz-border-radius": "0px", 
  				"-webkit-border-radius": "0px", 
  				"border-radius": "0px",
  				"padding": "0px"
 			});
 		}
 		
 		var kenburns = $.pixelentity && $.pixelentity.kenburnsImg && ( t.attr("data-mode") != "swipe" );
 		
 		var pauseOnControls = false;
 		var pauseOnImage = true;
 		
 		(function() {
 			var pauseon = t.attr("data-autopause");
 			if (pauseon) {
 				pauseOnControls = pauseon.match(/controls/) != undefined;
 				pauseOnImage = pauseon.match(/image/) != undefined;
 			}
 		})()
 		
 		var spinner = $('<div class="peKb_spinner"></div>');
		var videoOverlay = $('<div class="peKb_videooverlay"></div>');
		
		var captionOverlay = "";
		if (t.attr("data-captions") != "disabled") {
			captionOverlay = $('<div class="peKb_caption"></div>');
		} 
		
		var thumbOverlay = false;
		if (t.attr("data-thumb") != "disabled" ) {
			thumbOverlay  = $('<div class="peKb_Thumb"><div>/div>');
			var thumbDiv = thumbOverlay.find("div");
			var thumbImg = thumbOverlay.find("img");
			var thumbActive = false;
		}
		var timerWidget = $('<div class="peKb_timer"><div class="peKb_overlay"></div></div>');
		var timerWidgetCanvas;
		var timerWidgetSprite;
		var timerWidgetSize;
		var timerWidgetColor;
		
		var transitionSpeed = 800;
		var currentSlide = 0;
		var currentSlideEl;
		var currentSlideA;
		var previousSlide = -1;
		var previusCaption;
		var slides = [];
		var locked = false;
		var timerWidgetLocked = false;
		var w = t.width();
		var h = t.height();
		
		var thumbUseFade = !($.browser.msie && $.browser.version >= 7 && $.browser.version < 9 );
		
		var videoPlayback = false;
		var countMax = 0;
		var countdown = -1;
		var paused = false;
		var focused = false;
		var panelDisabled = false;
		var hideControlsOnFirst = false;
		var hideControlsOnFirstTimer = 0;
		var captionsResized = false;
		var captionDelayedResize = false;
		var hasActiveThumb = false;
		
		var useShadow =  !(t.attr("data-shadow") == "disabled");
		var useControls =!(t.attr("data-controls") == "disabled");
		var innerControls = (t.attr("data-controls") == "inner");
		
		var useLabel = (t.attr("data-logo") == "enabled");
		var iDev = navigator.userAgent.toLowerCase().match(/(iphone|ipod|ipad)/);
		
		if (useLabel) {
			// set overflow back
			t.css("overflow","visible");
		}
		
		if (hoverMode && useShadow) {
			h -= 36;
		}
		
		if (!hoverMode && useShadow && !useControls) {
			h -= 50;
		}
		
		if (!hoverMode && !useShadow && innerControls) {
			h += 50
		}
		
		var allSlides = t.find("div.peKb_slides");
		if (allSlides.length == 0) {
			t.wrapInner('<div class="peKb_slides"></div>');
			allSlides = t.find("div.peKb_slides");
		}
		
		var padding = parseInt(allSlides.css("padding-left").replace(/px/,"")) || 0;
		
		var controlsHTML = '';
		
		if (useControls) {
			controlsHTML += 
'<div class="peKb_controls">'+
	'<div class="peKb_holder">'+
		'<div class="peKb_mainPanel">'+
			'<div class="peKb_iebg">'+
				'<ul class="peKb_slideBtns">'+
					'<li><a href="#" class="peKb_currentSlide">1</a></li>'+
				'</ul>'+
				'<div class="peKb_arrows">'+
					'<a class="peKb_prev" href="#">p</a>'+
					'<a class="peKb_next" href="#">n</a>'+
				'</div>'+
				'<span class="peKb_iebgRight"></span>'+
			'</div>'+
		'</div>'+
		'<div class="peKb_videoClose">'+
			'<a href="#">close</a>'+
		'</div>'+
    '</div>'+   
'</div>';
		}
		
		if (useLabel) {
			controlsHTML +=
'<div class="peKb_logoLabel">'+
    '<a href="'+(t.attr("data-logo-link") || "#")+'" target="'+(t.attr("data-logo-target") || "_self")+'" >logo</a>'+	    
'</div>';
		}
		
		if (useShadow) {
			controlsHTML +=
'<div class="peKb_shadow">'+
    '<div class="peKb_left"></div>'+
    '<div class="peKb_middle"></div>'+
    '<div class="peKb_right"></div>'+
'</div>';
		}
		
		var controls = controlsHTML ? $(controlsHTML) : false;
		var controlsHeight = 0;
  		
  		if (controls) {
  		
  			if ($.browser.msie) {
  				var ieCssFix = "";
  				if ($.browser.version < 10) {
  					t.wrap('<div class="ie'+Math.floor($.browser.version)+'"></div>');
  				}
  			}  
  			
  			allSlides.after(controls);
  			if (innerControls) {
  				var controlsMarkup = controls.filter(".peKb_controls");
  				
  				controls.addClass("peKb_controlsInner");
  				
  				controlsHeight = controls.height();
  				controlsMarkup.css("margin-top",-controlsHeight-padding+10+(iDev ? 1 : 0));
  				
  				
  			} else if (padding != 15) {
  				controls.filter(".peKb_controls").css("margin-top",-(padding+1));
  			}
  			
  			if (useShadow) {
  				var sh = controls.filter(".peKb_shadow").css("z-index","0");
  				allSlides.before(sh)
  			}
  			
  		}
  		
  		if (useControls) {
			allSlides.before(timerWidget.hide());
			timerWidgetColor=timerWidget.css("color").replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g, _rgb2hex);
		
			
			var overlay = timerWidget.find(".peKb_overlay");
			timerWidgetSize = overlay.width();
			
			if (document.createElement('canvas').getContext) {
				timerWidgetCanvas = $('<canvas width="'+timerWidgetSize+'" height="'+timerWidgetSize+'"></canvas>');
				
				overlay.after(timerWidgetCanvas);
				timerWidgetCanvas = timerWidgetCanvas[0].getContext('2d');
			} else {
				timerWidgetSprite = $('<div class="peKb_sprite"></div>');
				timerWidget.find(".peKb_overlay").after(timerWidgetSprite);
			}
			
			controls.find(".peKb_prev, .peKb_next")
				.click(prevNextHandler)
			.end();
			
			controlsHeight = controls.height();
  		
  			var pager = controls.find("ul.peKb_slideBtns").empty();
  			var closeVideo = controls.find(".peKb_videoClose");
  			var mainPanel = controls.find(".peKb_mainPanel");
  		
  			var closeVideoHideProp =  ($.browser.msie && $.browser.version >= 8 && $.browser.version < 9 ) ? "top" : "margin-top";
  		
  			closeVideo.find("a").click(stopVideo).end();
  			
  			if (innerControls) {
  				closeVideo.fadeOut(0);
  			} else {
  				closeVideo.css(closeVideoHideProp,-controlsHeight);
  			}
  		}
  		
  		var rw = w-2*padding;
		var rh = h-2*padding-controlsHeight;
		
		if (useShadow) {
			var shadow = t.find(".peKb_shadow");
			shadow.width(w).find(".peKb_middle").width(w-shadow.find(".peKb_left").width()-shadow.find(".peKb_right").width());
		} 
		
		//allSlides.after(thumbOverlay)
		t.append(thumbOverlay);
		
		if (thumbOverlay) {
			var offs = t.offset();
			offs.top = offs.top+rh+padding-thumbOverlay.height()+13;
			if (innerControls) offs.top -= controlsHeight - 10;
			thumbOverlay.data("top",offs.top);
			thumbOverlay.offset(offs);
			thumbOverlay.hide();
		}
		
		flashEnabled = $.flash.available;
		
		var box = {
			width: rw,
			height: rh,
			left:0,
			overflow: "hidden",
			visible: true,
			display: "block",
			opacity: 0
		};
		
		var direction="next";
		
		var jqSlides = allSlides.width(rw).height(rh).find(" > div");
		var frame = $('<div class="peKb_frame"></div>').width(rw).height(rh);
		//allSlides.prepend(frame);
		
		t
			.find("div.peKb_slides")
				.append(spinner)
				.append(videoOverlay)
				.append(captionOverlay)
				.bind("mouseenter",eventHandler)
				.bind("mouseleave",eventHandler)
			.end();
		
		var captionMarginBottom = 0;
		var captionMarginLeft = 0;
		
		if (captionOverlay) {
			captionMarginBottom = parseInt(captionOverlay.css("margin-bottom").replace(/px/));
			captionMarginLeft = parseInt(captionOverlay.css("margin-left").replace(/px/));
		}
		
		
		if (!kenburns) {
			allSlides.wrapInner('<div class="peKb_slides"></div>');
			var inner = allSlides.find("> div");
			inner.width(rw).height(rh).css({
				position:"absolute",
				"border-width": 0,
				"border-radius": 0,
				"background-image": "none",
				"background-color": frame.css("background-color"),
				"z-index":1,
				top:padding,
				left:padding,
				padding:"0px",
				margin:"0px"
			}).show();
			if (captionOverlay) captionOverlay.width(rw).height(rh);
		} else {
			jqSlides.css("margin-left",padding);
			if (captionOverlay) captionOverlay.width(rw).height(rh).css("margin-top",padding).css("margin-left",padding);
		}
		
		allSlides.prepend(frame);
  		
  		var bgcolor = frame.css("background-color").replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g, _rgb2hex);
  		
  		function doTransition(from,to,tType) {
			tType = from ? tType : "fade";
			transitionSpeed = tType == "swipe" ? 700 : 1000;
			
			currentSlideEl = to;
			
			function reset() {
				unlock();
				if (from) {	
					from.fadeOut(0);
					from.find("img:eq(0)").css("margin-left",0);
				}
			}
			
			if (from) {
				var kb = from.find("img:eq(0)").data("peKenburnsImg");
				if (kb) kb.stop();
			}
			
			if (to.find("a.video").length > 0) {
				videoOverlay.empty().removeClass("peKb_noBack").fadeIn(0);
				if (!flashEnabled) {
					var gotcha = $("<a>");
					gotcha.attr("href",to.find("a.video").attr("href")).attr("target","_blank");
					gotcha.width(videoOverlay.width()).height(videoOverlay.height()).css("position","absolute").show();
					videoOverlay.empty().append(gotcha);
				} else if (to.find("a.video").hasClass("autostart")) {
					if (videoPlayback) {
						setTimeout(function() {
							videoOverlay.triggerHandler("click");
						},500);
					} else {
						videoOverlay.triggerHandler("click");
					}
				}
			} else if (to.find("a").length > 0) {
				videoOverlay.fadeIn(0);
				
				var gotcha = $("<a>");
				
				// copy event listeners attached to original element
				$.each(to.find("a").data("events"), function(type, event) {
					$.each(event, function(j, h) {
						gotcha.bind(type,h.handler);
					});
				});
								
				gotcha.attr("href",to.find("a").attr("href")).attr("target",to.find("a").attr("target"));
				gotcha.width(videoOverlay.width()).height(videoOverlay.height()).css("position","absolute").show();
				videoOverlay.empty().addClass("peKb_noBack").append(gotcha);
			} else {
				videoOverlay.empty().removeClass("peKb_noBack").fadeOut(0);
			}
			
			switch (tType) {
				case "fade":
					if (from) from.css(box).css("opacity",1).fadeTo(transitionSpeed,0);
					to.css(box).css("opacity",0).fadeTo(transitionSpeed,1,unlock);
				break;
				case "whitefade":
					to.css(box).css("opacity",0);
					from.css(box).css("opacity",1).fadeTo(transitionSpeed/2,0,"easeOutQuad",function () {
						to.fadeTo(transitionSpeed/2,1,"easeInQuad",unlock);
					})
				break;
				case "flyBy":
					if (direction == "next") {
						if (from) from.css(box).css("opacity",1);
						to.css(box).css("left",50);
						if (from) from.animate({left:-100,opacity:0},transitionSpeed,"easeOutCubic");
						to.animate({left:0,opacity:1},transitionSpeed,"easeOutCubic",unlock);
					} else {
						if (from) from.css(box).css("opacity",1);
						to.css(box).css("left",-50);
						if (from) from.animate({left:100,opacity:0},transitionSpeed,"easeOutCubic");
						to.animate({left:0,opacity:1},transitionSpeed,"easeOutCubic",unlock);
					}
				break;
				case "swipe":
					
					var img;
					var flyBy = 100;
					
					to.css(box);
					if (from) from.css(box).css("opacity",1);
					
					
					img = (direction == "next") ? to.find("img:eq(0)") : from ? from.find("img:eq(0)") : null;
					
					function prevTransition(now, fx) {
						var size = Math.round(now*rw);
						var offs = Math.round(flyBy*(1-now));
						to.css("left",-offs).width(size+flyBy);
						if (img) img.css("margin-left",-size);
						if (from) {
							from.css("opacity",0.5+0.5*(1-now)).css("left",size+flyBy-offs).width(rw-size);
						}
						
					}
					
					function nextTransition(now, fx) {
						var size = Math.round(now*rw);
						var offs = Math.round(flyBy*(1-now));
						to.css("left",rw-size+offs).width(size);
						if (img) img.css("margin-left",size-rw);
						if (from) {
							from.css("opacity",0.5+0.5*(1-now)).css("left",offs-flyBy).width(rw-size+flyBy);
						}
					}
					
					to.animate({opacity: 1},{
						duration: transitionSpeed,
						easing: "easeOutCubic",
						complete: reset,
						step: direction == "next" ? nextTransition : prevTransition
						
					});
					
					
					
				break;
	
					
			}
		}
		
		function resourceLoaded(e) {
			locked = false;
			showSlide(parseInt(e.target.id),true);
		}
		
		function unlock() {
			locked = false;
		}
		
		function preloadResource(idx,cb) {
			var resource = slides[idx].resource;
			if (!resource) return true;
			var lazyLoadSrc = $(resource).attr("src") ? "" : $(resource).attr("data-src");
			if (lazyLoadSrc) {
				$(resource).attr("src",lazyLoadSrc);
			}
			if (!resource.complete) {
				if (cb) $(resource).one("load",cb);
			} 
			return resource.complete;
		}
		
		function timerWidgetPosition() {
			if (!panelDisabled && currentSlideA && !timerWidgetLocked) {
				timerWidget.show().offset(currentSlideA.offset());
			}
		}
		
		function timerWidgetUnlock() {
			timerWidgetLocked = false;
			timerWidgetPosition();
		}
		
		function hilightButton(idx) {
			if (pager) {
				currentSlideA = pager.find("a").removeClass("peKb_currentSlide").eq(idx).addClass("peKb_currentSlide");
				
				timerWidgetUpdate(0);
				timerWidgetPosition();
			}
		}
		
		function showCaption(idx) {
			if (!captionsResized) return;
			
			var currentCaption = slides[idx].caption;
			var real;
			var back;
				
			if (currentCaption) {
				real = currentCaption.find(".peKb_real");
				back = currentCaption.find(".peKb_background");
				
				real.css("margin-left",10).css("opacity",0).width(0).show();
				back.css("margin-left",100).css("opacity",0).width(0).show();
				
				real.stop(true).delay(hoverMode ? 500 : 500).animate({"margin-left":0,opacity:1,width:back.data("width")},1000,"easeOutCubic");
				back.stop(true).delay(hoverMode ? 0 : 200).animate({"margin-left":0,opacity:0.5,width:back.data("width")},1000,"easeOutCubic");
			}
			
			if (previusCaption) {
				real = previusCaption.find(".peKb_real");
				back = previusCaption.find(".peKb_background");
				
				
				real.stop(true).fadeTo(hoverMode ? 0 : 500,0);
				back.stop(true).fadeTo(hoverMode ? 0 : 500,0);	
				
			}
			
			previusCaption = currentCaption;
			
		}
		
		function showSlide(idx,loaded) {
			if (previousSlide != idx && !locked) {
				locked = true;
			
				if (!loaded && !preloadResource(idx,resourceLoaded)) {
					spinner.fadeIn(500);
					return;
				}
				
				stopVideo();
				
				
				preloadResource(prevNextIndex(idx,"next"));
				
				if (!hoverMode) {
					hilightButton(idx);
					showCaption(idx);
				}
				
				currentSlide = previousSlide = idx;
				spinner.fadeOut(100);
				
				var from = jqSlides.filter(".peKb_active").removeClass("peKb_active");
				var to = jqSlides.eq(idx).addClass("peKb_active");
				
				var tType = to.attr("data-transition") || "swipe";
				var kbTarget; 
				
				if (kenburns) {
					kbTarget = to.find("img"); 
					if (kbTarget) {
						tType = "fade";
					}
				}
				
				
				var delay = to.attr("data-delay");
				if (delay) {
					countMax = countdown = parseFloat(delay)*20;
				} else {
					countMax = countdown = -1;
					timerWidgetUpdate(360);
				}
				
				
				// msie bug fix ....
				to.show().fadeOut(0);
				
				if (kbTarget) {
					kbTarget = kbTarget.peKenburnsImg({
						zoom:to.attr("data-zoom"),
						align:to.attr("data-align"),
						pan:to.attr("data-pan"),
						duration:to.attr("data-duration"),
						paused:hoverMode,
						api:true
					});
					if (hoverMode && focused) kbTarget.resume();
				}
				
				
				
				doTransition(from[0] ? from : null,to,tType);
				
				// hide panel on first time
				if (hideControlsOnFirst) {
					hideControlsOnFirst = false;
 					hideControlsOnFirstTimer = setTimeout(hideControls,1000);
				}
				
				
			}
		}
		
		function timerWidgetUpdate(angle) {
			
			if (!pager) return;
			
			if (timerWidgetCanvas) {
				
				var size=timerWidgetSize-1;
				var cx=timerWidgetSize/2;
				var cy=cx+1;
				
				timerWidgetCanvas.clearRect(0, 0, timerWidgetSize, timerWidgetSize);
				if (angle > 0) {
					timerWidgetCanvas.beginPath();
					timerWidgetCanvas.moveTo(cx,cy);
					
					timerWidgetCanvas.arc(cx,cy,size/2,(270/360)*2*Math.PI,((angle+270)/360)*2*Math.PI,false);
		
					timerWidgetCanvas.lineTo(cx,cy);
					timerWidgetCanvas.closePath();
					timerWidgetCanvas.fillStyle = timerWidgetColor;
					timerWidgetCanvas.fill();
				}
				
			} else {
				timerWidgetSprite.css("background-position-y","-"+Math.round(12-(12*(angle/360)))*timerWidgetSize+"px");
			}
			
			
		}
		
		function timerController() {
			if (paused || countdown < 0) return;
			timerWidgetUpdate(360*(countMax-countdown)/countMax);
			
			if (countdown == 0) {
				showSlide(prevNextIndex(currentSlide,"next"));
			}
			countdown--;
		}
		
		function prevNextIndex(from,dir) {
			var nextIdx = from;
			nextIdx += (dir == "prev" ? -1 : 1);
			nextIdx %= slides.length;
			if (nextIdx < 0) nextIdx += slides.length;
			return nextIdx;
		}
		
		function prevNextHandler(e) {
			direction = $(e.currentTarget).hasClass("peKb_next") ? "next" : "prev";
			showSlide(prevNextIndex(currentSlide,direction));
			return false;
		}
		
		function navigatorHandler(e) {
			var idx = parseInt(e.currentTarget.id);
			direction = idx >= currentSlide ? "next" : "prev";
			showSlide(idx);
			return false;
		}
		
		function resizeCaptions() {
			var caption;
			var animated;
			
			if (captionDelayedResize) clearTimeout(captionDelayedResize);
			for (var i = 0;i<slides.length;i++) {
				caption = slides[i].caption;
				if (caption) {
					caption.width(rw);
					
					animated = false;
					
					var real = caption.find(".peKb_real");
					var back = caption.find(".peKb_background");
					
					if (caption == previusCaption) {
						real.stop().css("margin-left",0).css("opacity",1);
						back.stop().css("margin-left",0).css("opacity",0.5);
						animated = true;
						
					}
					
					var cw;
					var ch;
					
					if (hoverMode) {
						cw = rw-2*captionMarginBottom;
					} else {
						real.width("auto");
						back.width("auto");
						cw = real.outerWidth();
					}
					
					ch = real.outerHeight();

					back.width(cw).height(ch).data("width",cw);
					
					caption.width(cw).height(ch);
					
					caption.css("margin-left",(rw-back.width())/2);
					caption.css("margin-top",(rh-back.height()-captionMarginBottom - (innerControls ? (controlsHeight-10) : 0)));
					
					if (!animated) {
						real.fadeOut(0);
						back.fadeOut(0);

					}
				}
			}
			captionsResized = true;
		}
		
		function parseSlide(idx,el) {
			var jqEl = $(el).attr("id",idx);
			var caption = jqEl.find(" > h1").detach();
			
			if (captionOverlay && caption.length > 0) {
				caption.wrap('<div class="peKb_real" />');
				caption = caption.parent();
				caption.wrap('<div class="peKb_holder" />');
				caption = caption.parent();
				caption.append('<div class="peKb_background" />');
				
				captionOverlay.append(caption);
				
				caption.find(".peKb_real").fadeOut(0);
				caption.find(".peKb_background").fadeOut(0);
			
			} else {
				caption = false;
			}
			
			
			var resource = jqEl.find("img").attr({id:idx})[0];
			var thumb = jqEl.attr("data-thumb");	
			slides[idx] = {caption:caption, resource:resource, thumb:thumb};
			if (pager) pager.append('<li><a href="#" '+ (idx == 0 ? 'class="peKb_currentSlide"' : '') +' id="'+idx+'">1</a></li>');
		}
		
		function clearVideo() {
			spinner.empty();
			videoPlayback = false;
			if (!focused) paused = false;
		} 
		
		function showHideCloseButton(show) {
			if (innerControls) {
				if ($.browser.msie) {
					closeVideo[show ? "show" : "hide"]();
				} else {
					closeVideo.stop().fadeTo(300,show ? 1: 0,"easeOutCubic");
				}
				showHideControls(!show)
			
			} else {
				var anim = {};
				anim[closeVideoHideProp] = (show ? 0 : -controlsHeight);
				closeVideo.stop().animate(anim,300,"easeOutCubic");
			}
		}
		 
		function showHideControls(show,speed) {
			if (!mainPanel) return;
			
			panelDisabled = !show;
			
			if (!show) showHideThumb(false);
			speed = speed == null ? 300 : speed;
			
			mainPanel.stop();
			if (!innerControls && videoPlayback) showHideCloseButton(show);
			
			timerWidget.hide();
			timerWidgetLocked = true;
			
			if (innerControls) {
				panelDisabled = false;
				if (!($.browser.msie && $.browser.version < 8)) {
					controls.css("z-index",show ? 209 : 0);
					if (show && useShadow) allSlides.before(controls.filter(".peKb_shadow").css("z-index","0"));
				}	

				if (show) {
					
					controls.find(".peKb_holder").show();
					timerWidgetUnlock();
					
				} else {
					controls.find(".peKb_holder").hide();
				}
				
			} else {
				mainPanel.animate({"margin-top":(show ? 0 : -controlsHeight)},{
					duration: speed,
					easing: "easeOutCubic",
					complete: timerWidgetUnlock
				});
			}
		}
		 
		function showCloseButton() {
			showHideCloseButton(true);
		}
		
		function hideCloseButton() {
			showHideCloseButton(false);
		}
		
		function showControls(speed) {
			showHideControls(true,speed);
		}
		
		function hideControls(speed) {
			showHideControls(false,speed);
		}
		
		function stopVideo() {
			if (videoPlayback) {
				spinner.css("background-color","none");
				spinner.fadeOut(500,clearVideo);
				videoOverlay.fadeIn(0);
				hideCloseButton();
				var kb = jqSlides.filter(".peKb_active").find("img:eq(0)").data("peKenburnsImg");
				if (kb) kb.resume();
			}
			return false;
		}
		
		function loadResource(e) {
			var el = $(e.currentTarget);
			
			if (el.hasClass("video")) {
				loadVideo(el[0].href,el.hasClass("hd"),el.hasClass("autoplay"),el.hasClass("loop"));
				return false;
			}
			
			return true;
		}
		
		function loadVideo(url,hd,autoPlay,loop) {
	
			if (videoPlayback) return false;
		
			var id,type;
			
			if (id = url.match(/http:\/\/www.youtube.com\/watch\?v=([\w|\-]+)/)) {
				type = "youtube" ;
			} else if (id = url.match(/http:\/\/vimeo.com\/(\w+)/)) {
				type = "vimeo";
			}
			if (type) {
			
				stopVideo();
			
				videoPlayback = true;
				paused = true;
				
				var kb = jqSlides.filter(".peKb_active").find("img:eq(0)").data("peKenburnsImg");
				if (kb) kb.pause();
				
				spinner.css("background-color",bgcolor);
				spinner.fadeIn(500);
				videoOverlay.fadeOut(0);
				showCloseButton();
			
				var api = spinner.vid({
					type    : type,
					videoId : id[1],
					hd: hd,
					autoPlay:autoPlay,
					loop:loop,
					bgcolor:bgcolor
				 });	
			}	
		}
		
		function videoOverlayClick() {
			var videoLink = currentSlideEl.find("a.video");
			if (videoLink.length > 0) {
				videoLink.trigger("click");
			}
		}
		
		function thumbOverlayDisable() {
			thumbActive = false;
			thumbOverlay.hide();
		}
		
		function showHideThumb(show,delay) {
			if (!hasActiveThumb || !thumbOverlay) return;
			if (show) {
				thumbOverlay.stop(true);
				if (thumbUseFade) {
					thumbOverlay.fadeTo(500,1,"easeOutQuad");
				} else {
					thumbOverlay.show();
				}
			} else {
				if (parseInt(delay) > 0) {
					thumbOverlay.delay(delay);
				} else {
					thumbOverlay.stop(true);
				}
				if (thumbUseFade) {
 					thumbOverlay.fadeTo(300,0,"easeOutQuad",thumbOverlayDisable);
				} else {
					thumbOverlay.queue(thumbOverlayDisable);
				}
			}
		}
		
		function thumbImgLoaded(e) {
			
			thumbDiv.html(thumbImg);
			
			if (t.attr("data-thumb") != "fixed" ) {
				thumbImg.peKenburnsImg({
					zoom:"in",
					align:"top,center",
					pan:"center,center",
					duration:"10"
				});
			}
			
			
			thumbDiv.stop(true).fadeTo(0,0).fadeTo(300,1,"easeInQuad");
			
			
		
		}
		
		function thumbPreviewProxy(e) {
			if (currentSlideA) currentSlideA.triggerHandler(e.type);
		}
		
		function thumbPreview(e) {
			var idx=e.currentTarget.id;
			switch (e.type) {
				case "mouseenter":
					var thumb = slides[idx].thumb;
					if (!thumb) return;
					
					hasActiveThumb = true;
					showHideThumb(true);
					
					var tw = $(e.currentTarget).width();
					
					var offs = $(e.currentTarget).offset();
					
					offs.top = thumbOverlay.data("top");
					offs.left = offs.left - (thumbOverlay.width()-tw)/2;
					
					if (thumbActive != thumb) {
						if (thumbImg.data("peKenburnsImg")) {
							thumbImg.data("peKenburnsImg").destroy();
						}
						thumbImg = $("<img>");
						thumbDiv.html("");
						thumbImg.load(thumbImgLoaded);
						thumbImg.attr("src",thumb);
					}
					
					
					thumbOverlay.offset(offs);
					thumbActive = thumb;
					
				break;
				case "mouseleave":
					showHideThumb(false,200);
				break;
			}
		}
	
		function eventHandler(e) {
			hideControlsOnFirst = false;
			if (hideControlsOnFirstTimer) clearTimeout(hideControlsOnFirstTimer);
			
			if (e.currentTarget == t[0]) {
				switch (e.type) {
					case "mouseenter":
						if (pauseOnControls) paused = true;
						showControls();
					break;
					case "mouseleave":
						if (!videoPlayback && pauseOnControls) paused = false;
						hideControls();
					break;
				}
			} else {
				switch (e.type) {
					case "mouseenter":
						if (hoverMode) {
							paused = false;
							kbProxy().resume();
							showCaption(0);
						} else {
							if (pauseOnImage) paused = true;
						}
						focused = true;
					break;
					case "mouseleave":
						if (hoverMode) {
							paused = true;
							kbProxy().pause();
							showCaption(1);
						} else {
							if (!videoPlayback && pauseOnImage) paused = false;
						}
						focused = false;
					break;
				}
			}
		}
		
		function kbProxy() {
			var kbTarget;
			if (currentSlideEl) {
				kbTarget = currentSlideEl.find("img:eq(0)");
				if (kbTarget) kbTarget = kbTarget.data("peKenburnsImg");
			}
			return kbTarget || false;
		}
		 
		$.extend(self, {
			init: function(e) {
				
				// silly ie9 fix
				if ($.browser.msie && $.browser.version > 8) {
					jqSlides
						.find("img")
							.each(function () {
								var jqImg = $(this);
								if (!jqImg.attr("data-src")) {
									jqImg.attr("data-src",jqImg.attr("src"));
									jqImg.removeAttr("src");
								}
							})
						.end();
				}
				
				spinner.width(rw).height(rh);
				videoOverlay.width(rw).height(rh);
				
				
				jqSlides
					.width(rw)
					.height(rh)
					.show()
					
					.fadeOut(0)
					.removeClass("peKb_active")
					
					.find("img[src*='blank.png']")
						.removeAttr("src")
					.end()
					.find("a")
						.click(loadResource)
					.end()
					.each(parseSlide)
				.end();
				
				if (useControls && mainPanel) {
					mainPanel.css("margin-left",(w-mainPanel.width())/2);
					if (innerControls) {
						//ie shadow fix
						if ($.browser.msie && $.browser.version < 8) controls.filter(".peKb_shadow").css("z-index","-1");
						
						closeVideo.css("z-index",204);
						closeVideo.css("position","absolute");
						closeVideo.css("margin-left",0);
						closeVideo.css("margin-top",-h+closeVideo.height()+padding);
						closeVideo.css("margin-left",padding);
						closeVideo.detach();
						
						// bugger ??
						//controls.after(closeVideo);
						target.append(closeVideo);
					
						closeVideo = target.find(".peKb_videoClose");
						closeVideo.addClass("peKb_videoCloseInner");
						
					}
				}
				
				if (conf.externalFont) {
					captionDelayedResize = setTimeout(resizeCaptions,10000);
				} else {
					resizeCaptions();
				}
				
				if (pager) {
					var allAs = pager.find("a");
					
					allAs.click(navigatorHandler);
					
					if (thumbOverlay) {
						allAs
							.bind("mouseenter",thumbPreview)
							.bind("mouseleave",thumbPreview);
							
						timerWidget
							.bind("mouseenter",thumbPreviewProxy)
							.bind("mouseleave",thumbPreviewProxy);
					}
					
				}
				
				if (flashEnabled) videoOverlay.hide().click(videoOverlayClick);
				
				
				var controlsEventHandler = true;
				
				var controlsMode = t.attr("data-controls");
				
				if (iDev) {
					controlsMode = (controlsMode == "over" || controlsMode == "hideOnFirst" ) ? "always" : controlsMode;
				}
				
				switch (controlsMode) {
					case "over":
						hideControls(0);
					break;
					case "hideOnFirst":
						hideControlsOnFirst = true;
					break;
					case "disabled":
						hideControls(0);
					default:
						controlsEventHandler = false;
					break;
				}
				
				if (controlsEventHandler) {
					t
						.bind("mouseenter",eventHandler)
						.bind("mouseleave",eventHandler);
				}
				
				paused = true;
				setInterval(timerController,50);
				self.start();
			},
			
						
			start: function() {
				paused = hoverMode;
				showSlide(0);
			},
			
			fontsLoaded: function() {
				resizeCaptions();
				showCaption(currentSlide);
			},
			
			
			pauseTimer: function() {
				paused = true;
			},
			
			resumeTimer: function() {
				paused = false;
			},
			
			pause: function() {
				var kb=kbProxy();
				kb && kb.pause();
				self.pauseTimer();
			},
			
			resume: function() {
				var kb=kbProxy();
				kb && kb.resume();
				self.resumeTimer();
			},
			
			prev: function() {
				self.resumeTimer();
				showSlide(prevNextIndex(currentSlide,"prev"));
			},
			
			next: function() {
				self.resumeTimer();
				showSlide(prevNextIndex(currentSlide,"next"));
			},
			
			show: function(idx) {
				self.resumeTimer();
				idx = parseInt(idx)-1;
				if (idx >=0 && idx < slides.length) showSlide(idx);
			},
			
			length: function() {
				return (slides && slides.length) || 0;
			}
			
			
		
		});
		
		if (t.width() == 0 && t[0].width == 0) {
			t.one("load",self.init);
		} else {
			self.init();
		}
		
	}
		
	
	// jQuery plugin implementation
	$.fn.peKenburnsSlider = function(conf) {
		// return existing instance
		
		var api = this.data("peKenburnsSlider");
		if (api) { 
			api.start();
			return api; 
		}

		conf = $.extend(true, {}, $.pixelentity.kenburnsSlider.conf, conf);
		
		// install kb for each entry in jQuery object
		this.each(function() {
			api = new KenBurnsSlider($(this), conf); 
			$(this).data("peKenburnsSlider", api); 
		});
		
		return conf.api ? api: this;		 
	};
		
})(jQuery);