define(function () {
    function dataUrl() {
        switch (environment.env) {
            case "prod":
                return "https://api.expediapartnercentral.com/provider-portal/v1/terms";
            default:
                return "https://api.expediapartnercentral.com.integration.sb.karmalab.net/provider-portal/v1/terms";
        }
    }

    var companyName = "";
    const ordinalMap = getOrdinalMap();

    function getOrdinalMap() {
        let map = new Map();
        for (var day = 1; day <= 31; day++) {
            let ordinal;
            if (11 <= day && day <= 13) {
                ordinal = "th";
            } else {
                switch (day % 10) {
                    case 1:
                        ordinal = "st";
                        break;
                    case 2:
                        ordinal = "nd";
                        break;
                    case 3:
                        ordinal = "rd";
                        break;
                    default:
                        ordinal = "th";
                        break;
                }
            }
            map.set(day, ordinal);
        }
        return map;
    }

    function getHash() {
        var param = window.location.search;
        var idPair = param.match(/id=([\w\-=]+)/);
        return idPair === null ? idPair : idPair[1];
    }

    function getCurrentVersion() {
        return "1.0";
    }

    /**
     * @param date Date object to be formatted
     * @returns {string} of format '1st of January, 2020'
     */
    function formatDate(date) {
        return date.getDate() + ordinalMap.get(date.getDate()) + " of " + date.toLocaleDateString('en-US', {month: 'long'}) + ", " + date.getFullYear();
    }

    function populatePage(pageData) {
        companyName = pageData.providerCompany;
        $("#provider-name").text("Provider: " + companyName);
        $("#person-details").text(pageData.providerRepName + " (" + pageData.providerEmail + ")");
        if (pageData.hasOwnProperty('acceptedDate')) {
            let date = new Date(pageData.acceptedDate);
            $("#accepted-on").text("Accepted on the " + formatDate(date));
            $("#accept-text").addClass("hidden");
            $("#accept").addClass("hidden");
        } else {
            const date = new Date(pageData.dueDate);
            $("#tandc-intro").text("We have updated the terms and conditions governing the connection between " +
                companyName + " and Expedia Group. Please review and accept these changes before the " + formatDate(date) + ".");
        }
        $(".loading").addClass("hidden");
        $("#tandc").removeClass("hidden");
    }

    function showErrorPage() {
        $(".loading").addClass("hidden");
        $("#error-message").removeClass("hidden");
    }

    function getPageData() {
        var hash = getHash();
        if (hash) {
            var version = getCurrentVersion();
            $.get(dataUrl() + "/details/" + hash + "?version=" + version, function (data) {
                if (data == null) {
                    showErrorPage();
                    ga('send', 'event', 'provider-terms', 'page-display-failure', 'reason=nullProviderReturned;hash=' + hash);
                } else {
                    populatePage(data);
                    ga('send', 'event', 'provider-terms', 'page-display-success',
                        'accepted=' + data.hasOwnProperty('acceptedDate') + ';hash=' + hash + ';providerName=' + companyName);
                }
            }).fail(function () {
                showErrorPage();
                ga('send', 'event', 'provider-terms', 'page-display-failure', 'reason=getProviderFailed;hash=' + hash);
            });
        } else {
            showErrorPage();
            ga('send', 'event', 'provider-terms', 'page-display-failure', 'reason=invalidHash;urlParam=' + window.location.search);
        }
    }

    function showSubmitError() {
        $("#accept-btn").removeClass("disabled");
        $("#accept-btn").text("I agree");
        $("#accept-error").removeClass("hidden");
    }

    function submitAccept() {
        $("#accept-error").addClass("hidden");
        $("#accept-btn").addClass("disabled");
        $("#accept-btn").text("Submitting...");
        var hash = getHash();
        if (hash) {
            var version = getCurrentVersion();
            $.post(dataUrl() + "/accept/" + hash + "?version=" + version, function () {
                ga('send', 'event', 'provider-terms', 'accept-terms-success', 'hash=' + hash + ';providerName=' + companyName);
                location.reload();
            }).fail(function (jqxhr) {
                showSubmitError();
                ga('send', 'event', 'provider-terms', 'accept-terms-failure',
                    'reason=submitAcceptFailed;hash=' + hash + ';providerName=' + companyName);
            });
        } else {
            showSubmitError();
            ga('send', 'event', 'provider-terms', 'accept-terms-failure',
                'reason=invalidHash;urlParam=' + window.location.search + ';providerName=' + companyName);
        }
    }

    $(document).ready(function () {
        $(this).scrollTop(0);
        getPageData();
        $("#accept-btn").on("click", function () {
            submitAccept();
        });
        $("#download-btn").attr("href", dataUrl() + "/pdf");
    });

    return {
        init: function () { }
    };

});
