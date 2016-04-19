$(document).ready(function(){
    
    var menu = 0;
    $('#menu-toggle').on('click', function(){
        $('#menu-wrap').slideToggle(500);
        $(this).hide().toggleClass('open').fadeIn();
    })
    $(window).on('resize', function(){
        var window_width = $(window).width();
        if ( window_width >= 865 ) {
            $('#menu-wrap').show();
            $('#menu-toggle').removeClass('open');
        } else {
            $('#menu-wrap').slideUp(0);
        }
    });
    
});