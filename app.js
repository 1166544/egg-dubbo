'use strict';
const assert = require('assert');
const zookeeperEngine = require('./app/engine/ZookeeperEngine');

module.exports = (app) => {
    app.config.coreMiddleware.push('sumilator');

    assert(app && app.config && app.config.dubbo && app.config.dubbo.app,
        `[egg-dubbo] 'app: ${app.config.dubbo.app} are required on config`);

    app.startZookeeperService();
    if (app.config.dubbo.app) {
        zookeeperEngine(app);
        app.zookeeperEngine.create();
    } 
};
