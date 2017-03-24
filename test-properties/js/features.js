define(function () {

    var features = {};

    function loadFeatures() {

        jwtRequest("GET", hotelAssignmentServiceUrls.features(), function(data, textStatus, jqxhr) {
            parseFeatures(JSON.parse(jqxhr.responseText));
            console.log("features.loaded: " + jqxhr.responseText);
            $.publish('features.loaded');
        }, function(jqxhr) {
            console.log("Could not lookup features. ");
            console.log(jqxhr.responseText);
        });

        $.publish('features.loaded');
    }


    function parseFeatures(featureData) {
        try {
            for (i in featureData) {
                features[featureData[i]["name"]] = featureData[i]["payload"];
            }
        } catch (e) {
            console.log("Could not parse features: " + featureData);
        }
    }

    return {
        init: function() {
            loadFeatures();
        },

        isOn: function(name) {

            try {

                if (typeof features[name] === "undefined") {
                    return false;
                }

                return features[name].isOn;
            } catch (e) {
                console.log("error while checking isOn for feature: " + name);
                return false;
            }

        }

    }

});
