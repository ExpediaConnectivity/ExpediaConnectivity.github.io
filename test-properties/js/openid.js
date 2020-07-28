$(document).ready(function() {
    ga('send', 'event', 'openid', 'access');

    var STATE_CHECKING_SESSION = 'checkingSession',
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
        if (localStorage.getItem('AuthToken') === null) {
            noSession({status:401});
        } else {
            jwtRequest('GET', hotelAssignmentServiceUrls.users() + '/jwt', haveSession, noSession);
        }
    }

    function haveSession() {
        loadEnd();
        render(STATE_HAVE_SESSION);
        if (localStorage.getItem('admin')) {
            window.location.href = "/test-properties/schedules-admin"
        } else {
            window.location.href = "/test-properties/schedules";
        }
    }

    function noSession(jqxhr) {
        loadEnd();
        if (jqxhr.status == 403 || jqxhr.status == 401) {
            if (window.location.search.indexOf('code=') !== -1) {
                validateCode();
            } else {
                render(STATE_NO_SESSION);
                window.location.href = hotelAssignmentServiceUrls.users() + '/oidc/redirect';
            }
        } else {
            ga('send', 'event', 'openid', 'failure', "unknown|" + jqxhr.statusText);
            render(STATE_ERROR, "Request failed: " + jqxhr.status + ": " + jqxhr.statusText);
        }
    }

    function validateCode() {
        loadStart();
        $.ajax({
            method: "POST",
            url: hotelAssignmentServiceUrls.users() + '/oidc/validate' + window.location.search,
            xhrFields: {
                withCredentials: true,
                XDomainRequest: true
            }
        }).done(validated).fail(invalid);
    }

    function validated(data, textStatus, jqxhr) {
        loadEnd();
        try {
            var result = JSON.parse(data);
            var admin = result.admin;
            var username = result.username;
            ga('send', 'event', 'openid', 'success', username);
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

    function invalid(jqxhr) {
        loadEnd();
        ga('send', 'event', 'openid', 'failure', "unknown|" + jqxhr.statusText);
        var errorMessage = "Request failed: " + jqxhr.status + ": " + jqxhr.statusText + ".";
        if (jqxhr.status == 403) {
            errorMessage += "  Please use your Connectivity Vendor account to access this system.";
        }
        render(STATE_ERROR, errorMessage);
    }

    checkAuth();

});
