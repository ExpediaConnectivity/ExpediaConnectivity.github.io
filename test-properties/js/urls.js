function hotelAssignmentServiceBaseUrl() {
    switch (environment.env) {
        case "prod": return "https://api.expediapartnercentral.com/hotel-assignment";
        case "dev":  return "http://localhost:8082";
        default:     return "https://api.expediapartnercentral.com.integration.sb.karmalab.net/hotel-assignment";
    }
}

function expediaPartnerCentralBaseUrl() {
    switch (environment.env) {
        case "prod": return "https://www.expediapartnercentral.com";
        default:     return "https://www.expediapartnercentral.com.integration.sb.karmalab.net";
    }
}

var hotelAssignmentServiceUrls = {
    users: function() {
        return hotelAssignmentServiceBaseUrl() + "/v1/users";
    },

    login: function() {
        return hotelAssignmentServiceUrls.users() + "/login";
    },

    register: function() {
        return hotelAssignmentServiceUrls.users() + "/register";
    },

    schedule: function() {
        return hotelAssignmentServiceBaseUrl() + "/v1/schedule";
    },

    adminSchedule: function() {
        return hotelAssignmentServiceBaseUrl() + "/v1/schedule/all";
    },

    adminUnscheduled: function() {
        return hotelAssignmentServiceBaseUrl() + "/v1/hotels/all?unscheduledOnly=true";
    },

    factors: function() {
        return hotelAssignmentServiceBaseUrl() + "/v1/hotels/factors";
    },

    assign: function() {
        return hotelAssignmentServiceBaseUrl() + "/v1/schedule/assign";
    },

    adminAssign: function(tuid, hotelId) {
        return hotelAssignmentServiceBaseUrl() + "/v1/schedule/admin/" + tuid + "/assign/" + hotelId;
    },

    scheduleHotel: function(hotelId) {
        return hotelAssignmentServiceUrls.schedule() + "/hotelId/" + hotelId;
    },

    scheduleExtend: function(hotelId) {
        return hotelAssignmentServiceUrls.scheduleHotel(hotelId) + "/extend";
    },

    setPassword: function(hotelId) {
        return hotelAssignmentServiceUrls.scheduleHotel(hotelId) + "/change";
    },

    adminSetPassword: function(tuid, hotelId) {
        return hotelAssignmentServiceBaseUrl() + "/v1/schedule/admin/" + tuid + "/change/" + hotelId;
    },

    adminUnassign: function(tuid, hotelId) {
        return hotelAssignmentServiceBaseUrl() + "/v1/schedule/admin/" + tuid + "/" + hotelId;
    },

    scheduleToggleIndefinite: function(hotelId) {
        return hotelAssignmentServiceUrls.scheduleHotel(hotelId) + "/toggleRestricted";
    },

    features: function() {
        return hotelAssignmentServiceBaseUrl() + "/v1/users/features";
    },

}
