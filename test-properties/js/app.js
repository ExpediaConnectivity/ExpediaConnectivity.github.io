/* schedules-admin page app */
requirejs(['schedules-admin', 'unscheduled-admin'],
    function   (schedules, unscheduled) {
        schedules.init();
        /* switch off for now */
        /* unscheduled.init(); */
    });