define(function () {

    var features = {};

    function loadFeatures() {

        /*
        jwtRequest("GET", hotelAssignmentServiceUrls.features(), function(data, textStatus, jqxhr) {
            console.log("Successful response for features " + jqxhr.url + " : " + jqxhr.responseText);
            parseFeatures(JSON.parse(jqxhr.responseText));
            $.publish('features.loaded');

        }, function(jqxhr) {
            console.log("Could not lookup features test hotels. ");
            console.log(jqxhr.responseText);
        });
        */

        parseFeatures(JSON.parse('[{"payload": {"isOn": true}, "name": "admin-assign"}]'));
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
