function providerPortalServiceBaseUrl() {
    switch (environment.env) {
        case "prod": return "https://provider-portal-service.prod-p.expedia.com";
        case "dev":  return "https://provider-portal-service.us-west-2.test.expedia.com";
        default:     return "https://provider-portal-service.us-west-2.test.expedia.com";
    }
}

var provider = false;

var demo = {
    "provider": {
        "name": "ExpediaProvider",
        "rank": 28,
        "total": 355,
        "score": 0.92780685
    },
    "grow": {
        "score": 0.8,
        "attributes": {
            "availabilityLose": {
                "value": "1.7",
                "success": true,
                "delta": -14,
                "unit": "%"
            },
            "rateLose": {
                "value": "2.9",
                "success": true,
                "delta": -4,
                "unit": "%"
            },
            "etpPenetration": {
                "value": "26",
                "success": false,
                "unit": "%"
            },
            "newHotels": {
                "value": "50",
                "success": true,
                "delta": 26
            },
            "hotelRevenue": {
                "value": "16679937",
                "success": true,
                "delta": -3,
                "deltaSuccess": false,
                "unit": "$"
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
                "delta": -4.3
            },
            "bcMessages": {
                "value": "99.7",
                "success": true,
                "delta": 0.2
            },
            "onboardingSpeed": {
                "value": "5.7",
                "success": true,
                "delta": -29,
                "unit": "days"
            },
            "connectivityActivation": {
                "value": "2.5",
                "success": true,
                "delta": -14,
                "unit": "days"
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
    var hash = getParameterByName("id");
    if (hash == null || hash == "") {
        ga('send', 'event', 'scorecard', 'demo', window.location.href);
        generateScorecard(demo);
        return;
    }
    $.get(providerPortalServiceBaseUrl() + "/v1/scorecard/" + hash, function(data) {
        generateScorecard(data);
    }).fail(function(jqxhr) {
        ga('send', 'event', 'scorecard', 'error', "code:" + jqxhr.status + ", hash:" + hash);
    });

    $(".scorecard-column .border").click(metricClickCallback);
});

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
        ga('send', 'event', 'scorecard', 'demoClick', window.location.href);
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
            $("#top-metrics p").text("These are the top 5 performers in this category.");
            $("#top-metrics .top-metric-cards").empty();
            for (var i = 0; i < jqxhr.length; i++) {
                var topProvider = jqxhr[i];
                var value = topProvider.value;
                if (topProvider.unit == "days") {
                    value += " " + topProvider.unit;
                } else if (topProvider.unit == "$") {
                    value = topProvider.unit + value;
                } else if (topProvider.unit) {
                    value += topProvider.unit;
                }
                console.log(topProvider);
                $("#top-metrics .top-metric-cards")
                    .append($("<div>")
                        .addClass("top-performer")
                        .append($("<div>")
                            .addClass("position")
                            .text((i + 1) + ".")
                        ).append($("<div>")
                            .addClass("name")
                            .text(topProvider.name)
                        ).append($("<div>")
                            .addClass("score")
                            .text(value)
                        )
                    );
            }
            $("#top-metrics").foundation('open');
        }).fail(function(jqxhr) {
            $("#top-metrics h1").text(heading);
            $("#top-metrics p").text("There was an error providing you with these metrics.  This error has been reported.");
            $("#top-metrics .top-metric-cards").empty();
            $("#top-metrics").foundation('open');
            ga('send', 'event', 'scorecard', 'error.' + category + "." + provider, jqxhr.status);
        });
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

    for (key in category["attributes"]) {
        if (key == "score") continue;
        var element = category["attributes"][key];
        var elementSelector = "#" + id + " #" + key;
        var value = element.value;
        if (value == "") {
            value = "Not Available"
        } else if (element.unit == "days") {
            value += " " + element.unit;
        } else if (element.unit == "$") {
            value = element.unit + value;
        } else if (element.unit) {
            value += element.unit;
        }
        $(elementSelector + " .value").text(value);
        $(elementSelector).addClass(element.success ? "green" : "red");

        if (element.delta) {
            var deltasuccess = (element.deltaSuccess != null) ? element.deltaSuccess : element.success;
            var delta = $("<span/>").addClass(deltasuccess ? "green" : "red").html(element.delta < 0 ? "&#x25BC;" : "&#x25B2;");
            $(elementSelector + " .rate-change").html(delta).append(" " + element.delta + "%");
        } else {
            $(elementSelector + " .rate-change").html("");
            $(elementSelector).addClass("solid-background");
        }
    }
}

function generateScorecardFeature(category, id) {
    $("#" + id + " .scorecard-category-score .score-value").css("width", (category.score * 100) + "%");

    for (key in category["attributes"]) {
        if (key == "score") continue;
        var elementSelector = "#" + id + " #" + key;
        var state = category["attributes"][key];
        $(elementSelector + " .state").html(state ? "&#x2713;" : "&#x2717;");
        $(elementSelector).addClass(state ? "feature-green" : "feature-red");

    }
}