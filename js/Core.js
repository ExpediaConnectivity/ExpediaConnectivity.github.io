

var Core = Core || {

    init: function() {
        if ($(document).foundation) {
            $(document).foundation({
                "magellan-expedition": {
                    active_class : 'active',
                    threshold : 0,
                    destination_threshold : 20,
                    throttle_delay : 30,
                    fixed_top : 0,
                    offset_by_height : false,
                    duration : 150,
                    easing : 'swing'
                }
            });
        }

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

    setMenuFocus: function() {
        var _this = this;
        $(window).scroll(function() {
            $el = $('.menu');
            var top = (80-$(this).scrollTop());
            if ($(this).scrollTop() >= 80){
                top = 0;
            }
            $el.css({'margin-top': top + 'px'});

            _this.resizeMenuNav();
        });
    },

    resizeMenuNav: function() {
        var sidebar = $(".sidebar-nav-items");
        if (sidebar.length == 0) {
            return;
        }
        var size = $(window).height();
        var footerSize = $(window).scrollTop() + $(window).height() - $(".footer").offset().top;
        if (footerSize > 0) {
            size -= footerSize;
        }
        size -= sidebar.offset().top - $(window).scrollTop();
        sidebar.css("max-height", size);
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


















