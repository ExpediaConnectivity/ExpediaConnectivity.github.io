/* schedules-admin page app */
requirejs(['features', 'schedules-admin', 'unscheduled-admin'],
    function   (features, schedules, unscheduled) {
        schedules.init();
        unscheduled.init();
        features.init();
    });