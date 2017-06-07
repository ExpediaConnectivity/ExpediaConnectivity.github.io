/* A bunch of vendor provided scripts rolled into a single file */

$(document).ready(function(){
    var toggle = $('#menu-toggle');
    var wrap = $('#menu-wrap');
    
    toggle.on('click', function() {
        wrap.slideToggle(500);
        $(this).hide().toggleClass('open').fadeIn();
    });

    var checkMenuVisibility = function() {
        if (!toggle.hasClass('open') && toggle.is(':visible')) {
            wrap.hide();
        } else {
            wrap.show();
	    }
    };
    $(window).resize(checkMenuVisibility);
    checkMenuVisibility();
});

// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

$(document).ready(function () {
    // filter anchor links for proper id syntax
    $("a[href*='#']:not([href='#'])").click(function () {
        // filter for internal links only
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            // get anchor id
            var hash = this.hash.replace(/\//g, '\\/');
            var target = $(hash);
            target = target.length ? target : $('[name=' + hash.slice(1) + ']');
            if (target.length) {
                var scrollDistance = target.offset().top;
                // pervent window from bottoming out when scrolling
                if ($(document).height() - target.offset().top < $(window).height()) {
                    scrollDistance = $(document).height() - $(window).height();
//                    console.log('Scroll Distance: ' + scrollDistance);
//                    console.log('Document height: ' + $(document).height())
//                    console.log('Window height: ' + $(window).height())
//                    console.log('Anchor Offset: ' + target.offset().top)
//                    console.log('Window Offset: ' + $(window).scrollTop())
//                    console.log('--------------------')
                }
                $('html,body').animate({
                    scrollTop: scrollDistance
                }, 1000);
                return false;
            }
        }
    });
});

$(document).ready(function(){
    $(window).on("load scroll resize change", function () {
        $('.he-active_now').each(function(){
            $(this).removeClass('.he-active_now').addClass('active');
        });
        $('.he-waypoint').each(function (){
            // calculate element position relative to window
            var elementPos = $(this).offset().top;
            var windowPos = $(window).scrollTop();
            var windowHeight = $(window).height();
            //  use decimals for offset,
            //  = % distance from top of window
            var offset = ( $(this).data('offset') ) ? $(this).data('offset') : 0.8 ;
            if (elementPos < (windowPos + windowHeight*offset) ) {
                // activate the element by adding the 'active' class,
                // create 'trigger' for other Helium javascripts to listen to
                $(this).addClass('active').trigger('trigger');
                // option to trigger the event only once
                if ( $(this).hasClass('he-trigger_repeat') ) {
                } else {
                    $(this).removeClass('he-waypoint');
                }
            } else {
                $(this).removeClass('active');
            }
        });
    });
});