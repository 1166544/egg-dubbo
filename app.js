'use strict';

module.exports = (app) => {
    app.config.coreMiddleware.push('sumilator');
    app.startZookeeper();
};
