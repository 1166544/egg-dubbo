'use strict';
const configEngine = require('./ConfigEngine');

const RPC_VERSION = Symbol('Rpc#version');
const RPC_TIMEOUT = Symbol('Rpc#timeout');
const RPC_CHANNEL = Symbol('Rpc#channel');
const RPC_METHODSIGNATURE = Symbol('Rpc#methodSignature');
const RPC_INTERFACE = Symbol('Rpc#interface');
const RPC_SERVICE_CLASS = Symbol('Rpc#serviceClass');
const RPC_CONFIG = Symbol('Rpc#config');
const LONG_TIME = 2000;

module.exports = (app) => {
    class RpcService {

        get serviceClass() {
            return this[RPC_SERVICE_CLASS];
        }
        set serviceClass(value) {
            this[RPC_SERVICE_CLASS] = value;
        }

        get config() {
            return this[RPC_CONFIG];
        }
        set config(value) {
            this[RPC_CONFIG] = value;
        }

        get interfaceUrl() {
            return this[RPC_INTERFACE];
        }
        set interfaceUrl(value) {
            this[RPC_INTERFACE] = value;
        }

        get methodSignature() {
            return this[RPC_METHODSIGNATURE];
        }
        set methodSignature(value) {
            this[RPC_METHODSIGNATURE] = value;
        }

        get channel() {
            return this[RPC_CHANNEL];
        }
        set channel(value) {
            this[RPC_CHANNEL] = value;
        }

        get timeout() {
            return this[RPC_TIMEOUT];
        }
        set timeout(value) {
            this[RPC_TIMEOUT] = value;
        }

        get version() {
            return this[RPC_VERSION];
        }
        set version(value) {
            this[RPC_VERSION] = value;
        }

        constructor(appRef) {
            this.app = appRef;
            this.config = this.app.config;
            this.version = '2.0.0';
            this.timeout = 6000;
        }

        /**
         * 注册调用,子类调用
         */
        update() {
            this.signature();
            this.generateServiceClassName();
            this.app.updateRpcSignature(this.channel, this.serviceClass, this);
        }

        /**
         * 依据interfaceUrl生成服务类名
         */
        generateServiceClassName() {
            if (this.interfaceUrl) {
                this.serviceClass = this.interfaceUrl;
            }
        }

        /**
         * 注册方法签名,子类实现
         */
        signature() {
            // hole
        }

        /**
         * 方法调用
         * @param {*} methodName
         * @param {*} args
         */
        request(methodName, ...args) {

            if (!this.app.getDubboService(this.channel)) {
                this.app.logger.warn(configEngine.DUBBO_ERROR + ' channel undefined!');
            }
            if (!this.app.getDubboService(this.channel)[this.serviceClass]) {
                this.app.logger.warn(configEngine.DUBBO_ERROR + ' service undefined!');
            }
            if (!this.app.getDubboService(this.channel)[this.serviceClass][methodName]) {
                this.app.logger.warn(configEngine.DUBBO_ERROR + ' method signature undefined!');
            }

            return new Promise((resolve, reject) => {

                // 正常返回派发，回调，如果超时记录到日志
                let endTime = Date.now();
                const startTime = endTime;
                const applyMethodInvoker = this.app.getDubboService(this.channel)[this.serviceClass][methodName].apply(this, args)
                    .then((data) => {
                        endTime = this.getEndTime(startTime);

                        this.sendLog(false, endTime, this.channel, this.serviceClass, methodName, args);
                        this.sendSimulateMessage(this.channel, this.serviceClass, methodName, args, data);
                        resolve(data);
                    });

                // 异常返回,打印日志
                applyMethodInvoker['catch']((err) => {
                    let stackMessage = '';

                    if (err && err.stack) {
                        stackMessage = err.stack.toString();
                    }
                    endTime = this.getEndTime(startTime);
                    this.sendLog(true, endTime, this.channel, this.serviceClass, methodName, args, stackMessage);
                    reject(err);
                });
            });
        }

        /**
         * 获取耗时
         * @param {*} startTime
         */
        getEndTime(startTime) {
            return Date.now() - startTime;
        }

        /**
         * 记录到日志
         * @param {*} isError
         * @param {*} duration
         * @param {*} channel
         * @param {*} serviceClass
         * @param {*} methodName
         * @param {*} params
         * @param {*} stackMessage
         */
        sendLog(isError, duration, channel, serviceClass, methodName, params, stackMessage) {
            const api = `${channel}/${methodName}`;
            const newParams = params.concat();

            newParams.push({
                service: serviceClass
            });
            if (isError) {
                this.saveDubboError(duration, api, newParams, stackMessage);
            } else {
                this.saveDubboLogs(duration, api, newParams);
            }
        }

        /**
         * 测试环境派发模拟调用事件
         * @param {*} channel
         * @param {*} serviceClass
         * @param {*} methodName
         * @param {*} params
         * @param {*} data
         */
        sendSimulateMessage(channel, serviceClass, methodName, params, data) {
            if (!this.app.isProd) {
                const messageData = {
                    channel,
                    methodName,
                    params,
                    serviceClass,
                    data,
                };

                this.app.messenger.sendToApp(configEngine.DUBBO_MESSAGE, messageData);
            }
        }

         /**
         * 输出DUBBO错误日志
         * @param {*} duration 
         * @param {*} api 
         * @param {*} params 
         * @param {*} stackMessage 
         */
        saveDubboError(duration, api, params, stackMessage) {
            this.app.logger.warn(
                `
                PARSE JSONP DATA ERROR!!!! 
                Api: ${api} 
                Method: dubbo
                Params: ${JSON.stringify(params)}
                Stack: ${stackMessage} 
                Duration: ${duration} ms
                ......
                
                `
            );
        }

        /**
         * 输出DUBBO超时日志
         * @param {*} duration 
         * @param {*} api 
         * @param {*} params 
         */
        saveDubboLogs(duration, api, params) {
            if (duration > LONG_TIME) {
                this.app.logger.warn(
                    `
                REQUEST LONG TIME!!!! 
                Api: ${api} 
                Method: dubbo
                Params: ${JSON.stringify(params)}
                Duration: ${duration} ms
                ......
                
                `
                );
            }
        }

    }

    app.RpcService = RpcService;
};
