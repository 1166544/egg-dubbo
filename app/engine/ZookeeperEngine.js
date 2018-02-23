'use strict';
const zookeeperEngine = require('./ZookeeperService');
let clientApp = {};

/**
 * 创建zk服务
 * @param {*} config 
 * @param {*} app 
 */
function createZookeeperClient(config, app) {
    const client = zookeeperEngine(clientApp);

    clientApp.zookeeperEngine = client;
    
    return client;
}

module.exports = (app) => {
    clientApp = app;
    app.addSingleton('zookeeperEngine', createZookeeperClient);
};