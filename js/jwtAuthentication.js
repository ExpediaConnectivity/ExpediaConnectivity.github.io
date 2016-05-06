function checkTokenExpiration() {
    var token = localStorage.getItem("AuthToken");
    if (token === null) {
        return;
    }

    $("#logoutnav").show();
    $("#hotelnav").show();
    $("#apikeynav").show();
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

function jwtRequest(method, url, done, error) {
    $.ajax({
        method: method,
        url: url,
        xhrFields: {
            withCredentials: true,
            XDomainRequest: true
        },
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("AuthToken"));
        }
    }).done(done).fail(error);
}

function jwtRequestWithData(method, url, data, done, error) {
    $.ajax({
        method: method,
        url: url,
        data: data,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        xhrFields: {
            withCredentials: true,
            XDomainRequest: true
        },
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("AuthToken"));
        }
    }).done(done).fail(error);
}

$(document).ready(checkTokenExpiration);