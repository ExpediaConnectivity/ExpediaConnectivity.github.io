define(["./features"], function(features) {
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

    var onHotelScheduled = function(_, hotelId) {
        console.log("onHotelScheduled " + hotelId);
        unscheduledTable.ajax.reload();
    }

    var onHotelUnscheduled = function(_, hotelId) {
        console.log("onHotelUnscheduled " + hotelId);
        unscheduledTable.ajax.reload();
    }


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

    function displayAssignDialog(data) {
        $("#assign-dialogue #hotelIdTxt").val(data[1]);
        $("#assign-dialogue #usernameTxt").val(data[8]);
        $("#assign-dialogue #tuidTxt").val("");
        $("#assign-dialogue #passwordTxt").val("");
        $("#assign-dialogue .error").empty();
        $("#assign-dialogue>div")
            .empty()
            .append($("<p/>").text("Assign test property " + data[1]))
            .parent()
            .foundation('open');
    }

    function loadStart() {
        $(".loader").show();
    }

    function loadEnd() {
        $(".loader").hide();
    }

    function setupUnscheduledTable() {
        unscheduledTable = $("#unscheduledHotels").DataTable({
            dom: 'lfrtiBp',
            columns: columns2,
            buttons: buttons2,
            lengthMenu: [[10, 25, 100, -1], [10, 25, 100, "All"]],
            pageLength: 10,
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
                        unscheduledTable.order([ 2, "asc" ]).draw();
                    }
                }, function(jqxhr) {
                    displayError(jqxhr, "Could not lookup unscheduled test hotels.");
                });
            }
        });
    }

    function setupAssignDialogSubmit() {
        $('#assignForm').submit(function (event) {
            event.preventDefault();

            var password = $("#assign-dialogue #passwordTxt").val();
            var passwordError = validatePassword(password)
            if (passwordError !== true) {
                $("#assign-dialogue .error").text(passwordError);
                return false;
            }

            var tuid = $("#assign-dialogue #tuidTxt").val();
            var hotelId = $("#assign-dialogue #hotelIdTxt").val();
            var username = $("#assign-dialogue #usernameTxt").val();
            $("#assign-dialogue").foundation('close');
            assignTestProperty(tuid, hotelId, password, username);
            return false;
        });
    }

    function jsonToUriVariables(json) {
        return Object.keys(json).map(function(key){
            return encodeURIComponent(key) + '=' + encodeURIComponent(json[key]);
        }).join('&');
    }

    function displayAssignmentDetails(hotelId, tuid, username, passwordOk) {
        loadEnd();
        $("#msg-dialogue>div")
            .empty()
            .append($("<p/>").text("Test Hotel ID " + hotelId + " has been assigned to " + tuid + "."))
            .append($("<p/>").text("Username: " + username))
            .append($("<p class='" + (passwordOk?"":"error") + "'/>").text(passwordOk?"Password: [The one you provided in the request.]":"Could not set the EQC account password - please reset the password manually."))
            .parent()
            .foundation('open');
    }

    function assignTestProperty(tuid, hotelId, password, username) {
        loadStart();
        jwtRequest("POST", hotelAssignmentServiceUrls.adminAssign(tuid, hotelId), function(data, textStatus, jqxhr) {
            console.log("Successful response for " + jqxhr.url + " : " + jqxhr.responseText);

            $.publish('hotel.scheduled', [hotelId]);

            jwtRequestWithData("POST", hotelAssignmentServiceUrls.adminSetPassword(tuid, hotelId), JSON.stringify({ "password": password }), function(data, textStatus, jqxhr) {
                $("#result").html("Successfully assigned hotel: " + hotelId + ".").effect( "highlight", {color:"#FECB2F"}, 700 );
                displayAssignmentDetails(hotelId, tuid, data.eqcUsername, true)

                ga('send', 'event', 'adminAssign', 'success', localStorage.getItem('username') + "|" + jsonToUriVariables(data));
            }, function(jqxhr) {
                displayAssignmentDetails(hotelId, tuid, username, false);
                ga('send', 'event', 'adminAssign', 'password.failure', localStorage.getItem('username') + "|" + jqxhr.responseText);
            });
        }, function(jqxhr) {
            loadEnd();

            if (jqxhr.status == 409) {
                displayError("Hotel appears to be already assigned.");
            } else if (jqxhr.status == 404 && jqxhr.responseText.indexOf("User") >= 0) {
                displayError("Could not fine user for given tuid.");
            } else if (jqxhr.status == 400 && jqxhr.responseText.indexOf("A maximum of") >= 0) {
                var msg = getNiceErrorText(jqxhr);
                displayError("The test property was not assigned due to the following error: <br/> " + msg);
            } else {
                displayError("The test hotel was not assigned due to an unknown error.");
            }

            ga('send', 'event', 'adminAssign', 'failure', localStorage.getItem('username') + "|" + jqxhr.responseText);
        });
    }


    function validatePassword(password) {
        if (!password) {
            return "You must specify a password to use for API calls.";
        }

        if (password.length < 8) {
            return "Password must be 8 characters or longer";
        }

        if (!password.match(/[A-Z]/) || !password.match(/[a-z]/)) {
            return "Password must contain uppercase (A-Z) and lowercase (a-z) characters"
        }

        if (!password.match(/[0-9]/)) {
            return "Password must contain a number"
        }

        if (!password.match(/[^0-9a-zA-Z]/)) {
            return "Password must contain a symbol"
        }

        return true;
    }

    function getNiceErrorText(jqxhr) {
        var content = jqxhr.getResponseHeader("Content-type");
        if (content.indexOf("json") >= 0) {
            var json;
            try {
                json = JSON.parse(jqxhr.responseText);
                if (json && json.message && json.message.length > 0) {
                    return json.message;
                }

            } catch (e) {
                /* continue */
            }
        }

        return false;
    }


    function displayError(msg) {
        $("#result").addClass("error").html(msg).effect( "highlight", {color:"#D62D20"}, 700 );
    }

    var onFeaturesLoaded = function() {

        unscheduledTable.on('click', 'tr', function() {
            if (this.rowIndex > 0) {
                displayAssignDialog(unscheduledTable.row(this).data());
            }
        })

    }

    return {
        init: function() {
            setupUnscheduledTable();
            setupAssignDialogSubmit();
            $.subscribe('features.loaded', onFeaturesLoaded);
            $.subscribe('hotel.scheduled', onHotelScheduled);
            $.subscribe('hotel.unscheduled', onHotelUnscheduled);
        }
    }

});
