(function($) {
	$.fn.hoverIntent = function(f,g) {
		// default configuration options
		var cfg = {
			sensitivity: 7,
			interval: 100,
			timeout: 0
		};
		// override configuration options with user supplied object
		cfg = $.extend(cfg, g ? { over: f, out: g } : f );

		// instantiate variables
		// cX, cY = current X and Y position of mouse, updated by mousemove event
		// pX, pY = previous X and Y position of mouse, set by mouseover and polling interval
		var cX, cY, pX, pY;

		// A private function for getting mouse position
		var track = function(ev) {
			cX = ev.pageX;
			cY = ev.pageY;
		};

		// A private function for comparing current and previous mouse position
		var compare = function(ev,ob) {
			ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
			// compare mouse positions to see if they've crossed the threshold
			if ( ( Math.abs(pX-cX) + Math.abs(pY-cY) ) < cfg.sensitivity ) {
				$(ob).unbind("mousemove",track);
				// set hoverIntent state to true (so mouseOut can be called)
				ob.hoverIntent_s = 1;
				return cfg.over.apply(ob,[ev]);
			} else {
				// set previous coordinates for next time
				pX = cX; pY = cY;
				// use self-calling timeout, guarantees intervals are spaced out properly (avoids JavaScript timer bugs)
				ob.hoverIntent_t = setTimeout( function(){compare(ev, ob);} , cfg.interval );
			}
		};

		// A private function for delaying the mouseOut function
		var delay = function(ev,ob) {
			ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
			ob.hoverIntent_s = 0;
			return cfg.out.apply(ob,[ev]);
		};

		// A private function for handling mouse 'hovering'
		var handleHover = function(e) {
			// copy objects to be passed into t (required for event object to be passed in IE)
			var ev = jQuery.extend({},e);
			var ob = this;

			// cancel hoverIntent timer if it exists
			if (ob.hoverIntent_t) { ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t); }

			// if e.type == "mouseenter"
			if (e.type == "mouseenter") {
				// set "previous" X and Y position based on initial entry point
				pX = ev.pageX; pY = ev.pageY;
				// update "current" X and Y position based on mousemove
				$(ob).bind("mousemove",track);
				// start polling interval (self-calling timeout) to compare mouse coordinates over time
				if (ob.hoverIntent_s != 1) { ob.hoverIntent_t = setTimeout( function(){compare(ev,ob);} , cfg.interval );}

			// else e.type == "mouseleave"
			} else {
				// unbind expensive mousemove event
				$(ob).unbind("mousemove",track);
				// if hoverIntent state is true, then call the mouseOut function after the specified delay
				if (ob.hoverIntent_s == 1) { ob.hoverIntent_t = setTimeout( function(){delay(ev,ob);} , cfg.timeout );}
			}
		};

		// bind the function to the two event listeners
		return this.bind('mouseenter',handleHover).bind('mouseleave',handleHover);
	};
})(jQuery);


var com = com || {};
com.ecks = com.ecks || {};
com.ecks.pageManager = (function(window, $) {
	//Private Stuff (Will not be seen or accessable by outside)
	//Variables
	var screenHeight,
		screenWidth;

	//DOM Nodes
	var $pages;

	//Methods
	function captureScreen() { //Setup Pages with window size
		screenWidth = $(window).width();
		screenHeight = $(window).height();
		$pages.find('.page').width(screenWidth).height(screenHeight);
	}

	function goToPage(pageId) { //Page Animations
		console.log(pageId);
		var $page = $(pageId),
			pagePos = $page.position().top;

		//Animates Pages
		$pages.stop().animate({
			top: pagePos * -1
		}, 1000);
	}

	return { //Public Stuff
		init: function() {
			//Setup
			window.log("pageManager INIT");

			//turn off scroll bars
			$('body').css('overflow', 'hidden');
			
			//DOM Node Assignments
			$pages = $('#pages'); //Container for the '.page's
			
			//Events
			$(window).resize(captureScreen); //calls captureScreen Method
			
			captureScreen(); //recap screen size
		},
		goToPage: goToPage
	};
})(window, jQuery);

$(document).ready(function() {
	com.ecks.pageManager.init();

	$("#main_nav a").click(function(e) {
		e.preventDefault();

		var $link = $(this), //Assigns information of clicked item to node
			$href = $link.attr("href");

		$('#main_nav li').removeClass('selected');

		$(this).parents(".top-level").addClass('selected');
		
		com.ecks.pageManager.goToPage($href); 
	}).first().click();
	
	$('.top-level').hoverIntent(function() {
		$(this).find('ul').slideDown();	
	}, function() {
		$(this).find('ul').slideUp();
	});
});


