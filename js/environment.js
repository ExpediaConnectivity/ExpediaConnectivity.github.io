var environment = {
    env: "test",

    isProd: function() {
        return (this.env == "prod");
    }
};

switch (window.location.host) {
    case "expediaconnectivity.com": environment.env = "prod"; break
    default: environment.env = "test"; break
}

console.log("Environment: " + environment.env);