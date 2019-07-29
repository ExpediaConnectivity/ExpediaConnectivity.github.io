$(document).ready(function() {
    ga('send', 'event', 'epc-login', 'access');

    var STATE_CHECKING_SESSION = 'checkingEpcSession',
        STATE_NO_SESSION = 'noSessionRedirectingToEpcLogin',
        STATE_HAVE_SESSION = 'haveSessionRedirectingToTestProperties',
        STATE_ERROR = 'error';

    function loadStart() {
        $(".loader").show();
    }

    function loadEnd() {
        $(".loader").hide();
    }

    function render(state, errorMessage) {
        $('.authState').hide();
        $('#authState-errorMessage').text(errorMessage || 'Unknown');
        $('#authState-' + state).show();
    }

    function checkAuth() {
        render(STATE_CHECKING_SESSION);
        loadStart();
        $.ajax({
            method: "POST",
            url: hotelAssignmentServiceUrls.epcLogin(),
            xhrFields: {
                withCredentials: true,
                XDomainRequest: true
            }
        }).done(haveSession).fail(noSession);
    }

    function haveSession(data, textStatus, jqxhr) {
        loadEnd();
        try {
            var result = JSON.parse(data);
            var admin = result.admin;
            var username = result.username;
            ga('send', 'event', 'epc-login', 'success', username);
            localStorage.setItem("AuthToken", jqxhr.getResponseHeader('X-Auth-Token'));
            localStorage.setItem("username", username);
            localStorage.setItem("admin", admin);
            render(STATE_HAVE_SESSION);
            if (admin) {
                window.location.href = "/test-properties/schedules-admin"
            } else {
                window.location.href = "/test-properties/schedules";
            }
        } catch (e) {
            localStorage.setItem("admin", false);
            render(STATE_ERROR, e);
        }
    }

    function noSession(jqxhr) {
        loadEnd();
        if (jqxhr.status == 403 || jqxhr.status == 401) {
            render(STATE_NO_SESSION);
            window.location.href = expediaPartnerCentralUrls.login(hotelAssignmentServiceUrls.epcRedirect());
        } else {
            ga('send', 'event', 'epc-login', 'failure', "unknown|" + jqxhr.statusText);
            render(STATE_ERROR, "Request failed: " + jqxhr.status + ": " + jqxhr.statusText);
        }
    }

    checkAuth();

});
