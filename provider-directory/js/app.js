/* scorecard page app */
requirejs(['marketplace', 'data'],
    function   (marketplace, data) {
        marketplace.init(data);
    });