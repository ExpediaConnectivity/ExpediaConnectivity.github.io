function hotelAssignmentServiceBaseUrl() {
    return environment.isProd() ? "https://hotel-assignment-service.prod-p.expedia.com" : "https://hotel-assignment-service.test.expedia.com";
}

var hotelAssignmentServiceUrls = {
    login: function() {
        return hotelAssignmentServiceBaseUrl() + "/v1/properties/login";
    },

    schedule: function() {
        return hotelAssignmentServiceBaseUrl() + "/v1/schedule";
    },

    factors: function() {
        return hotelAssignmentServiceBaseUrl() + "/v1/hotels/factors";
    },

    assign: function() {
        return hotelAssignmentServiceBaseUrl() + "/v1/schedule/assign";
    },

    scheduleHotel: function(hotelId) {
        return hotelAssignmentServiceUrls.schedule() + "/hotelId/" + hotelId;
    },

    scheduleExtend: function(hotelId) {
        return hotelAssignmentServiceUrls.scheduleHotel(hotelId) + "/extend";
    },

    setPassword: function(hotelId) {
        return hotelAssignmentServiceUrls.scheduleHotel(hotelId) + "/change";
    }
}