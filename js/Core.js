

var Core = Core || {

    
    init: function() {
        var _this = this;
        this.determineSection();
        this.setMenuFocus();
        this.demoForm();
        this.moveFooter();
        this.resizeIframes();
        this.lastHeight = $(document).height();
        this.checkChanges();
        this.resizeMenuNav();
        $(window).resize(function() {
            _this.moveFooter();
        });
    },


    checkChanges: function() {
        if ($(document).height() != Core.lastHeight) {
            Core.lastHeight = $(document).height();
            _this.moveFooter();
        }

        setTimeout(Core.checkChanges, 500);
    },

    determineSection: function() {
        var sections = $('.sections a');
        $.each(sections, function(i, section) {
            if($(section).attr('href') == window.location.pathname) {
                $(section).addClass('active');
            }
        });
    },

    moveFooter: function() {
        var footer = $(".footer");
        if ($(document).height() <= $(window).height()) {
            footer.css({bottom: 0});
        } else {
            footer.removeAttr("style");
        }
    },

    isElementVisible: function(elementToBeChecked) {
        var TopView = $(window).scrollTop();
        var BotView = TopView + $(window).height();
        if ($(elementToBeChecked).offset() != undefined) {
            var TopElement = $(elementToBeChecked).offset().top;
            var BotElement = TopElement + $(elementToBeChecked).height();
            return ((BotElement <= BotView) && (TopElement >= TopView));
        } else {
            return false;
        }
    },

    checkIfContentIsVisible: function() {
        var _this = this;
        var content_section = $('.content_section .documentation_header');
        $.each(content_section, function(i, section) {
            var id = $(section).attr('id');
            if(Core.isElementVisible('.content_section .documentation_header#'+id)) {
                $('.sidebar-nav-items a').removeClass('active');
                $('.sidebar-nav-items a[href="#'+id+'"]').addClass('active');
            }
        });
    },

    setMenuFocus: function() {
        var _this = this;
        var timer = 0;
        $(window).scroll(function() {
            function checkNow () {            
                _this.checkIfContentIsVisible();
            }
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(checkNow, 300);

            var $el = $('#stickyheader');
            if ($(this).scrollTop() >= 60){
                $el.css({'top': '0px'});
            }
            if ($(this).scrollTop() < 60)
            {
                $el.css({'top': (60 - $(this).scrollTop()) + 'px'});
            }

            $el = $('.menu');
            var top = ((60 + 40)-$(this).scrollTop());
            if ($(this).scrollTop() >= 60){
                top = 40;
            }
            $el.css({'margin-top': top + 'px'});

            _this.resizeMenuNav();
        });
    },

    resizeMenuNav: function() {
        var size = $(window).height();
        var footerSize = $(window).scrollTop() + $(window).height() - $(".footer").offset().top;
        if (footerSize > 0) size -= footerSize;
        size -= ($(".sidebar-nav").offset().top - $(window).scrollTop());
        $(".sidebar-nav-items").css("max-height", size);
    },

    resizeIframes: function() {
        var isSmall = function() {
            return matchMedia(Foundation.media_queries['small']).matches && !matchMedia(Foundation.media_queries.medium).matches;
        };

        var isMedium = function() {
            return matchMedia(Foundation.media_queries['medium']).matches && !matchMedia(Foundation.media_queries.large).matches;
        };

        var isLarge = function() {
            return matchMedia(Foundation.media_queries['large']).matches;
        };

        if (isMedium() || isLarge()) {
            $("iframe").each(function() {
                $(this).height( $(this).parent().parent().siblings(".documentation_header").height() );
            });
        } else if (isSmall()) {
            $("iframe").each(function() {
                $(this).css("width", "100%");
            });
        }
    },

    demoForm: function() {
        _this = this;

        $('.demo .submit_demo').click(function() {

            var demo = $(this).parents(".demo");
            var form = demo.find("form");
            var results = demo.find(".results");
            var method = form.data('method');
            var isjson = form.data('isjson');
            var endpoint = form.attr('action');
            var data = '';
            var datatype = '';
            var headers = {};
            // console.log(method);
            // console.log(isjson);
            // console.log(endpoint);



            if(isjson) {
                datatype = 'application/json';
                data = {};
                $(form).find('input[type="text"]').each(function(index,input) {
                    var name = $(input).attr('name');
                    var value = $(input).val();
                    data[name] = value
                });
                data = JSON.stringify( data );
                data = {json: data};
            } else {
                data = $(form).serialize();
                datatype = "application/x-www-form-urlencoded";
            }

            $.ajax({
                type: method,
                url: endpoint,
                data: data,
                dataType: datatype,
                xhrFields: {
                    withCredentials: true
                },
                beforeSend: function(xhr) {
                    demo.find("input[data-type='header']").each(function(index, header) {
                        xhr.setRequestHeader($(header).attr("name"), $(header).val());
                    });
                },
                error: function (responseData, textStatus, errorThrown) {
                    results.addClass("error-results");
                    results.show();
                    if (responseData.status == 200) {
                        results.removeClass("error-results");
                        var text = responseData.responseText;
                        if (responseData.getResponseHeader("Content-Type").indexOf("json") >= 0) {
                            text = "<pre class='hljs json'>" + JSON.stringify(JSON.parse(text), undefined, 4) + "</pre>";
                        }
                        results.html("Returned: " + responseData.status + " " + responseData.statusText + "<br/><br/>" + text);
                        $(results).find("pre").each(function(i, block) {
                            hljs.highlightBlock(block);
                        });
                    } else {
                        results.html("Error: " + responseData.status + " " + responseData.statusText);
                    }

                    _this.moveFooter();
                }
            });


        });
    }

};


















