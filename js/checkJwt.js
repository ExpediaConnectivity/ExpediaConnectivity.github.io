function checkTokenExpiration() {
    var token = localStorage.getItem("AuthToken");
    if (token === null) {
        return;
    }
    var payload = token.split(".")[1];
    payload = JSON.parse(atob(payload));
    console.log(payload);

    if (payload.exp < Date.now()/1000) {
        localStorage.removeItem("AuthToken");
        window.location.href = "./login"
    }
}

checkTokenExpiration();