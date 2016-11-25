function providerPortalServiceBaseUrl() {
    return environment.isProd() ? "https://provider-portal-service.us-west-2.test.expedia.com" : "https://provider-portal-service.us-west-2.test.expedia.com";
}

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
    var hash = getParameterByName("hash");
    if (hash == null || hash == "") {
        generateScorecard(demo);
        return;
    }
    $.get(providerPortalServiceBaseUrl() + "/v1/scorecard/" + hash, function(data) {
        generateScorecard(data);
    });
});


function generateScorecard(scorecard) {
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
        if (element.unit == "days") {
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
        $(elementSelector).addClass(state ? "green" : "red");

    }
}