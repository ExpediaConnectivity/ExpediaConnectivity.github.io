
/**
 * Created by wexu on 5/22/2014.
 */
(function ($) {
    'use strict';

    (function (i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r;
        i[r] = i[r] || function () {
                (i[r].q = i[r].q || []).push(arguments);
            }, i[r].l = 1 * new Date();
        a = s.createElement(o),
            m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m);
    })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');


    /*if used by pages without EPC.BM defined*/
    if (typeof window.EPC === 'undefined') {
        window.EPC = {
            BM: {}
        }
    }

    var BusinessMetrics = EPC.BusinessMetrics = function (trackerName) {
        this._trackerName = (typeof trackerName !== 'undefined') ? this._getAlphaNumericString(trackerName) : "";
    };

    $.extend(BusinessMetrics.prototype, {
        log: function (e) {
            if (console) {
                console.log(e);
            }
        },
        createAccount: function (uaid) {
            if (this._trackerName === "") {
                ga("create", uaid, 'auto');
            } else {
                ga("create", uaid, 'auto', {name: this._trackerName});
            }
            this.log("create:" + uaid);
            //set global var for ga
            ga('set', 'referrer', this._getTrackingReferrer());
            ga('set', 'location', this._getTrackingUrl());
            ga('set', 'page', window.location.pathname);
        },
        sendEvent: function (eventRule) {
            if(typeof eventRule !== "undefined" && eventRule !== null) {
                this._sendEvent(eventRule.category, eventRule.action, eventRule.label, eventRule.value, eventRule.hitCallback);
            }
        },
        sendPageView: function () {
            ga(this._getTrackerPrefix() + "send", "pageview");
        },
        addEvent: function (selector, event, eventRule, valueCallback, hitCallback) {
            if (typeof valueCallback !== "undefined") {
                $.extend(eventRule, {valueCallback: valueCallback});
            }
            $(document).on(event, selector, eventRule, function (e) {
                var category = e.data.category;
                var action = e.data.action;
                var label = e.data.label;
                var value = e.data.value;
                if (e.data.valueCallback && (typeof e.data.valueCallback === "function")) {
                    value = valueCallback();
                }
                GA._sendEvent(category, action, label, value, hitCallback);
            });
        },
        addEventOnce: function (selector, event, eventRule, valueCallback, hitCallback) {
            if (typeof valueCallback !== "undefined") {
                $.extend(eventRule, {valueCallback: valueCallback});
            }
            $(document).one(event, selector, eventRule, function (e) {
                var category = e.data.category;
                var action = e.data.action;
                var label = e.data.label;
                var value = e.data.value;
                if (e.data.valueCallback && (typeof e.data.valueCallback === "function")) {
                    value = valueCallback();
                }
                GA._sendEvent(category, action, label, value, hitCallback);
            });
        },
        _sendEvent: function (category, action, label, value, hitCallback) {
            var newLabel = label;
            if (label != null && label !== '') {
                newLabel += ";"
            }
            newLabel += this._getEventLabelAdditionalInfo();

            var newAction = '';
            var _trafficType = this._getTrafficType();

            if(_trafficType !== ''){
                if(action != null && action !== ''){
                    newAction = action + ';TrafficType=' + _trafficType;
                }else{
                    newAction = 'TrafficType=' + _trafficType;
                }
            }else{
                newAction = action;
            }

            var sendObj = {
                'hitType': 'event',
                'eventCategory': this._getCategory(category),
                'eventAction': newAction,
                'eventLabel': newLabel
            };

            if (value) {
                $.extend(sendObj, {'eventValue': value});
            }

            if(typeof hitCallback === 'function'){
                var timeout = setTimeout(hitCallback, 1000);
                var newCallback = function(){
                    clearTimeout(timeout);
                    hitCallback();
                };
                $.extend(sendObj, {'hitCallback': newCallback});
            }
            ga(this._getTrackerPrefix() + "send", sendObj);
            this.log(sendObj);
        },
        _getVSUPID: function () {
            if (typeof SupplierPortal !== 'undefined' && typeof SupplierPortal.BusinessMetrics !== 'undefined') {
                var gaVSUPId = SupplierPortal.BusinessMetrics.MetricsData.VSUP_IDs ;
                return gaVSUPId;
            } else {
                return this._getCookie('VSUPID');
            }
        },
        _getTimeStamp: function () {
            var date = new Date();
            var utcString = date.getUTCFullYear() + '-' + (date.getUTCMonth() + 1) + '-' + date.getUTCDate() +
                ' ' + date.getUTCHours() + ':' + date.getUTCMinutes() + ':' + date.getUTCSeconds() +
                '.' + date.getUTCMilliseconds() + '+UTC';
            return utcString;
        },
        _getEventLabelAdditionalInfo: function () {
            var info = 'Timestamp=' + this._getTimeStamp() + ';VSUPID=' + this._getVSUPID();
            return info;
        },
        _getCookie: function (cname) {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1);
                if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
            }
            return "";
        },
        _getTrackerPrefix: function () {
            if (this._trackerName !== "") {
                return this._trackerName + "."
            } else {
                return "";
            }
        },
        _getTrackingUrl: function () {
            var location = window.location.protocol +
                '//' + window.location.hostname +
                window.location.pathname;
            return location;
        },
        _getTrackingReferrer: function () {
            var location = document.referrer.split('?')[0];
            return location;
        },
        _getAlphaNumericString:function (string) {
            var alphaNumericPattern = /[\W_]+/g;
            if(typeof string !== "undefined" && string !== null && (alphaNumericPattern).test(string)) {
                string = string.replace(alphaNumericPattern,"");
                console.log("GoogleAnalytics only permits alphanumeric characters for Tracker name.  Converted Tracker name property to alphanumeric only.")
            }
            return string;
        },
        _getCategory: function (category) {
            var _categoryStr = category || '',
                _isHeaderLoaded = typeof SupplierPortal_Data !== 'undefined',
                _isKeyNoteUser = _isHeaderLoaded ? SupplierPortal_Data.IsKeyNoteUser : (typeof isKeyNoteUser !== 'undefined' ? isKeyNoteUser : false),
                _isInternalUser = _isHeaderLoaded ? SupplierPortal_Data.IsInternalUser : (typeof isInternalUser !== 'undefined' ? isInternalUser : false);
            if (_categoryStr === '') {
                this.log('Metrics: The category was missing in this event!');
                return _categoryStr;
            }
            if (_isKeyNoteUser) {
                _categoryStr += '_System';
            } else if (_isInternalUser) {
                _categoryStr += '_Internal';
            }
            return _categoryStr;
        },
        _getTrafficType: function(){
            var userAgent = navigator.userAgent;
            if(userAgent != null && userAgent !== ''){
                //Check if Mobile traffic
                if(userAgent.indexOf('Mobile/') == -1){
                    return '';//We cannot determine which traffic type if there is no Mobile within the userAgent.
                }else{
                    var index = userAgent.search('Mobile/');
                    if(index + 7 < userAgent.length){
                        var subStringAfterMobile = userAgent.substring(index+7);
                        if(subStringAfterMobile.indexOf('/') == -1){
                            return 'MobileApp';
                        }else{
                            return 'MobileBrowser';
                        }
                    }else{
                        return '';//We cannot determine which traffic type if there is no string after Mobile
                    }
                }
            }else{
                return '';//We cannot get userAgent
            }
        }
    });
    var GA = EPC.BM = new BusinessMetrics();
})(jQuery);