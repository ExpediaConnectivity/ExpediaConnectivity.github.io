function checkTokenExpiration() {
    var token = localStorage.getItem("AuthToken");
    if (token === null) {
        return;
    }

    $("#logout").show();
    var payload = token.split(".")[1];
    payload = JSON.parse(atob(payload));
    console.log(payload);

    if (payload.exp < Date.now()/1000) {
        localStorage.removeItem("AuthToken");
        if (window.location.pathname.indexOf("/test-properties") == 0) {
            window.location.href = "/test-properties/"
        }
    }
}

function logout() {
    localStorage.removeItem("AuthToken");
    window.location.href = "/test-properties/"
}

$(document).ready(checkTokenExpiration);