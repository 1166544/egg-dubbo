'use strict';
const configEngine = require('./ConfigEngine');
const OPTIONS_KEY = 'options';

module.exports = (app) => {
    class SimulateEngine {

        constructor() {
            this.app = app;
            if (!this.app.isProd) {
                this.app.messenger.on(configEngine.DUBBO_MESSAGE, this.onDubboServiceMessage);
            }
        }

        /**
         * 模拟处理DUBBO服务调用
         * @param {*} data
         */
        onDubboServiceMessage(data) {
            // 存储临时数据
            const simulateTime = Date.now();
            const simulateKey = `${data.channel}.${data.serviceClass}.${data.methodName}.${simulateTime}`;
            const systemPort = app[OPTIONS_KEY].port;

            app.simulateData[simulateKey] = data.data;

            // 模拟调用本地服务
            return new Promise((resolve, reject) => {
                app.curl(`${app.config.node.serverUrl}:${systemPort}/api/service/simulateService/${data.channel}/${data.serviceClass}/${data.methodName}`, {
                    dataType: configEngine.JSON,
                    method: configEngine.POST.toLocaleUpperCase(),
                    contentType: configEngine.JSON,
                    data: data.params,
                    beforeRequest: (options) => {
                        options.headers['x-request-simulate-key'] = simulateKey;
                    },
                }).then((resultData) => {
                    // console.log(resultData);
                });
            });
        }

    }

    app.simulater = new SimulateEngine();
};
