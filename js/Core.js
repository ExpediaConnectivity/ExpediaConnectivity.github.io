

var Core = Core || {

    
    init: function() {
        var _this = this;
        this.createCodeOptions(this.getCodeExamples());
        this.setOption();
        this.changeOption();
        this.determineSection();
        this.setMenuFocus();
        this.demoForm();
        this.moveFooter();
        this.resizeIframes();
        this.lastHeight = $(document).height();
        this.checkChanges();
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

    createCodeOptions: function(langs) {
        langs.forEach(function(lang) {
            var option = $("<div></div>").addClass("option").html(lang).attr("data-option", lang);
            $(".options_header").append(option);
        });
    },

    getCodeExamples: function() {
        var langs = [];
        $(".hljs").each(function(index, element) {
            element.className.split(' ').forEach(function(classname) {
                if (classname.indexOf('lang-') == 0) {
                    langs.push(classname.substr(5));
                }
            });
        });
        return langs;
    },

    setOption: function() {
        var _this = this;
        var option_name = 'option ' + $(location).attr('pathname');
        if(localStorage.getItem(option_name) == null) {
            var selectedOption = $('.options_header .option.active').data('option');
            if(selectedOption != undefined) {
                localStorage.setItem(option_name, selectedOption);
                console.log('should set one to localStorage');
            } else {
                _this.selectFirstOption(option_name);
                console.log('its selecting the first one');
            }
        } else {
            var setOption = localStorage.getItem(option_name);
            _this.displayOption(setOption);
        }
    },

    displayOption: function(setOption) {
        $('.options_header .option').removeClass('active');
        var option = $('.options_header .option[data-option="'+setOption+'"]');
        option.addClass('active');
        $(".content code.hljs[class*='lang-']").hide();
        $(".content code.hljs.lang-" + option.data('option')).show();
    },

    selectFirstOption: function(option_name) {
        // select the first one, and set the localStorage
        var firstOption = $('.options_header .option').first();
        this.displayOption(firstOption.data('option'));
        localStorage.setItem(option_name, firstOption.data('option'));
    },

    changeOption: function() {
        var _this = this;
        var option_name = 'option ' + $(location).attr('pathname');
        $('.options_header .option').on('click', function() {
            var option = $(this).data('option');
            _this.displayOption(option);
            localStorage.setItem(option_name, option);
        });
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
        });
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


















