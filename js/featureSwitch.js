function getSearchParameters() {
      var prmstr = window.location.search.substr(1);
      return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}

function transformToAssocArray( prmstr ) {
    var params = {};
    var prmarr = prmstr.split("&");
    for ( var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        params[tmparr[0]] = tmparr[1];
    }
    return params;
}

var getParams = getSearchParameters();

function setSurveyFeature() {
    localStorage.setItem("survey", "true");
    $("#nav-main #menu-toggle").removeClass("hidden");
    $("#nav-main #menu-wrap li.mainlink").removeClass("hidden");
    $("#nav-main a#logo").attr("href", "/home");
    // console.log("Survey feature set.");
}

function unsetSurveyFeature() {
    localStorage.removeItem('survey');
    $("#nav-main #menu-toggle").addClass("hidden");
    $("#nav-main #menu-wrap li.mainlink").addClass("hidden");
    $("#nav-main a#logo").attr("href", "/");
    // console.log("Survey feature unset.");
}


$(document).ready(function() {
    if (getParams.survey == 'false') {
        unsetSurveyFeature();
    } else if (getParams.hasOwnProperty('survey') || localStorage.getItem("survey") != null) {
        setSurveyFeature();
    }
});