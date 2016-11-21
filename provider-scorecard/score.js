var stardekk = {
    provider: {
        name: "Stardekk",
        rank: 13,
        total: 71,
        score: 0.8
    },
    grow: {
        score: 0.6,
        availabilityLose: {
            value: 1.7,
            success: true,
            delta: -14,
            unit: "%"
        },
        rateLose: {
            value: 2.9,
            success: true,
            delta: -4,
            unit: "%"
        },
        etpPenetration: {
            value: 26,
            success: false,
            unit: "%"
        },
        newHotels: {
            value: 50,
            success: true,
            delta: 26
        },
        hotelRevenue: {
            value: "$16,679,937",
            success: true,
            delta: -3,
            deltaSuccess: false
        }
    },
    enhance: {
        score: 1.0,
        productApi: true,
        valueAddPromo: true,
        rateManagement: false,
        etp: true,
        evc: true,
        bc: true
    },
    optimise: {
        score: 0.9,
        arMessages: {
            value: 94.1,
            success: false,
            delta: -4.3,
            unit: "%"
        },
        bcMessages: {
            value: 99.7,
            success: true,
            delta: 0.2,
            unit: "%"
        },
        onboardingSpeed: {
            value: 5.7,
            success: true,
            delta: -29,
            unit: "days"
        },
        connectivityActivation: {
            value: 2.5,
            success: true,
            delta: -14,
            unit: "days"
        }
    }
};


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

    for (key in category) {
        if (key == "score") continue;
        var element = category[key];
        var elementSelector = "#" + id + " #" + key;
        var value = element.value;
        if (element.unit == "days") {
            value += " " + element.unit;
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

    for (key in category) {
        if (key == "score") continue;
        var elementSelector = "#" + id + " #" + key;
        var state = category[key];
        $(elementSelector + " .state").html(state ? "&#x2713;" : "&#x2717;");
        $(elementSelector).addClass(state ? "green" : "red");

    }
}

$(document).ready(function() {
    generateScorecard(stardekk);
});