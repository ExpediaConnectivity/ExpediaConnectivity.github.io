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