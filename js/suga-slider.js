$.fn.suga = function(options) {
  var settings = $.extend({
      'transitionSpeed': 3000,
      'snap': false
  }, options);

  var $this = $(this);

  // add plugin specific classes
  $this.addClass('slider-logo-wrap');
  $this.children('ul').addClass('suga-slider-group');
  $this.find('li').addClass('suga-slide');

  // caching $$$
  var $slide = $('.suga-slide'),
    $firstEl = $('.suga-slide:first'),
    $group = $('.suga-slider-group'),
    $wrap = $('.suga-slider-wrap');

  var slideWidth = $slide.outerWidth(),
      slideHeight = $('.suga-slide').height(),
      slideCount = $slide.length,
      totalWidth = slideWidth * slideCount;

  // set width on group element
  $group.width(totalWidth);
  $wrap.height(slideHeight);
  $wrap.wrap('<div class="suga-container"></div>');

  // add first class at start
  if (!$group.find($firstEl).hasClass("suga-first")) {
    $group.find($firstEl).addClass("suga-first");
  }

  // lets move baby
  var transitionSnap = function() {
    var $firstEl = $group.find('.suga-first').html();

    $group.find('.suga-first').animate({
      'margin-left': '-' + slideWidth + 'px'
    }, function(){
     $group.append('<li class="suga-slide">' + $firstEl + '</li>');
     $(this).remove();
     $group.find('li:first').addClass("suga-first");

    });
  };

  var transitionScroll = function() {
     var $firstEl = $group.find('.suga-first').html();

    $group.find('.suga-first').animate({
      'margin-left': '-' + slideWidth + 'px'
    }, settings.transitionSpeed, 'linear', function(){
     $group.append('<li class="suga-slide">' + $firstEl + '</li>');
     $(this).remove();
     $group.find('li:first').addClass("suga-first");
     transitionScroll();
    });
  };

  if (settings.snap) {
    window.setInterval(transitionSnap, settings.transitionSpeed);
  } else {
    transitionScroll();
  }
}

$(window).on("load", function(){
  $('#slider-logo-wrap').suga({
    'transitionSpeed': 2000,
    'snap': true
  });
});
