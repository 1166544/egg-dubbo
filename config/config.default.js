'use strict';

module.exports = (appInfo) => {
    const config = {};

    // zookeeper服务
    config.dubbo = {
        // 默认服务版本
        version: '2.0.0',
        // 默认超时时间
        timeout: 6000,
        // 服务列表
        list: {
            goods: {
                applicationName: 'your_application_service_name',
                register: 'your_zk_service_name',
                dubboVer: '2.5.3',
            },
        },
    };

    // 本地服务模拟调用
    config.node = {
        serverUrl: 'http://localhost'
    };

    return config;
};    