/* schedules-admin page app */
requirejs(['schedules-admin', 'unscheduled-admin'],
    function   (schedules, unscheduled) {
        schedules.init();
        unscheduled.init();
    });