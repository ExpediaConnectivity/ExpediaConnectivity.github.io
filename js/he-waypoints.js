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