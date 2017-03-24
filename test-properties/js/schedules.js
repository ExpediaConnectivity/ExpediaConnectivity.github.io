function loadStart() {
    $(".loader").show();
    $("#requestHotelForm input").attr("disabled", true).addClass("disabled");
}

function loadEnd() {
    $(".loader").hide();
    $("#result").removeClass("error");
    $("#requestHotelForm input").removeAttr("disabled").removeClass("disabled");
}

function loadStartButtons() {
    $(".loader").show();
    $("a.dt-button").each(function(i, el) {
        $(el).attr("data-href", $(el).attr("href")).removeAttr("href").addClass("disabled");
    });
}

function loadEndButtons() {
    $(".loader").hide();
    $("#result").removeClass("error");
    $("a.dt-button").each(function(i, el) {
        $(el).attr("href", $(el).attr("data-href")).removeAttr("data-href").removeClass("disabled");
    });
}

var datatable = false;
var assignmentRequestFields = [];

var columns = [
    { title: "Property ID" },
    { title: "Name" },
    { title: "Valid To", type: "date" },
    { title: "Model" },
    { title: "Currency" },
    { title: "Pricing" },
    { title: "RAT" },
    { title: "API Username" }
];

var buttons = [
    { text: "Unassign", action: unassign },
    { text: "Extend", action: extend },
    { text: "Reset Password", action: resetPassword }
];

$(document).ready(function() {
    $("#reset").submit(function() {
        var hotelid = $("#reset").data("hotelid");
        console.log("reset");
        var password = $("#reset-dialogue #password").val();
        var passwordError = validatePassword(password)
        if (passwordError !== true) {
            $("#reset-dialogue .error").text(passwordError);
            return false;
        }
        $("#reset-dialogue").foundation('close');
        loadStartButtons();
        ga('send', 'event', 'pwreset', 'request', localStorage.getItem('username'));
        jwtRequestWithData("POST", hotelAssignmentServiceUrls.setPassword(hotelid), JSON.stringify({ "password": password }), function(data, textStatus, jqxhr) {
            loadEndButtons();
            $("#result").text("Successfully reset password of hotel ID " + hotelid).effect( "highlight", {color:"#FECB2F"}, 700 );
            console.log(data);
            ga('send', 'event', 'pwreset', 'success', localStorage.getItem('username'));
        }, function(jqxhr) {
            loadEndButtons();
            ajaxError(jqxhr, "Could not reset password for hotel ID " + hotelid);
            ga('send', 'event', 'pwreset', 'failure', localStorage.getItem('username') + "|" + jqxhr.responseText);
        });
        return false;
    });

    $('#requestHotelForm').submit(function (event) {
        event.preventDefault();
        autoAssignHotel();
        return false;
    });

    datatable = $("#hotels").DataTable({
        dom: 'frtiB',
        columns: columns,
        buttons: buttons,
        pageLength: 100,
        ajax: function (data, callback, settings) {
            jwtRequest("GET", hotelAssignmentServiceUrls.schedule(), function(data, textStatus, jqxhr) {
                console.log("Successful response for " + jqxhr.url + " : " + jqxhr.responseText);
                if ($("#result").hasClass("error")) {
                    $("#result").removeClass("error").text("");
                }
                $(".dt-button").addClass("disabled").attr("title", "Select a property from the table first");
                $(document).tooltip();
                if (jqxhr.responseText == "") {
                    datatable.clear().draw();
                } else {
                    callback({data: parseData(JSON.parse(jqxhr.responseText))});
                    datatable.order([ 2, "asc" ]).draw();
                }
            }, function(jqxhr) {
                ajaxError(jqxhr, "Could not lookup your scheduled test hotels.");
                $(".dt-button").addClass("disabled").attr("title", "Select a property from the table first");
                if (datatable && datatable.length == 0) {
                    datatable.clear().draw();
                }
            });
        }
    }).on('click', 'tr', function() {
        if ($(this).hasClass("selected")) {
            $(this).removeClass("selected");
            $(".dt-button").addClass("disabled").attr("title", "Select a property from the table first");
            console.log("disabled");
        } else if (datatable && datatable.data().length != 0) {
            $("#hotels tr").removeClass("selected");
            $(this).addClass("selected");
            $(".dt-button").removeClass("disabled").removeAttr("title");
            console.log("enabled");
        }
    });

    $.getJSON(hotelAssignmentServiceUrls.factors(), parseFactors);
});

function parseData(data) {
    var table = [];
    for (var i in data) {
        var tuid = data[i];
        for (var j in tuid.hotels) {
            var hotel = tuid.hotels[j];
            for (var k in hotel.dates) {
                var date = hotel.dates[k];
                table.push([hotel.hotelId, hotel.hotelName, date.endDate,
                    hotel.businessModel, hotel.currencyCode, hotel.pricingType, hotel.ratType, hotel.eqcAccountUsername]);
            }
        }
    }
    if (datatable.length == 0) {
        $(".dt-button").addClass("disabled").attr("title", "Select a property from the table first");
    }
    if (table.length == 0) {
        datatable.clear().draw();
    }
    return table;
}

function parseFactors(factors) {
    var factorsLoc = $('#factors');
    for (var i in factors) {
        var factor = factors[i];
        var label = $('<label>').text(factor.displayName);
        assignmentRequestFields.push(factor.factorName);
        var sel = $('<select>').attr("name", factor.factorName);
        sel.attr("id", "val_" + factor.factorName);
        sel.append($('<option>').prop("selected", true).attr('value', '').text('No preference'));
        for (var j in factor.validValues) {
            var value = factor.validValues[j];
            sel.append($('<option>').attr('value', value).text(value));
        }
        var elem = $("<div class='factor large-6 medium-12 columns'>").attr("id", factor.factorName).append(label).append(sel);
        factorsLoc.append(elem);

        if (factor.factorName == "businessModel") {
            sel.change(businessModelChanged);
        }
    }
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
    try {
        console.log("Error response for " + jqxhr.url + " : " + jqxhr.responseText);

        if (jqxhr) {
            var details = getNiceErrorText(jqxhr);
        }
    } catch (e) {
        console.log(humanError);
        console.log(jqxhr);
    }
    $("#result").addClass("error").html(humanError + (details ? "<br/>" + details : "")).effect( "highlight", {color:"#D62D20"}, 700 );
}

function createAssignmentRequest() {
    var request = {};
    for (var i in assignmentRequestFields) {
        var val = $('#val_' + assignmentRequestFields[i]).val();
        if (val != '') {
            request[assignmentRequestFields[i]] = val;
        }
    }
    return JSON.stringify(request);
}

function jsonToUriVariables(json, deliminator) {
    return Object.keys(json).map(function(key){
        return key + '=' + json[key];
    }).join(deliminator);
}

function autoAssignHotel() {
    var password = $("#requestHotelForm #password").val();
    var passwordError = validatePassword(password)
    if (passwordError !== true) {
        $("#result").addClass("error").text(passwordError);
        return;
    }
    loadStart();
    var assignmentData = createAssignmentRequest();
    ga('send', 'event', 'assign', 'request', localStorage.getItem('username') + "|" + jsonToUriVariables(JSON.parse(assignmentData), '|'));
    jwtRequestWithData("POST", hotelAssignmentServiceUrls.assign(), assignmentData, function(data, textStatus, jqxhr) {
        console.log("Successful response for " + jqxhr.url + " : " + jqxhr.responseText);
        var hotel = JSON.parse(jqxhr.responseText);
        var hotelId = hotel.hotelId;
        datatable.ajax.reload(function() {
            $("#hotels>tbody>tr>td:first-child:contains(" + hotelId + ")").last().parent().children().effect( "highlight", {color:"#FECB2F"}, 700 );
        });
        jwtRequestWithData("POST", hotelAssignmentServiceUrls.setPassword(hotelId), JSON.stringify({ "password": password }), function(data, textStatus, jqxhr) {
            loadEnd();
            $("#result").html("Successfully assigned hotel: " + hotelId + ". <a href='./info' target='_blank'>What's Next?</a>").effect( "highlight", {color:"#FECB2F"}, 700 );
            console.log(data);
            $("#account-dialogue>div")
                .empty()
                .append($("<p/>").text("Test Hotel ID " + hotelId + " has been assigned to you.  To use it, please use these credentials in API calls:"))
                .append($("<p/>").text("Username: " + data.eqcUsername))
                .append($("<p/>").text("Password: [The one you set in the request.]"))
                .parent()
                .foundation('open');

            ga('send', 'event', 'assign', 'success', localStorage.getItem('username') + "|" + jsonToUriVariables(hotel, '|'));
        }, function(jqxhr) {
            loadEnd();
            ajaxError(jqxhr, "Successfully assigned hotel " + hotelId + " but could not set EQC password - please reset the password for the hotel manually.");
            ga('send', 'event', 'assign', 'password.failure', localStorage.getItem('username') + "|" + jqxhr.responseText);
        });
    }, function(jqxhr) {
        loadEnd();
        if (jqxhr.status == 409) {
            ajaxError(null, "No hotels to assign which match your preferences, please email <a href='mailto:eqcss" + "@expedia.com'>eqcss" + "@expedia.com</a>");;
        } else {
            ajaxError(jqxhr, "Could not schedule a test hotel.");
        }

        ga('send', 'event', 'assign', 'failure', localStorage.getItem('username') + "|" + jqxhr.responseText);
    });
}

function unassign(e, dt, node, config) {
    console.log("unassign");
    loadStartButtons();
    var hotelid = dt.cell(".selected", 0).data();
    ga('send', 'event', 'unassign', 'request', localStorage.getItem('username') + "|" + hotelid);
    jwtRequest("DELETE", hotelAssignmentServiceUrls.scheduleHotel(hotelid), function(data, textStatus, jqxhr) {
        console.log("Successful response for " + jqxhr.url + " : " + jqxhr.responseText);
        loadEndButtons();
        $("#result").text("Successfully unassigned hotel").effect( "highlight", {color:"#FECB2F"}, 700 );
        datatable.ajax.reload();
        ga('send', 'event', 'unassign', 'success', localStorage.getItem('username') + "|" + hotelid);
    }, function(jqxhr) {
        loadEndButtons();
        ajaxError(jqxhr, "Could not unassign a test hotel.");
        ga('send', 'event', 'unassign', 'failure', localStorage.getItem('username') + "|" + jqxhr.responseText, hotelid);
    });
}

function extend(e, dt, node, config) {
    console.log("extend");
    var hotelid = dt.cell(".selected", 0).data();
    var currentExpiryDate = new Date(dt.cell(".selected", 2).data()).getTime();
    var today = new Date();
    var newExpiryDate = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) + 14 * 24*60*60*1000;
    if (currentExpiryDate >= newExpiryDate) {
        $("#extend-dialogue").foundation('open');
        return;
    }
    loadStartButtons();
    ga('send', 'event', 'extend', 'request', localStorage.getItem('username') + "|" + hotelid);
    jwtRequest("POST", hotelAssignmentServiceUrls.scheduleExtend(hotelid), function(data, textStatus, jqxhr) {
        console.log("Successful response for " + jqxhr.url + " : " + jqxhr.responseText);
        loadEndButtons();
        $("#result").text("Successfully extended hotel").effect( "highlight", {color:"#FECB2F"}, 700 );
        datatable.ajax.reload();
        ga('send', 'event', 'extend', 'success', localStorage.getItem('username') + "|" + hotelid);
    }, function(jqxhr) {
        loadEndButtons();
        ajaxError(jqxhr, "Could not extend a test hotel.");
        ga('send', 'event', 'extend', 'failure', localStorage.getItem('username') + "|" + jqxhr.status, hotelid);
    });
}

function resetPassword(e, dt, node, config) {
    var hotelid = dt.cell(".selected", 0).data();
    $("#reset").data("hotelid", hotelid);
    $("#reset-dialogue>div")
        .empty()
        .append($("<p/>").text("Reset the password of Test Hotel ID " + hotelid + "."))
        .parent()
        .foundation('open');
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

function businessModelChanged() {
    $("#val_ratType option").removeAttr("disabled");
    if ($(this).val() == "Expedia Collect & Hotel Collect (ETP)") {
        $("#val_ratType option[value='Lowest Available Rate']").removeAttr("selected").attr("disabled", "disabled");
    } else if ($(this).val() == "Expedia Collect Only") {
        $("#val_ratType option[value='SELL']").removeAttr("selected").attr("disabled", "disabled");
    } else if ($(this).val() == "Hotel Collect Only") {
        $("#val_ratType option[value!='']").removeAttr("selected").attr("disabled", "disabled");
        $("#val_ratType option[value='SELL']").removeAttr("disabled").attr('selected');
    }
}