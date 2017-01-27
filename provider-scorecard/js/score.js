function providerPortalServiceBaseUrl() {
    switch (environment.env) {
        case "prod": return "https://provider-portal-service.prod-p.expedia.com";
        case "dev":  return "https://provider-portal-service.us-west-2.test.expedia.com";
        default:     return "https://provider-portal-service.us-west-2.test.expedia.com";
    }
}

var provider = false;

var foundationSize = false;
var hasTriggeredhowToImprove = false;
var hasTriggeredhowToEnhance = false;

var demo = {
    "provider": {
        "name": "ExpediaProvider",
        "rank": 13,
        "total": 71,
        "score": 0.92780685
    },
    "grow": {
        "score": 0.8,
        "attributes": {
            "availabilityLose": {
                "value": "1.7",
                "success": true,
                "delta": -14,
                "deltaSuccess": true,
                "unit": "%",
                "differenceFromStandard": -0.28356838
            },
            "rateLose": {
                "value": "2.9",
                "success": true,
                "delta": -4,
                "deltaSuccess": true,
                "unit": "%",
                "differenceFromStandard": -1.0790994
            },
            "etpPenetration": {
                "value": "26",
                "success": false,
                "unit": "%",
                "differenceFromStandard": -0.23718792
            },
            "newHotels": {
                "value": "50",
                "success": true,
                "deltaSuccess": true,
                "delta": 26
            }
        }
    },
    "enhance": {
        "score": 1.0,
        "attributes": {
            "productApi": true,
            "valueAddPromo": true,
            "rateManagement": true,
            "etp": true,
            "evc": true,
            "bc": true
        }
    },
    "optimise": {
        "score": 0.9845119,
        "attributes": {
            "arMessages": {
                "value": "94.1",
                "success": false,
                "delta": -4.3,
                "deltaSuccess": false,
                "unit": "%",
                "differenceFromStandard": -0.038735867
            },
            "bcMessages": {
                "value": "99.7",
                "success": true,
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

$(document).ready(function() {
    setInterval(createBorders, 200);
    var hash = getParameterByName("id");
    if (hash == null || hash == "") {
        ga('send', 'event', 'scorecard', 'demo', window.location.href);
        generateScorecard(demo);
        return;
    }
    $.get(providerPortalServiceBaseUrl() + "/v1/scorecard/" + hash, function(data) {
        generateScorecard(data);
    }).fail(function(jqxhr) {
        $("#top-metrics h1").text("");
        $("#top-metrics p").text("Unfortuntely a problem has occured while attempting to provide you with these metrics.  This error has been reported, please try again later");
        $("#top-metrics").foundation('open');
        ga('send', 'event', 'scorecard', 'error', "code:" + jqxhr.status + ", hash:" + hash);
    });

    $(".scorecard-row .border").click(metricClickCallback);
    $(".scorecard-rank").click(overallClickCallback);
});

function overallClickCallback(event) {
    var hash = getParameterByName("id");
    if (hash == null || hash == "") {
        ga('send', 'event', 'scorecard', 'demoClick.overall', window.location.href);
        return;
    }
    ga('send', 'event', 'scorecard', 'click', 'overall.' + provider);
    $.get(providerPortalServiceBaseUrl() + "/v1/scorecard/top/overall/" + hash)
        .done(function(jqxhr) {
            $("#top-metrics h1").text("Overall Ranking");
            $("#top-metrics p").text("These are the top providers, ranked according to each providers overall score.");
            populateTopMetricsList(jqxhr, false);
            $("#top-metrics").foundation('open');
        }).fail(function(jqxhr) {
            $("#top-metrics h1").text(heading);
            $("#top-metrics p").text("There was an error providing you with these metrics.  This error has been reported.");
            $("#top-metrics .top-metric-cards").empty();
            $("#top-metrics").foundation('open');
            ga('send', 'event', 'scorecard', 'error.overall.' + provider, jqxhr.status);
        });
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

    $.get(providerPortalServiceBaseUrl() + "/v1/scorecard/top/" + section + "/" + category + "/" + hash)
        .done(function(jqxhr) {
            $("#top-metrics h1").text(heading);
            $("#top-metrics p").text("These are the top 5 performers in this category:");
            if ($("#" + category).attr("data-description")) {
                $("#top-metrics p").html($("#" + category).attr("data-description") + "<br/>These are the top 5 performers in this category:");
            }
            populateTopMetricsList(jqxhr, true, category);
            $("#top-metrics").foundation('open');
        }).fail(function(jqxhr) {
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

        var topProviderHtml = $("<div>")
            .addClass("top-performer")
            .append($("<div>")
                .addClass("position")
                .html(position + ".")
            ).append($("<div>")
                .addClass("name")
                .text(topProvider.name)
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
    } else {
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
        $("#top-metrics .top-metric-cards").append("<div class='gap'></div>").append(givenProviderHtml);

        if (!hasTriggeredhowToImprove) {
            $("#top-metrics .top-metric-cards").append("<div class='gap'></div>").append("<div class='top-performer improve'>How can I improve this score?</div>");
            $(".improve").data("category", category);
            $(".improve").click(howToImproveTriggered);
        }
    }
}


function howToImproveTriggered() {
    $(this).html("<div class='top-performer improve-thanks'><div class='state icon icon-success'></div>&nbsp;Thank you for your interest. We will be in contact shortly with more information on how to improve this score.</div>");
    ga('send', 'event', 'scorecard', 'improve.score', provider + '.' + $(this).data("category"));
    hasTriggeredhowToImprove = true;
}

function howToEnhanceTriggered() {
    $(this).html("<div class='top-performer improve-thanks'><div class='state icon icon-success'></div>&nbsp;Thank you for your interest. We will be in contact shortly with more information on how to adopt more features. You can find implementation details for our APIs here: <a href='https://expediaconnectivity.com/developer' target='_blank'>https://expediaconnectivity.com/developer</a></div></div>");
    ga('send', 'event', 'scorecard', 'improve.score', provider + '.' + $(this).data("category"));
    hasTriggeredhowToEnhance = true;
}




function generateScorecard(scorecard) {
    provider = scorecard.provider.name;
    ga('send', 'event', 'scorecard', 'view', provider);
    $(".scorecard-provider").text(scorecard.provider.name);
    $(".scorecard-rank .rank").text(scorecard.provider.rank);
    $(".scorecard-rank .total").text(scorecard.provider.total);

    generateScorecardCategory(scorecard.grow, "grow");
    generateScorecardCategory(scorecard.optimise, "optimise");
    generateScorecardFeature(scorecard.enhance, "enhance");
}

function generateScorecardCategory(category, id) {
    $("#" + id + " .scorecard-category-score .score-value").css("width", (category.score * 100) + "%");
    $("#" + id + " .scorecard-category-score .score-percentage").text("Score: " + Math.round(category.score * 100) + "%");

    for (key in category["attributes"]) {
        if (key == "score") continue;
        var element = category["attributes"][key];
        var elementSelector = "#" + id + " #" + key;
        var value = element.value;
        var difference = element.differenceFromStandard || 0;

        if (!element.hasOwnProperty("value") || value == null || value == "") {
            $(elementSelector).html("");
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
        $(elementSelector).addClass(element.success ? "green" : "red");
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
            $(elementSelector + " .rate-change").addClass(deltasuccess ? "green" : "red").html(delta).append(" " + Math.abs(element.delta) + "%");
        } else {
            $(elementSelector + " .rate-change").remove();
            $(elementSelector + " .rate-period").remove();
            $(elementSelector + " .value").removeClass("small-6").addClass("small-12");
        }
    }
}

function generateScorecardFeature(category, id) {
    $("#" + id + " .scorecard-category-score .score-value").css("width", (category.score * 100) + "%");
    $("#" + id + " .scorecard-category-score .score-percentage").text("Score: " + Math.round(category.score * 100) + "%");

    for (key in category["attributes"]) {
        if (key == "score") continue;
        var elementSelector = "#" + id + " #" + key;
        var state = category["attributes"][key];
        $(elementSelector + " .state").addClass(state ? "icon-success" : "icon-close");
        $(elementSelector).addClass(state ? "green" : "red");

    }

    if (!hasTriggeredhowToEnhance) {
        $("#enhance").append("<div class='scorecard-improve small-12 columns adopt'>Help me adopt a feature</div>");
        $(".adopt").data("category", "enhance");
        $(".adopt").click(howToEnhanceTriggered);
    }

}

function createBorders() {
    if (Foundation.MediaQuery.current == foundationSize) {
        return;
    }
    foundationSize = Foundation.MediaQuery.current;
    $("#optimise .border").removeAttr("style");
    $("#enhance .border").removeAttr("style");
    $("#grow .border").removeAttr("style");
    if (Foundation.MediaQuery.atLeast("xlarge")) {
        $("#enhance #productApi,#valueAddPromo,#rateManagement,#etp").css("border-bottom", "1px solid lightgrey");
        $("#enhance #evc,#bc").css("border-top", "none");
        $("#enhance #etp").css("border-right", "none");
        $("#enhance #bc").css("border-right", "1px solid lightgrey");
    } else if (Foundation.MediaQuery.current == "large") {
        $("#enhance #productApi,#valueAddPromo,#rateManagement").css("border-bottom", "1px solid lightgrey");
        $("#enhance #etp,#evc,#bc").css("border-top", "none");
        $("#enhance #rateManagement").css("border-right", "none");
    } else if (Foundation.MediaQuery.current == "medium") {
        $("#optimise #bcMessages").css("border-right", "none");
        $("#enhance #valueAddPromo,#etp").css("border-right", "none");
        $("#grow #rateLose").css("border-right", "none");
    } else if (Foundation.MediaQuery.current == "small") {
        $("#enhance .border").css("border-right", "none");
        $("#optimise .border").css("border-right", "none");
        $("#grow .border").css("border-right", "none");
    } else {
        console.log("Cannot detect screen size.")
    }
}