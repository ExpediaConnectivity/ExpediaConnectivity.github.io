define(function() {

    var details = new Vue({
        el: '#system-details',
        data: {
            system: '',
            company: '',
            type: '',
            arRate: 0,
            bcRate: 0,
            availableFeatures: [
                "PCI Attestation Supplied",
                "Property API",
                "Product API",
                "Value Add Promotions",
                "Displays All Point of Sale Brands"
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
                if (p['availSuccess']) {
                    this.arRate = p['availSuccess'];
                }
                if (p['bookSuccess']) {
                    this.bcRate = p['bookSuccess'];
                }
                this.featuresSupported = p['featuresSupported'];
                this.restrictionsSupported = p['restrictionsSupported'];
                $(this.$el).foundation('open');
                Foundation.reInit('equalizer');
            },
            featureSupported: function(f) {
                return this.featuresSupported && this.featuresSupported.indexOf(f) >= 0;
            },
            restrictionSupported: function(r) {
                return this.restrictionsSupported && this.restrictionsSupported.indexOf(r) >= 0;
            }
        },
        mounted: function() {
            $(this.$el).foundation();
        }
    });

    var app;

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
                sortedBy: 'score',
                providers: [],
            },
            methods: {
                filteredByType: function (p) {
                    if (this.typeCM || this.typePMS || this.typeCRS) {
                        return !((this.typeCM && p.type == 'CM') || (this.typePMS && p.type == 'PMS') || (this.typeCRS && p.type == 'CRS'));
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
                    details.open(p);
                },
                onResize: function () {
                    var main = $('#systems-list .filter');
                    var side = $('#off-canvas .filter');

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
                },
                onScroll: function () {
                    // Can be in off-canvas
                    var fill = $('.systems .filter .fill');
                    var h = fill.height();
                    var d = 0;
                    if (fill.parents('#off-canvas').length == 0) {
                        var ref = $(this.$el).find('.list');
                        d = ref.height() - (fill.parent().height() - h);
                        if (d < 1) {
                            d = 0;
                        }
                    }
                    if (Math.abs(d - h) > 1) {
                        fill.height(d);
                    }
                }
            },
            computed: {
                filteredProviders: function () {
                    var results = [];
                    for (i in this.providers) {
                        var p = this.providers[i];
                        if (this.filteredByType(p)) {
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
            }
        });
    }

    return {
        init: function (data) {
            app = buildApp();
            app.setProviders(data.allProviders);
            $(window).resize(function() {
                clearTimeout(app.resizeTimer);
                app.resizeTimer = setTimeout(function() { app.onResize(); }, 100);
            });
            $(window).scroll(function() {
                clearTimeout(app.scrollTimer);
                app.scrollTimer = setTimeout(function() { app.onScroll(); }, 100);
            });
        }
    }

});
