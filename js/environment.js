var environment = {
    env: "test",

    isProd: function() {
        return (this.env == "prod");
    }
};

if (window.location.host == "expediaconnectivity.com") {
    environment.env = "prod";
} else {
    environment.env = "test";
}

console.log("Environment: " + environment.env);