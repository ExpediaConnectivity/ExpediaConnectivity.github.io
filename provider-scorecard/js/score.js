define(function() {

    function providerPortalServiceBaseUrl() {
        switch (environment.env) {
            case "prod":
                return "https://api.expediapartnercentral.com/provider-portal";
            default:
                return "https://api.expediapartnercentral.com.integration.sb.karmalab.net/provider-portal";
        }
    }

    var provider = false;

    var foundationSize = false;

    var version;

    var demo = {
        "provider": {
            "name": "ExpediaGroupProvider",
            "rank": 13,
            "total": 297,
            "score": 0.92780685
        },
        "version": {
            "key": "",
            "displayName" : "Demo"
        },
        "enhance": {
            "score": 0.83,
            "attributes": {
                "productApi": false,
                "valueAddPromo": true,
                "rateManagement": true,
                "etp": true,
                "evc": true,
                "bc": true,
                "pci": true,
                "pos": false
            }
        },
        "optimise": {
            "score": 0.6845119,
            "attributes": {
                "arMessages": {
                    "value": "95.0",
                    "success": false,
                    "delta": -4.3,
                    "deltaSuccess": false,
                    "unit": "%",
                    "differenceFromStandard": -0.038735867
                },
                "bcMessages": {
                    "value": "96.0",
                    "success": false,
                    "delta": 0.2,
                    "deltaSuccess": true,
                    "unit": "%",
                },
                "onboardingSpeed": {
                    "value": "5.7",
                    "success": true,
                    "delta": -29,
                    "deltaSuccess": true,
                    "unit": "days",
                    "differenceFromStandard": -1.2933865
                },
                "connectivityActivation": {
                    "value": "2.5",
                    "success": true,
                    "delta": -14,
                    "deltaSuccess": true,
                    "unit": "days",
                    "differenceFromStandard": -2.512195
                }
            }
        }
    };

    function getParameterByName(name) {
        var url = window.location.search;
        var name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    function getVersion() {
        var versionParam = (version == null || version == "") ? "" : "?version=" + encodeURIComponent(version);
        return versionParam;
    }

    function getVersionFromUrl() {
        var versionInUrl = getParameterByName("version");
        var versionParam = (versionInUrl == null || versionInUrl == "") ? "" : "?version=" + encodeURIComponent(versionInUrl);
        return versionParam;
    }

    $(document).ready(function () {
        setInterval(createBorders, 200);
        var hash = getParameterByName("id");
        if (hash == null || hash == "") {
            ga('send', 'event', 'scorecard', 'demo', window.location.href);
            generateScorecard(demo);
            return;
        }

        $.get(providerPortalServiceBaseUrl() + "/v1/scorecard/" + hash + getVersionFromUrl(), function (data) {
            generateScorecard(data);
        }).fail(function (jqxhr) {
            $("#top-metrics h1").text("");
            if (jqxhr.status == 404) {
                $("#top-metrics p").text("Unfortunately we couldn't find metrics for this ID. Please check the URL provided and try again.");
            } else {
                $("#top-metrics p").text("Unfortunately a problem has occured while attempting to provide you with these metrics.  This error has been reported, please try again later");
            }
            $("#top-metrics").foundation('open');
            ga('send', 'event', 'scorecard', 'error', "code:" + jqxhr.status + ", hash:" + hash);
        });

        $("#optimise .border").click(metricClickCallback);
        $("#enhance .border").click(enhanceClickCallback);
        $(".scorecard-rank").click(overallClickCallback);
        $(".feedback-link").click(feedbackClickCallback);
    });

    function feedbackClickCallback(event) {
        ga('send', 'event', 'scorecard', 'click', 'feedback');
    }

    function overallClickCallback(event) {
        var hash = getParameterByName("id");
        if (hash == null || hash == "") {
            ga('send', 'event', 'scorecard', 'demoClick.overall', window.location.href);
            return;
        }
        ga('send', 'event', 'scorecard', 'click', 'overall.' + provider);
        $.get(providerPortalServiceBaseUrl() + "/v1/scorecard/top/overall/" + hash + getVersion())
            .done(function (jqxhr) {
                $("#top-metrics h1").text("Overall Ranking");
                $("#top-metrics p").text("These are the top providers, ranked according to each provider's overall score.");
                populateTopMetricsList(jqxhr, false, "overall");
                $("#top-metrics").foundation('open');
            }).fail(function (jqxhr) {
            $("#top-metrics h1").text(heading);
            $("#top-metrics p").text("There was an error providing you with these metrics.  This error has been reported.");
            $("#top-metrics .top-metric-cards").empty();
            $("#top-metrics").foundation('open');
            ga('send', 'event', 'scorecard', 'error.overall.' + provider, jqxhr.status);
        });
    }

    function enhanceClickCallback(event) {
        if ($(event.target).is(".border")) {
            var section = $(event.target).attr("id");
        } else {
            var section = $(event.target).parents(".border").attr("id");
        }
        var title = $("#" + section + " div.feature").text();
        var heading = $("div#" + section).attr("data-title");

        $("#enhanceModal h1").text(title);
        $("#enhanceModal p#base").text(heading);
        if (section == 'productApi') {
            $("p#extra").html("");
            $("div.adopt").html('<a href="https://expediaconnectivity.com/apis/product-management/product-api/quick-start.html" target=\"_blank\"" >Help me adopt this feature</a>');
        } else if (section == 'valueAddPromo') {
            $("p#extra").html("Value Add Promotions information is being passed to you in bookings in a new Special Request field. Expedia Group previously sent 5 Special Request fields already, and we are simply adding a 6th Special Request field for Value Adds information. Many Connectivity Partners who support Value Adds have found either no work or very limited work was required.");
            $("div.adopt").html('<p class="adopt-message">Adopt Value Add Promo on</p><a href="https://expediaconnectivity.com/apis/availability-rates-restrictions-booking-notification-retrieval-and-confirmation/expedia-quickconnect-booking-retrieval-confirmation-api/reference-br.html#booking-retrieval-response-complete-schema-definition"  target=\"_blank\">Expedia QuickConnect (EQC)</a><br><a href="https://expediaconnectivity.com/apis/availability-rates-restrictions-booking-notification-retrieval-and-confirmation/booking-notification-api/reference.html#ota_hotelresnotifrq" target=\"_blank\">Booking Notification</a>');
        } else if (section == 'etp') {
            $("p#extra").html("");
            $("div.adopt").html('<a href="https://expediaconnectivity.com/apis/availability-rates-restrictions-booking-notification-retrieval-and-confirmation/expedia-quickconnect-booking-retrieval-confirmation-api/guides.html#hotel-collect-bookings-and-expedia-traveler-preference-etp-" target=\"_blank\">Help me adopt this feature</a>');
        } else if (section == 'evc') {
            $("p#extra").html("");
            $("div.adopt").html('<a href="https://expediaconnectivity.com/apis/availability-rates-restrictions-booking-notification-retrieval-and-confirmation/expedia-quickconnect-booking-retrieval-confirmation-api/guides.html#learn-more-about-expedia-virtualcard" target=\"_blank\">Help me adopt this feature</a>');
        } else if (section == 'pos') {
            $("p#extra").html("");
            $("div.adopt").html('<a href="https://expediaconnectivity.com/blog#enhanced-pos-branding" target=\"_blank\">Help me adopt this feature</a>');
        } else if (section == 'pci') {
            $("p#extra").html("");
            $("div.adopt").html('<a href="mailto:eqcss@expedia.com?Subject=My%20PCI%20Attestation%20of%20Compliance" target=\"_blank\">Email my AOC to Expedia Group</a>');
        }

        $("#enhanceModal").foundation('open');
        ga('send', 'event', 'scorecard', 'click', section + '.' + provider);
    }

    function metricClickCallback(event) {
        if (!provider) {
            return;
        }

        var category = $(event.target).parents(".border").attr("id");
        if ($(event.target).hasClass("border")) {
            category = $(event.target).attr("id")
        }
        ga('send', 'event', 'scorecard', 'click', category + '.' + provider);
        var hash = getParameterByName("id");
        if (hash == null || hash == "") {
            ga('send', 'event', 'scorecard', 'demoClick.' + category, window.location.href);
            return;
        }
        var heading = $("#" + category).attr("data-heading");
        var section = $(event.target).parents(".scorecard-row").attr("id");
        if (section == "enhance") {
            return;
        }

        $.get(providerPortalServiceBaseUrl() + "/v1/scorecard/top/" + section + "/" + category + "/" + hash + getVersion())
            .done(function (jqxhr) {
                $("#top-metrics h1").text(heading);
                $("#top-metrics p").text("These are the top 5 performers in this category:");
                if ($("#" + category).attr("data-description")) {
                    $("#top-metrics p").html($("#" + category).attr("data-description") + "<br/>These are the top 5 performers in this category:");
                }
                populateTopMetricsList(jqxhr, true, category);
                $("#top-metrics").foundation('open');
            }).fail(function (jqxhr) {
            $("#top-metrics h1").text(heading);
            $("#top-metrics p").text("There was an error providing you with these metrics.  This error has been reported.");
            $("#top-metrics .top-metric-cards").empty();
            $("#top-metrics").foundation('open');
            ga('send', 'event', 'scorecard', 'error.' + category + "." + provider, jqxhr.status);
        });
    }

    function populateTopMetricsList(jqxhr, showValues, category) {
        $("#top-metrics .top-metric-cards").empty();
        var providers = jqxhr.topProviders;
        for (var i = 0; i < providers.length; i++) {
            var topProvider = providers[i];
            var value = topProvider.value;
            if (topProvider.unit == "days") {
                value += "<span class='unit-bottom'> days</span>";
            } else if (topProvider.unit == "%") {
                value += "<span class='unit-top'>%</span>";
            }

            var position = (i + 1);
            if (providers.length >= 10 && i < 9) {
                position = "&nbsp;" + position;
            }

            var providerTitle = topProvider.name;
            if (topProvider.system) {
                providerTitle =  "<b>" + topProvider.system + "</b> by " + providerTitle;
            }
            var topProviderHtml = $("<div>")
                .addClass("top-performer")
                .append($("<div>")
                    .addClass("position")
                    .html(position + ".")
                ).append($("<div>")
                    .addClass("name")
                    .html(providerTitle)
                );

            if (showValues) {
                topProviderHtml.append($("<div>")
                    .addClass("score")
                    .html(value)
                );
            }

            $("#top-metrics .top-metric-cards").append(topProviderHtml);

        }

        if (jqxhr.givenProviderIndex < providers.length) {
            $("#top-metrics .top-metric-cards .top-performer").eq(jqxhr.givenProviderIndex).addClass("given-provider");
        } else if (jqxhr.givenProvider && jqxhr.givenProviderIndex) {
            var position = jqxhr.givenProviderIndex + 1;
            var givenProvider = jqxhr.givenProvider;
            var value = givenProvider.value;
            if (givenProvider.unit == "days") {
                value += "<span class='unit-bottom'> days</span>";
            } else if (givenProvider.unit == "%") {
                value += "<span class='unit-top'>%</span>";
            }
            var givenProviderHtml = $("<div>")
                .addClass("top-performer")
                .addClass("given-provider")
                .append($("<div>")
                    .addClass("position")
                    .html(position + ".")
                ).append($("<div>")
                    .addClass("name")
                    .text(givenProvider.name)
                );

            if (showValues) {
                givenProviderHtml.append($("<div>")
                    .addClass("score")
                    .html(value)
                );
            }
            $("#top-metrics .top-metric-cards").append("<div class='gap'></div>").append(givenProviderHtml).append("<div class='gap'></div><h5 style='margin-right: 1rem; margin-left: 1rem;    '>Have you signed up to Expedia Group's error connectivity reports?</h5><p>Our connectivity error reports provide a wealth of additional information that can help you determine the root causes of connectivity issues and improve your overall success rate.</p><p style='margin-bottom: 10px;'>Please email your account manager requesting your report and desired frequency (daily or weekly).");
        }
    }

    function generateScorecard(scorecard) {
        provider = scorecard.provider.name;
        version = scorecard.version.key;
        ga('send', 'event', 'scorecard', 'view', provider);
        $("title").text(provider + " Scorecard - Expedia Connectivity");
        $(".scorecard-provider").text(scorecard.provider.name);
        if (scorecard.provider.system) {
            $(".scorecard-system").text(scorecard.provider.system);
            $("#systemName").removeClass("hidden");
        }

        if (scorecard.provider.rank) {
            $(".scorecard-rank .rank").text(scorecard.provider.rank);
            $(".scorecard-rank .total").text(scorecard.provider.total);
            $(".scorecard-rank").removeClass("hidden");
        }

        setLabel(scorecard.version.displayName);
        generateScorecardCategory(scorecard.optimise, "optimise");
        generateScorecardFeature(scorecard.enhance, "enhance");
    }

    function setLabel(name) {
        $("#versionName").html("These are your metrics for " + name + ".");
    }


    function generateScorecardCategory(category, id) {
        for (key in category["attributes"]) {
            if (key == "score") continue;
            var element = category["attributes"][key];
            var elementSelector = "#" + id + " #" + key;
            var value = element.value;
            var difference = element.differenceFromStandard || 0;

            if (!element.hasOwnProperty("value") || value == null || value == "") {
                $(elementSelector).html("");
                $(elementSelector).addClass("no-data");
                continue;
            } else if (element.unit == "days") {
                value += "<span class='unit-bottom'>" + element.unit + "</span>";
                var standard = Math.abs(difference).toFixed(1) + " days ";
                standard += (difference < 0) ? "quicker than recommended" : "longer than recommended";
            } else if (element.unit == "%") {
                value += "<span class='unit-top'>" + element.unit + "</span>";
                var standard = Math.abs(difference * 100).toFixed(1) + "% ";
                standard += (difference < 0) ? "less than recommended" : "higher than recommended";
            }
            $(elementSelector + " .value").html(value);
            if (typeof element.success != "undefined") {
                $(elementSelector).addClass(element.success ? "green" : "red");
            } else {
                $(elementSelector).addClass("grey");
            }
            if (element.success || !element.differenceFromStandard) {
                $(elementSelector + " .standard").remove();
            } else {
                // Removed until people change their minds again
                $(elementSelector + " .standard").remove();
                //$(elementSelector + " .standard").text(standard).addClass("red");
            }

            if (element.delta) {
                var deltasuccess = (element.deltaSuccess != null) ? element.deltaSuccess : element.success;
                var delta = $("<span/>").html(element.delta < 0 ? "&#x25BC;" : "&#x25B2;");
                $(elementSelector + " .rate-change").addClass(deltasuccess ? "green" : "red").html(delta).append(" " + Math.abs(element.delta) + (element.unit == "days"?"%":"\&nbsp;pps"));
            } else {
                $(elementSelector + " .rate-change").remove();
                $(elementSelector + " .rate-period").remove();
                $(elementSelector + " .value").removeClass("small-6").addClass("small-12");
            }
        }
    }

    function generateScorecardFeature(category, id) {
        for (key in category["attributes"]) {
            if (key == "score") continue;
            var elementSelector = "#" + id + " #" + key;
            var state = category["attributes"][key];
            $(elementSelector + " .state").addClass(state ? "icon-success" : "icon-close");
            $(elementSelector).addClass(state ? "green" : "red");
        }
        if (!("pci" in category["attributes"])) {
            // PCI attribute not included in json
            var elementSelector = "#" + id + " #pci";
            $(elementSelector).addClass("light-grey");
            $(elementSelector + " .feature").text("PCI Attestation not required");
            $(elementSelector + " .icon.icon-toggle90").removeClass("icon-toggle90").addClass("no-toggle");
            $(elementSelector).unbind("click");
            $(elementSelector).css({pointerEvents : "none"});
        }
    }

    function createBorders() {
        if (Foundation.MediaQuery.current == foundationSize) {
            return;
        }
        foundationSize = Foundation.MediaQuery.current;
        $("#optimise .border").removeAttr("style");
        $("#enhance .border").removeAttr("style");
        if (Foundation.MediaQuery.atLeast("xlarge")) {
            $("#pci, #productApi, #valueAddPromo, #etp").css("border-bottom", "10px solid #f8f8f8");
            $("#pos").css("border-right", "10px solid #f8f8f8");
            $("#evc, #pos").css("border-top", "none");
            $("#etp .feature").text("Expedia Travel Preference");
            $("#pos .feature").text("Point of Sale Identification");
        } else if (Foundation.MediaQuery.current == "large") {
            $("#bcMessages .metric").html("BC Message<br />Success Rate");
            $("#arMessages .metric").html("AR Message<br />Success Rate");
            $("#pci, #productApi, #valueAddPromo, #etp, #evc, #pos").css("border-bottom", "10px solid #f8f8f8");
            $("#etp").css("border-right", "none");
            $("#etp").css("border-top", "none");
            $("#evc, #pos").css("border-top", "none");
            $("#pos").css("border-top", "none");
            $("#evc, #etp, #pos").css("border-right", "10px solid #f8f8f8");
            $("#etp .feature").text("Expedia Travel Preference");
            $("#pos .feature").text("Point of Sale Identification");
        } else if (Foundation.MediaQuery.current == "medium") {
            $("#bcMessages .metric").text("BC Message Success Rate");
            $("#arMessages .metric").text("AR Message Success Rate");
            $("#optimise #bcMessages").css("border-right", "none");
            $("#enhance #valueAddPromo").css("border-right", "none");
            $("#etp .feature").text("Expedia Travel Pref.");
            $("#pos .feature").text("Point of Sale ID.");
            $("#evc").css("border-right", "none");
            $("#evc").css("border-top", "none");
            $("#etp, #evc").css("border-bottom", "10px solid #f8f8f8");
            $("#valueAddPromo, #evc, #pos").css("border-right", "10px solid #f8f8f8");
            $("#pos").css("border-top", "none");
            $("#valueAddPromo, #pos").css("border-bottom", "10px solid #f8f8f8");
        } else if (Foundation.MediaQuery.current == "small") {
            $("#enhance .border").css("border-right", "none");
            $("#optimise .border").css("border-right", "none");
            $("#etp .feature").text("Expedia Travel Preference");
            $("#pos .feature").text("Point of Sale Identification");
        } else {
            console.log("Cannot detect screen size.")
        }
    }

    return {
        init: function () {}
    }

});
