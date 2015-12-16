/*
 * Created by ngrieble on 5/1/15.
 */
(function ($) {
    'use strict';

    /*if used by pages without EPC.EventTracker defined*/
    if(!window.EPC) {
        window.EPC = {
            EventTracker: {}
        };
    }

    /*
     * This object is used to track generic page events
     * 
     * To initialize the object call the init function. Parameters:
     *	    gaAccount = the google analytics account number	
     *	    teamName = name of the overall team that owns the page	
     *		pageName = name of the current page that will be used for logging
     *		isOnboarding = whether this page is in the onboarding path or not
     * 
     * This object tracks the following events:
     *		Page Load
     *		Link Clicks
     *		Button Clicks
     *		Checkboxes
     *		DropDown Selection
     *		Text Input Buttons
     *		Showing Errors
     * 
     */
    var EventTracker = EPC.EventTracker = function () {};

    $.extend(EventTracker.prototype, {

        // Public Objects
        trackingName : "",
        isInitialized : false,
        epcga : {},

        /*
         *	Tracks when invalid input is given by a user
         * 	Requires the 'data-gaEventElement' attribute is set on element
         */
        invalidInput : function(element) {
            var field = element.attr('data-gaEventElement');
            var val = element.val();

            if(field !== undefined){
                this._sendEvent(this.Events.userEvent.ERROR, field, val, undefined, undefined);
            }
        },

        /*
         * Tracking of buttons that require page redirection
         * 	Primarily used for submit and cancel buttons
         * 	Call using redirectButtons.
         *
         *  Use google analytics 'hitCallback' to push a callback which will do the redirect
         *  before calling the below functions
         */

        submitButtonAction: function (callback) {
            this._sendEvent(this.Events.userEvent.CLICK, this.Events.eventAction.SUBMIT_BUTTON, undefined, undefined, callback);
        },

        cancelButtonAction: function (callback) {
            this._sendEvent(this.Events.userEvent.CLICK, this.Events.eventAction.CANCEL_BUTTON, undefined, undefined, callback);
        },

        redirectAction: function (element, callback) {
            var field = element.attr('data-gaEventElement');

            if(field !== undefined){
                this._sendEvent(this.Events.userEvent.CLICK, field, undefined, undefined, callback);
            }
        },
        /*
         *	Tracking of non-user created errors
         * 	Primarily used for JSON, AJAX, and page load errors
         * 	Call using redirectButtons.
         */

        jsonResponseError: function () {
            this._sendEvent(this.Events.userEvent.ERROR, this.Events.eventAction.JSON_RESPONSE, undefined, undefined, undefined);
        },

        ajaxCallFail: function () {
            this._sendEvent(this.Events.userEvent.ERROR, this.Events.eventAction.AJAX_CALL, undefined, undefined, undefined);
        },

        pageLoadError: function () {
            this._sendEvent(this.Events.userEvent.ERROR, this.Events.eventAction.PAGE_LOADED, undefined, undefined, undefined);
        },

        pageParamsError: function(errorEvent, errorCode) {
            if(errorEvent === undefined || errorCode === undefined || errorEvent === "" || errorCode === "") {
                this._sendEvent(this.Events.userEvent.SYSTEM_ERROR, this.Events.eventAction.UNDEFINED_ERROR, undefined, undefined, undefined);
            }
            else {
                this._sendEvent(this.Events.userEvent.SYSTEM_ERROR, errorEvent, errorCode, errorCode, undefined);
            }
        },

        /*
         *   Tracking the system actions
         *   Primarily used for the submission of rate plans and room types through the system
         *   Call using system.
         */
        successStatus: function(event, eventCode) {
            if(event !== undefined && eventCode !== undefined) {
                var eventMessage = event + "." + this.Events.eventLabel.SUCCESS;
                this._sendEvent(this.Events.userEvent.SYSTEM_STATUS, eventMessage, eventCode, undefined, undefined);
            }
        },

        errorStatus: function(event, errorCode, errorType) {
            if(event !== undefined && errorCode !== undefined && errorType !== undefined) {
                var eventMessage = event + "." + this.Events.eventLabel.ERROR;
                var errorInfo = errorCode + "|" + errorType;
                this._sendEvent(this.Events.userEvent.SYSTEM_ERROR, eventMessage, errorInfo, undefined, undefined);
            }
        },

        // ****** CONSTANTS ****** //
        Events : {
            // Event actions, please add the each entity before using
            eventAction: {
                /*************RedirectButtons************************/
                SUBMIT_BUTTON: "Submit_Button",
                CANCEL_BUTTON: "Cancel_Button",

                /*************Errors************************/
                JSON_RESPONSE: "JSON_Response_Error",
                AJAX_CALL: "AJAX_Call_Fail",
                PAGE_LOADED: "Page_Load_Error",
                UNDEFINED_ERROR: "Undefined_Error"
            },

            // These labels represent user generated actions performed on the page
            eventLabel: {
                CHECKBOX_CHECKED: "Checkbox_Checked",
                CHECKBOX_UNCHECKED: "Checkbox_Unchecked",
                SUCCESS: "Success",
                ERROR: "Error"
            },

            // These labels represent user generated events performed on the page
            userEvent: {
                PAGE_LOAD: "System.Page_Load",
                CLICK: "User.Click",
                SELECT: "User.Select",
                INPUT: "User.Input",
                ERROR: "User.Error",
                SYSTEM_STATUS: "System.Status",
                SYSTEM_ERROR: "System.Error"
            },

            lifecycle: {
                ONBOARDING: "LifecyclePhase=Onboarding",
                MAINTENANCE: "LifecyclePhase=Maintenance"
            },

            UNDEFINED_PAGEVIEW: "Undefined pageView"
        },

        // ****** PRIVATE FUNCTIONS ****** //
        _loadEvents : function () {
            var self = this;
            /*
             * 	Tracks any clicks on the page
             * 	Requires the 'data-gaEventElement' attribute is set on the target
             */
            $('body').on('mousedown', '*[data-gaEventElement]', function(evt) {
                var field = $(evt.currentTarget).attr('data-gaEventElement');

                if(field !== undefined){

                    // Track clicks on different elements
                    switch (evt.currentTarget.nodeName) {
                        case "A": // links
                            self._sendEvent(self.Events.userEvent.CLICK, field, undefined, undefined, undefined);
                            break;
                        case "BUTTON": // buttons
                            self._sendEvent(self.Events.userEvent.CLICK, field, undefined, undefined, undefined);
                            break;
                        case "IMG": // tooltips
                            self._sendEvent(self.Events.userEvent.CLICK, field, undefined, undefined, undefined);
                            break;
                        case "SPAN": // icons
                            self._sendEvent(self.Events.userEvent.CLICK, field, undefined, undefined, undefined);
                            break;
                        default:
                            break;
                    }
                }
            });

            /*
             * 	Tracks any change events on the page
             * 	Requires the 'data-gaEventElement' attribute is set on the target
             */
            $('body').on('change', '*[data-gaEventElement]', function(evt) {
                var field = $(evt.currentTarget).attr('data-gaEventElement');

                if(field !== undefined){

                    // Track changes of different elements
                    switch (evt.currentTarget.nodeName) {
                        case "SELECT": // Dropdowns
                            self._sendEvent(self.Events.userEvent.SELECT, field, $(evt.currentTarget).val(), undefined, undefined);
                            break;
                        case "INPUT": // Checkboxes
                            if($(evt.currentTarget).attr('type') === "checkbox") {
                                if ($(evt.currentTarget).prop('checked')){
                                    self._sendEvent(self.Events.userEvent.SELECT, field, self.Events.eventLabel.CHECKBOX_CHECKED, undefined, undefined);
                                }
                                else {
                                    self._sendEvent(self.Events.userEvent.SELECT, field, self.Events.eventLabel.CHECKBOX_UNCHECKED, undefined, undefined);
                                }
                            }
                            break;
                        default:
                            break;
                    }
                }
            });

            /*
             * 	Tracks any blur events on the page
             * 	Requires the 'data-gaEventElement' attribute is set on the target
             */
            $('body').on('blur', '*[data-gaEventElement]', function(evt) {
                var field = $(evt.currentTarget).attr('data-gaEventElement');

                if(field !== undefined){

                    // Track blur off of different elements
                    switch (evt.currentTarget.nodeName) {
                        case "INPUT": // Inputs
                            if($(evt.currentTarget).attr('type') === "text") {
                                self._sendEvent(self.Events.userEvent.INPUT, field, $(evt.currentTarget).val(), undefined, undefined);
                            }
                            break;
                        default:
                            break;
                    }
                }
            });

        },

        _log : function(msg) {
            if (typeof console !== "undefined") {
                console.log(msg);
            }
        },

        // standardized tracking of events
        _sendEvent : function(userAction, fieldName, fieldValue, eventTime, callback) {
            var eventAction = userAction + "." + fieldName;
            if (fieldValue !== undefined) {
                eventAction = eventAction + ";[" + fieldName + "=" + fieldValue + "]";
            }

            if (this.trackingName !== undefined){
                this.epcga.sendEvent({category: this.trackingName, action: eventAction, label: "", value: eventTime, hitCallback: callback});
            }
        },

        // standardized tracking of page load
        _pageLoad : function(){
            var lifecycle = this.Events.lifecycle.MAINTENANCE;
            if(this.isOnboarding) {
                lifecycle = this.Events.lifecycle.ONBOARDING;
            }

            var actionItem = this.Events.userEvent.PAGE_LOAD + ";" + lifecycle;

            this.epcga.sendEvent({category: this.trackingName, action: actionItem, label: "", value: undefined});
        },

        //***** SETUP *****//
        teamName : "",
        pageName : "",
        gaAccount : "",
        isOnboarding: "",

        _init : function() {

            // Grab tag parameters from hidden input fields. See gaEventTracking.hbs
            this.teamName = $("#eventTrackingTeamName").val();
            this.pageName  = $("#eventTrackingPageName").val();
            this.gaAccount = $("#eventTrackingGAAccount").val();
            this.isOnboarding = $("#eventTrackingIsOnboarding").val();

            // Init for Google Analytics tracking
            if (this.teamName === "" || this.pageName === ""  || this.gaAccount === "" ) {
                this._log("Required parameters are not set. Cannot track using EPC.GAEventTracker!");
                return;
            }
            else if(typeof window.EPC.BM === 'undefined'){
                this._log("EPC GA failed to initialize. Cannot use gaEventTracker!");
                return;
            }

            if(this.isOnboarding === ""){
                this.isOnboarding = false;
            }

            // Check if module is already initialized
            if (this.isInitialized === true) {
                this._log("Warning: EPC.GAEventTracker._init() function is called more than once; skipping the initialization to avoid duplicate event registrations");
                return;
            } else {
                this.isInitialized = true;
            }

            // Construct full tracking name
            this.trackingName = "EPC." + this.teamName + "." + this.pageName;
            this.epcga = new EPC.BusinessMetrics(this.trackingName);

            // Initialize account
            this.epcga.createAccount(this.gaAccount);

            // Track pageView
            this.epcga.sendPageView();

            // Track page load event
            this._pageLoad();

            // Initialize generic pageTracking
            this._loadEvents();
        }
    });

    EPC.GAEventTracker = new EventTracker();
    EPC.GAEventTracker._init();

})(jQuery);