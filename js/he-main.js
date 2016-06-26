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
