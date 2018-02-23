'use strict';

module.exports = (options, app) => function * Processer(next) {
    const simulateKey = this.req.headers['x-request-simulate-key'] || '';

    if (simulateKey && app.simulateData && app.simulateData[simulateKey]) {
        const simulateData = Object.assign(app.simulateData[simulateKey]);
    
        app.simulateData[simulateKey] = null;
        delete app.simulateData[simulateKey];
        this.body = simulateData;
    }

    try {
        yield next;
    } catch (err) {

        if (err) {
            app.logger.info('sumilator error..', err);
        }
    }
};
