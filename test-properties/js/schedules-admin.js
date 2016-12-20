define(["./features"], function(features) {

    var datatable = false;
    var assignmentRequestFields = [];

    var columns = [
        {title: "TUID"},
        {title: "Property ID"},
        {title: "Name"},
        {title: "Valid To", type: "date"},
        {title: "Model"},
        {title: "Currency"},
        {title: "Pricing"},
        {title: "RAT"},
        {title: "API Username"}
    ];

    var buttons = [
        {text: "Toggle Indefinite", action: toggleIndefinite}
        //{text: "Unassign", action: displayUnassignDialog}
    ];


    function parseData(data) {
        var table = [];
        for (var i in data) {
            var tuid = data[i];
            for (var j in tuid.hotels) {
                var hotel = tuid.hotels[j];
                for (var k in hotel.dates) {
                    var date = hotel.dates[k];
                    table.push([tuid.tuid, hotel.hotelId, hotel.hotelName, date.endDate,
                        hotel.businessModel, hotel.currencyCode, hotel.pricingType, hotel.ratType, hotel.eqcAccountUsername]);
                }
            }
        }
        if (table.length == 0) {
            datatable.clear().draw();
        }
        return table;
    }

    function getNiceErrorText(jqxhr) {
        var content = jqxhr.getResponseHeader("Content-type");
        if (content.indexOf("json") >= 0) {
            var json;
            try {
                json = JSON.parse(jqxhr.responseText);
            } catch (e) {
                return jqxhr.responseText;
            }
            return json.details || json.message || json.description;
        } else if (content.indexOf("text/text")) {
            return jqxhr.responseText;
        }

        return false;
    }

    function ajaxError(jqxhr, humanError) {
        console.log("Error response for " + jqxhr.url + " : " + jqxhr.responseText);
        var details = getNiceErrorText(jqxhr);
        $("#result").addClass("error").html(humanError + (details ? "<br/>" + details : "")).effect("highlight", {color: "#D62D20"}, 700);
    }

    function loadStartButtons() {
        $(".loader").show();
        $("a.dt-button").each(function (i, el) {
            $(el).attr("data-href", $(el).attr("href")).removeAttr("href").addClass("disabled");
        });
    }

    function loadEndButtons() {
        $(".loader").hide();
        $("#result").removeClass("error");
        $("a.dt-button").each(function (i, el) {
            $(el).attr("href", $(el).attr("data-href")).removeAttr("data-href").removeClass("disabled");
        });
    }

    function toggleIndefinite(e, dt, node, config) {
        loadStartButtons();
        var hotelid = dt.cell(".selected", 1).data();
        ga('send', 'event', 'toggleIndefinite', 'request', localStorage.getItem('username') + "|" + hotelid);
        jwtRequest("POST", hotelAssignmentServiceUrls.scheduleToggleIndefinite(hotelid), function (data, textStatus, jqxhr) {
            console.log("Successful response for " + jqxhr.url + " : " + jqxhr.responseText);
            loadEndButtons();
            $("#result").text("Successfully toggled schedule expiry").effect("highlight", {color: "#FECB2F"}, 700);
            datatable.ajax.reload();
            ga('send', 'event', 'toggleIndefinite', 'success', localStorage.getItem('username') + "|" + hotelid);
        }, function (jqxhr) {
            loadEndButtons();
            ajaxError(jqxhr, "Could not toggle schedule expiry");
            ga('send', 'event', 'toggleIndefinite', 'failure', localStorage.getItem('username') + "|" + jqxhr.responseText, hotelid);
        });
    }

    function unassignHotel(tuid, hotelId) {
        loadStartButtons();
        ga('send', 'event', 'adminUnassignHotel', 'request', localStorage.getItem('username') + "|" + hotelId);
        jwtRequest("DELETE", hotelAssignmentServiceUrls.adminUnassign(tuid, hotelId), function (data, textStatus, jqxhr) {
            console.log("Successful response for " + jqxhr.url + " : " + jqxhr.responseText);
            loadEndButtons();
            $("#result").text("Successfully unassigned test property " + hotelId + " from tuid " + tuid).effect("highlight", {color: "#FECB2F"}, 700);
            $.publish('hotel.unscheduled', [hotelId]);
            ga('send', 'event', 'adminUnassignHotel', 'success', localStorage.getItem('username') + "|" + hotelId);
        }, function (jqxhr) {
            loadEndButtons();
            ajaxError(jqxhr, "Could not unassign " + hotelId);
            ga('send', 'event', 'adminUnassignHotel', 'failure', localStorage.getItem('username') + "|" + jqxhr.responseText, hotelId);
        });
    }


    function setupUnassignDialogSubmit() {
        $('#unassignForm').submit(function (event) {
            event.preventDefault();
            var tuid = $("#unassign-dialogue #tuidTxt").val();
            var hotelId = $("#unassign-dialogue #hotelIdTxt").val();
            $("#unassign-dialogue").foundation('close');
            unassignHotel(tuid, hotelId);
            return false;
        });
    }

    function displayUnassignDialog(e, dt, node, config) {
        var hotelId = dt.cell(".selected", 1).data();
        var tuid = dt.cell(".selected", 0).data();
        $("#unassign-dialogue #hotelIdTxt").val(hotelId);
        $("#unassign-dialogue #tuidTxt").val(tuid);
        $("#unassign-dialogue>div")
            .empty()
            .append($("<p/>").text("Unassign test property " + hotelId + " from tuid " + tuid + "?"))
            .parent()
            .foundation('open');
    }



    var onHotelScheduled = function(_, hotelId) {
        datatable.ajax.reload();
    }

    var onHotelUnscheduled = function(_, hotelId) {
        datatable.ajax.reload();
    }

    var onFeaturesLoaded = function() {

        if (features.isOn("admin-assign")) {
            datatable.button().add(1, {
                action: displayUnassignDialog,
                text: 'Unassign'
            });
        }

    }

    return {
        init: function () {
            $('#requestHotelForm').submit(function (event) {
                event.preventDefault();
                autoAssignHotel();
            });

            datatable = $("#hotels").DataTable({
                dom: 'lfrtiBp',
                columns: columns,
                buttons: buttons,
                lengthMenu: [[10, 25, 100, -1], [10, 25, 100, "All"]],
                pageLength: 10,
                ajax: function (data, callback, settings) {
                    jwtRequest("GET", hotelAssignmentServiceUrls.adminSchedule(), function (data, textStatus, jqxhr) {
                        console.log("Successful response for " + jqxhr.url + " : " + jqxhr.responseText);
                        if ($("#result").hasClass("error")) {
                            $("#result").removeClass("error").text("");
                        }
                        $(".dt-button").prop("disabled", true).addClass("disabled").attr("title", "Select a schedule to extend or unassign a property");
                        $(document).tooltip();
                        if (jqxhr.responseText == "") {
                            datatable.clear().draw();
                        } else {
                            callback({data: parseData(JSON.parse(jqxhr.responseText))});
                            datatable.order([3, "asc"]).draw();
                        }
                    }, function (jqxhr) {
                        ajaxError(jqxhr, "Could not lookup your scheduled test hotels.");
                    });
                }
            }).on('click', 'tr', function () {
                if ($(this).hasClass("selected")) {
                    $(this).removeClass("selected");
                    $(".dt-button").prop("disabled", true).addClass("disabled").attr("title", "Select a schedule to extend or unassign a property");
                    console.log("disabled");
                } else {
                    $("#hotels tr").removeClass("selected");
                    $(this).addClass("selected");
                    $(".dt-button").prop("disabled", false).removeClass("disabled").removeAttr("title");
                    console.log("enabled");
                }
            });

            setupUnassignDialogSubmit();
            $.subscribe('features.loaded', onFeaturesLoaded);
            $.subscribe('hotel.scheduled', onHotelScheduled);
            $.subscribe('hotel.unscheduled', onHotelUnscheduled);
        }

    }
});