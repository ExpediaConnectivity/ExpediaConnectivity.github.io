define(function() {

    var info = new Vue({
        el: '#system-info',
        data: {
            heading: "",
            blurb: ""
        },
        computed: {},
        methods: {
            open: function(h, b) {
                $(this.$el).foundation('close');
                this.heading = h
                this.blurb = b;
                $(this.$el).foundation('open');
                Foundation.reInit('equalizer');
            }
        },
        mounted: function() {
            $(this.$el).foundation();
        }
    });

    var login = new Vue({
        el: '#system-login',
        data: {
            system: null,
        },
        computed: {},
        methods: {
            open: function(p) {
                this.system = p;
                $(this.$el).foundation('open');
                Foundation.reInit('equalizer');
            },
            showSystem: function() {
                authRequired = false;
                details.open(this.system);
            }
        },
        mounted: function() {
            $(this.$el).foundation();
        }
    });

    var survey = new Vue({
        el: '#system-survey',
        data: {
            useful: false,
            comment: '',
            submitDisabled: false
        },
        methods: {
            open: function(useful) {
                this.submitDisabled = false;
                this.useful = useful;
                this.comment = '';
                $(this.$el).foundation('open');
                $(this.$el).find('input').first().focus();
            },
            send: function() {
                this.submitDisabled = true;
                ga('send', 'event', 'directory', 'survey', this.comment, this.useful ? 1 : 0);
                var el = $(this.$el);
                setTimeout(function() { el.foundation('close'); }, 1000);
            }
        },
        mounted: function() {
            $(this.$el).foundation();
        }
    });

    var details = new Vue({
        el: '#system-details',
        data: {
            system: '',
            company: '',
            type: '',
            website: '',
            arRate: 0,
            bcRate: 0,

            availableFeatures: [
                "Eligible to receive Expedia guest cardholder data",
                "Property content synced with Expedia",
                "Room type and rate plan synced with Expedia",
                "Bookings include Expedia value add promotion details",
                "Bookings include Expedia brand that traveler used"
            ],
            availableFeaturesBlurb: [
                "We take the security of traveler credit card details seriously. Only providers that have supplied us with their Payment Card Industry (PCI) certification are eligible to receive actual guest cardholder details. Properties using a provider that has not provided us with their PCI certificate must access Expedia PartnerCentral in order to retrieve the credit card for the booking.",
                "This feature allows properties to make changes to their property attributes, images, policies, and fees directly within the provider system, and have this information directly synchronise on the Expedia Marketplace. This saves time and duplication of having to update the information in Expedia PartnerCentral.",
                "This feature allows properties to create and update their room types and rate plans directly within the provider system and have this information directly synchronise on the Expedia Marketplace.",
                "This feature allows properties to receive the details of any Expedia Value Add Promotions within the booking.  This means that front desk staff will be fully informed if they need to provide these promotions to the Expedia traveller on check-in.",
                "Properties using a provider that supports this will be able to see the exact brand that the traveller booked on. This extra insight helps the front desk personalise their greeting to travellers. It may also help properties analyse the effectiveness of their marketing."
            ],
            availableRestrictions: [
                "Full Pattern Length of Stays: Arrival",
                "Closed to Arrival",
                "Closed to Departure",
                "Full Pattern Length of Stays: Stay-Through",
                "Minimum Length of Stay",
                "Maximum Length of Stay",
                "Advanced Purchase"
            ]
        },
        computed: {
            numFeaturesSupported: function() {
                var n = 0;
                for (var i in this.availableFeatures) {
                    if (this.featureSupported(this.availableFeatures[i])) {
                        n++;
                    }
                }
                return n;
            },
            numRestrictionsSupported: function() {
                var n = 0;
                for (var i in this.availableRestrictions) {
                    if (this.restrictionSupported(this.availableRestrictions[i])) {
                        n++;
                    }
                }
                return n;
            }
        },
        methods: {
            open: function(p) {
                this.system = p['system'];
                this.company = p['company'];
                this.type = p['type'];
                this.website = p['website'];
                if (p['availSuccess']) {
                    this.arRate = p['availSuccess'];
                }
                if (p['bookSuccess']) {
                    this.bcRate = p['bookSuccess'];
                }
                this.featuresSupported = p['featuresSupported'];
                this.restrictionsSupported = p['restrictionsSupported'];
                ga('send', 'event', 'directory', 'detail', this.company + '.' + this.system);
                $(this.$el).foundation('open', {dataMultipleOpened: true});
                Foundation.reInit('equalizer');
            },
            featureSupported: function(f) {
                return this.featuresSupported && this.featuresSupported.indexOf(f) >= 0;
            },
            restrictionSupported: function(r) {
                return this.restrictionsSupported && this.restrictionsSupported.indexOf(r) >= 0;
            },
            openWebsite: function() {
                ga('send', 'event', 'directory', 'website', this.company + '.' + this.system);
                window.open(this.website);
            },
            showInfo: function(i) {
                info.open(this.availableFeatures[i], this.availableFeaturesBlurb[i]);
            },
            showARIInfo: function(i) {
                info.open("Availability and Rate update success", "Availability and Rate update success measures the likelihood of changes made in the provider system making it to Expedia. If an update doesn't make it, this may mean that your availability and rates on Expedia are out of date, potentially resulting in stale rates and overbookings. A success of 100% means that all updates flow through to Expedia.");
            },
            showBCRInfo: function(i) {
                info.open("Booking confirmation success", "Booking confirmation success measures the likelihood of a booking made on Expedia making it to the provider system.  If a booking doesn't make it to your system, it could mean that you're not aware when guest will be staying with you. It could also result in you overselling your inventory. A success rate of 100% means that all bookings flow through to your system.");
            }
        },
        mounted: function() {
            $(this.$el).foundation();
        }
    });

    var app;
    var authRequired = true;

    function buildApp() {
        return new Vue({
            el: '#systems-list',
            data: {
                country: '',
                language: '',
                typeCM: false,
                typePMS: false,
                typeCRS: false,
                liveSupport: false,
                productUpdate: false,
                sortedBy: 'system',
                providers: [],
            },
            methods: {
                filteredByType: function (p) {
                    if (this.typeCM || this.typePMS || this.typeCRS) {
                        return !((this.typeCM && p.type == 'CM') || (this.typePMS && p.type == 'PMS') || (this.typeCRS && p.type == 'CRS'));
                    }
                    return false;
                },
                filteredByCountry: function (p) {
                    if (this.country && this.country.length > 0 && p.country) {
                        return !p.country.startsWith(this.country.toLowerCase());
                    }
                    return false;
                },
                sortBySystem: function (a, b) {
                    var x = a['system'].toLowerCase();
                    var y = b['system'].toLowerCase();
                    return (x < y) ? -1 : (x > y) ? 1 : 0;
                },
                sortByCompany: function (a, b) {
                    var x = a['company'].toLowerCase();
                    var y = b['company'].toLowerCase();
                    return (x < y) ? -1 : (x > y) ? 1 : 0;
                },
                sortByScore: function (a, b) {
                    var x = parseFloat(a['score']);
                    var y = parseFloat(b['score']);
                    return y - x; // desc
                },
                setProviders: function (p) {
                    this.providers = p;
                    this.sort(this.providers, this.sortedBy);
                },
                sort: function (p, field) {
                    switch (field) {
                        case 'system':
                            p.sort(this.sortBySystem);
                            break;
                        case 'company':
                            p.sort(this.sortByCompany);
                            break;
                        case 'score':
                            p.sort(this.sortByScore);
                            break;
                    }
                },
                show: function (p) {

                    if (authRequired) {
                        login.open(p);
                    } else {
                        details.open(p);
                    }

                },
                onResize: function () {
                    var main = $('#systems-list .filter');
                    var side = $('#off-canvas .off-canvas-filter');

                    if (main.is(":visible")) {
                        $('#off-canvas').foundation('close');
                        if (main.children().length == 0) {
                            side.children().detach().appendTo(main);
                        }
                    } else {
                        if (side.children().length == 0) {
                            main.children().detach().appendTo(side);
                        }
                    }
                    this.resizeFilterForm();
                },
                onScroll: function () {
                    this.resizeFilterForm();
                },
                resizeFilterForm: function() {
                    var target = $('.systems .filter');
                    var fill = target.find('.fill');
                    fill.height(0);

                    // Can be in off-canvas
                    if (fill.parents('#off-canvas').length == 0) {
                        var ref = $(this.$el).find('.list');
                        var top = ref.offset().top - $(window).scrollTop();
                        var btm = $(document).scrollTop() + $(window).height() - ref.offset().top - ref.height();

                        var margin = $(window).height() - target.height();
                        if (top > 0) {
                            margin -= top;
                        }
                        if (btm > 0) {
                            margin -= btm;
                        }
                        if (margin > 0) {
                            fill.height(margin);
                        }
                        target.foundation('_calc', true);
                    }
                },
                filterClick: function () {
                    ga('send', 'event', 'directory', 'filter', "CM." + this.typeCM + ".PMS." + this.typePMS + ".CRS." + this.typeCRS);
                },
                surveyClick: function(useful) {
                    survey.open(useful);
                }
            },
            computed: {
                filteredProviders: function () {
                    var results = [];
                    for (i in this.providers) {
                        var p = this.providers[i];
                        if (this.filteredByType(p) || this.filteredByCountry(p)) {
                            continue;
                        }
                        results.push(p);
                    }
                    return results;
                }
            },
            watch: {
                sortedBy: function (val) {
                    this.sort(this.providers, val);
                }
            },
            mounted: function () {
                $(this.$el).foundation();
                this.onResize();
                this.onScroll();
            },
            updated: function() {
                this.resizeFilterForm();
            }
        });
    }

    return {
        init: function (data) {
            app = buildApp();
            app.setProviders(data.allProviders);
            $(window).resize(function() {
                clearTimeout(app.resizeTimer);
                app.resizeTimer = setTimeout(function() { app.onResize(); }, 25);
            });
            $(window).scroll(function() {
                clearTimeout(app.scrollTimer);
                app.scrollTimer = setTimeout(function() { app.onScroll(); }, 25);
            });
        }
    }

});
