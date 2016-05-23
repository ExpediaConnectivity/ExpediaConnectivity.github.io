

var Core = Core || {

    init: function() {
        // Initialise
        this.lastHeight = 0;

        // Dom manipulating and handling
        this.cloneSideMenuToOffCanvas();
        this.handleEvents();
        $(document).foundation({
            "magellan-expedition": {
                active_class : 'active',
                threshold : 0,
                destination_threshold : 40,
                throttle_delay : 30,
                fixed_top : 0,
                offset_by_height : false,
                duration : 150,
                easing : 'swing'
            }
        });

        // Set size
        this.demoForm();
        this.onResize();
        this.onScroll();
        this.checkChanges();
        $("a.card-header").each(function(i, el) {
            if ($(el).html().includes("(Experimental)")) {
                $(el).html($(el).html().replace("(Experimental)", ""));
                $(el).after("<span class='experimental-api' title='Experimental APIs may break or be removed without notice.'>&nbsp;</span>");
            }
        });
        $(document).tooltip();
    },

    handleEvents: function() {
        var _this = this;
        var resizeTimer, scrollTimer;

        $(window).resize(function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() { _this.onResize(); }, 10);
        });
        $(window).scroll(function() {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(function() { _this.onScroll(); }, 10);
        });
    },

    // Check if document height changed
    checkChanges: function() {
        var _this = this;
        var newHeight = $(document).height();
        if (newHeight != this.lastHeight) {
            this.lastHeight = newHeight;
            this.onResize();
        }
        // Check for Google Translate modifications
        if ($(document.body).css("top") != "0px" && $(document.body).css("top") != "auto") {
            $(".menu").css("top", $(document.body).css("top"));
        }
        try {
            if ($("html").hasClass("translated-ltr") || $("html").hasClass("translated-rtl")) {
                lang = google.translate.TranslateElement().f;
                if (typeof lang != "undefined" && lang != this.previouslang) {
                    result = ga('send', 'event', 'EPC Google Translate', 'translate', lang, {
                        nonInteraction: true
                    });
                    console.log("Translated to " + lang + " (from " + this.previouslang + ") result: " + result);
                    this.previouslang = lang;
                }
            } else if (typeof this.previouslang != "undefined") {
                result = ga('send', 'event', 'EPC Google Translate', 'translate', "en", {
                    nonInteraction: true
                });
                console.log("Translate returned to en (from " + this.previouslang + ") result: " + result);
                delete this.previouslang;
            }
        } catch(e) {
            console.log("Couldn't get translate data: " + e);
        }

        // Always check if iframe height changed
        this.resizeIframes();
        setTimeout(function() { _this.checkChanges() }, 500);
    },

    moveFooter: function() {
        var footer = $("footer");
        if ($(document).height() <= $(window).height()) {
            footer.prev().css('margin-bottom', footer.height());
            footer.css('bottom', 0);
        } else {
            footer.prev().css('margin-bottom', '');
            footer.css('bottom', '');
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
        var headerHeight = $("header").eq(0).height();
        var top = headerHeight - $(document).scrollTop();
        if ($(document).scrollTop() >= headerHeight) {
            top = 0;
        }
        $('.menu').css('margin-top', top);
    },

    resizeMenuNav: function() {
        var sidebar = $(".sidebar-nav-items");
        if (sidebar.length == 0) {
            return;
        }
        var size = $(window).height();
        var footerSize = $(window).scrollTop() + $(window).height() - $("footer").offset().top;
        if (footerSize > 0) {
            size -= footerSize;
        }
        sidebar.each(function() {
            var newSize = size - ($(this).offset().top - $(window).scrollTop());
            $(this).css("max-height", newSize);
        });
    },

    resizeIframes: function() {
        $('.api-content iframe').each(function() {
            var $this = $(this);
            var height = $this.contents().find('html').height();
            if (!height) {
                height = $this.contents().height();
                if (!height) {
                    height = 600;
                }
            }
            // Still need some more space to eliminate scroll bar for swagger page
            height += 10;
            if (height != $this.height()) {
                $this.height(height);
            }
        });
    },

    cloneSideMenuToOffCanvas: function() {
        var src = $('.sidebar-nav');
        var dest = $('.left-off-canvas-menu');
        if (src.length == 0 || dest.length == 0) {
            return;
        }
        var menu = src.clone();

        // Copy header to menu title
        var header = menu.find('header').detach();
        $('.off-canvas-nav-bar .tab-bar-section .title').append(header);

        // Close menu when an item is clicked.
        menu.find('a').click(function() {
            $('.exit-off-canvas').trigger('click');
        });
        dest.append(menu);
    },

    checkOffCanvasVisibility: function() {
        // Reset off canvas section if medium-up
        if (Foundation.utils.is_medium_up()) {
            $('.exit-off-canvas').trigger('click');
        }
    },

    checkOffCanvasMenuPosition: function() {
        var menu = $('.left-off-canvas-menu');
        if (menu.length == 0) {
            return;
        }
        var top = $(document).scrollTop() - $('.off-canvas-wrap').offset().top + $('.off-canvas-nav-bar').height();
        if (top < 0) {
          top = 0;
        }
        menu.css('margin-top', top);
    },

    onResize: function() {
        this.moveFooter();
        this.checkOffCanvasVisibility();
        this.resizeMenuNav();
    },

    onScroll: function() {
        this.setMenuFocus();
        this.checkOffCanvasMenuPosition();
        this.resizeMenuNav();
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


















