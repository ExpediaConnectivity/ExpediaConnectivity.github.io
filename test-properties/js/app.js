/* schedules-admin page app */
requirejs(['features', 'schedules-admin', 'unscheduled-admin'],
    function   (features, schedules, unscheduled) {
        features.init();
        schedules.init();
        unscheduled.init();
    });