function loadStart() {
    $(".loader").show();
    $("#loginform input").attr("disabled", true).addClass("disabled");
}

function loadEnd() {
    $(".loader").hide();
    $("#result").removeClass("error");
    $("#loginform input").removeAttr("disabled").removeClass("disabled");
}

function login(form) {
    var username = $(form).find("#username").val();
    var password = $(form).find("#password").val();

    ga('send', 'event', 'login', 'request', username);
    $.ajax({
        method: "POST",
        url: hotelAssignmentServiceUrls.login(),
        xhrFields: {
            withCredentials: false,
            XDomainRequest: true
        },
        beforeSend: function(xhr) {
            if (username) {
                xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
            }
            loadStart();
        }
    }).done(function(data, textStatus, jqxhr) {
        loadEnd();
        ga('send', 'event', 'login', 'success', username);
        localStorage.setItem("AuthToken", jqxhr.getResponseHeader('X-Auth-Token'));
        localStorage.setItem("username", username);
        try {
            if (JSON.parse(data).admin) {
                window.location.href = "/test-properties/schedules-admin"
            } else {
                window.location.href = "/test-properties/schedules";
            }
        } catch (e) {
            window.location.href = "/test-properties/schedules";
        }
    }).fail(function(jqxhr) {
        loadEnd();
        ga('send', 'event', 'login', 'failure', username + "|" + jqxhr.statusText);
        if (jqxhr.status == 403 || jqxhr.status == 401) {
            if (username.match(/^eqc/i) != null) {
                $("#result").addClass("error").html("API/EQC credentials can not be used to access this feature.  Please use your EPC (e.g. SYS_) credentials.");
            } else {
                $("#result").addClass("error").html("Incorrect username or password.");
            }
        } else {
            $("#result").addClass("error").html("Request failed: " + jqxhr.status + ": " + jqxhr.statusText);
        }
    });
}

if (localStorage.getItem("AuthToken") !== null) {
    window.location.href = "/test-properties/schedules";
}

$(document).ready(function() {
    ga('send', 'event', 'login', 'access');
    if (window.location.hash == "#registered") {
        $("#result").text("You've successfully registered as '" + localStorage.getItem("username") + "'");
        $("#username").val(localStorage.getItem("username"));
    }
});