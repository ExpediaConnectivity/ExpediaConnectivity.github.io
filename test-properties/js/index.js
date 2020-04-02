if (localStorage.getItem("AuthToken") !== null) {
    if (JSON.parse(localStorage.getItem("admin"))) {
        window.location.href = "/test-properties/schedules-admin";
    } else {
        window.location.href = "/test-properties/schedules";
    }
}

$(document).ready(function() {
    ga('send', 'event', 'login', 'access');
});
