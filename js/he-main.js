$(document).ready(function(){
    
    $('#menu-toggle').on('click', function(){
        $('#menu-wrap').slideToggle(500);
        $(this).hide().toggleClass('open').fadeIn();
    })
   
});
