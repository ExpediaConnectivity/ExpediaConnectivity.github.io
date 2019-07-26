function loadStart() {
    $('#loginFailed').hide();
    $("#result").removeClass("error").html('');
    $('#loggingIn').show();
    $(".loader").show();
}

function loadEnd() {
    $(".loader").hide();
    $('#loggingIn').hide();
    $("#result").removeClass("error").html('');
}

function checkAuth() {
    $.ajax({
        method: "POST",
        url: hotelAssignmentServiceUrls.epcLogin(),
        xhrFields: {
            withCredentials: true,
            XDomainRequest: true
        },
        beforeSend: function(xhr) {
            loadStart();
        }
    }).done(function(data, textStatus, jqxhr) {
        loadEnd();
        try {
            var result = JSON.parse(data);
            var admin = result.admin;
            var username = result.username;
            ga('send', 'event', 'epc-login', 'success', username);
            localStorage.setItem("AuthToken", jqxhr.getResponseHeader('X-Auth-Token'));
            localStorage.setItem("username", username);
            localStorage.setItem("admin", admin);

            $('#result').html('Login succeeded.  Redirecting...');

            if (admin) {
                window.location.href = "/test-properties/schedules-admin"
            } else {
                window.location.href = "/test-properties/schedules";
            }
        } catch (e) {
            localStorage.setItem("admin", false);
            $("#result").addClass("error").html("Error: " + e);
        }
    }).fail(function(jqxhr) {
        loadEnd();
        ga('send', 'event', 'epc-login', 'failure', "unknown|" + jqxhr.statusText);
        if (jqxhr.status == 403 || jqxhr.status == 401) {
            $('#loginFailed').show();
        } else {
            $("#result").addClass("error").html("Request failed: " + jqxhr.status + ": " + jqxhr.statusText);
        }
    });
}

$(document).ready(function() {
    ga('send', 'event', 'epc-login', 'access');
    checkAuth();
});
