define(function () {

    var unscheduledTable = false;


    var columns2 = [
        { title: "TUID" },
        { title: "Property ID" },
        { title: "Name" },
        { title: "Valid To", type: "date" },
        { title: "Model" },
        { title: "Currency" },
        { title: "Pricing" },
        { title: "RAT" },
        { title: "API Username" }
    ];

    var buttons2 = [
        {}
    ];

    function parseHotelData(hotels) {
        var table = [];
        for (var i in hotels) {
            var hotel = hotels[i];
            table.push(["", hotel.hotelId, hotel.hotelName, "",
                hotel.businessModel, hotel.currencyCode, hotel.pricingType, hotel.ratType, hotel.eqcAccountUsername]);

        }
        if (table.length == 0) {
            unscheduledTable.clear().draw();
        }
        return table;
    }


    return {
        init: function() {
            unscheduledTable = $("#unscheduledHotels").DataTable({
                dom: 'frtiB',
                columns: columns2,
                buttons: buttons2,
                pageLength: 100,
                ajax: function (data, callback, settings) {
                    jwtRequest("GET", hotelAssignmentServiceUrls.adminUnscheduled(), function(data, textStatus, jqxhr) {
                        console.log("Successful response for unscheduled " + jqxhr.url + " : " + jqxhr.responseText);
                        if ($("#result").hasClass("error")) {
                            $("#result").removeClass("error").text("");
                        }

                        $(document).tooltip();
                        if (jqxhr.responseText == "") {
                            unscheduledTable.clear().draw();
                        } else {
                            callback({data: parseHotelData(JSON.parse(jqxhr.responseText))});
                            unscheduledTable.order([ 3, "asc" ]).draw();
                        }
                    }, function(jqxhr) {
                        ajaxError(jqxhr, "Could not lookup unscheduled test hotels.");
                    });
                }
            });
        }
    }

});
