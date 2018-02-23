const simulateEngine = require('../engine/SimulateEngine');
const rpcEngine = require('../engine/RpcEngine');

const ZOOKEEPER_ENGINE = Symbol('Application#zookeeperEngine');
const SIGNATURE_DATA = Symbol('Application#signatureData');
const SIMULATER = Symbol('Application#simulater');
const INVOKE_TEMP_DATA = Symbol('Application#invokeData');

module.exports = {

    /**
     * RPC模拟调用器
     */
    get simulater() {
        return this[SIMULATER];
    },
    set simulater(value) {
        this[SIMULATER] = value;
    },

    /**
     * RPC模拟调用临时数据
     */
    get simulateData() {
        if (!this[INVOKE_TEMP_DATA]) {
            this[INVOKE_TEMP_DATA] = {};
        }

        return this[INVOKE_TEMP_DATA];
    },
    set simulateData(value) {
        this[INVOKE_TEMP_DATA] = value;
    },

    /**
     * RPC签名方法数据
     */
    get signatureData() {
        if (!this[SIGNATURE_DATA]) {
            this[SIGNATURE_DATA] = {};
        }

        return this[SIGNATURE_DATA];
    },
    set signatureData(value) {
        this[SIGNATURE_DATA] = value;
    },

    /**
     * zookeeper
     */
    get zookeeperEngine() {
        return this[ZOOKEEPER_ENGINE];
    },
    set zookeeperEngine(value) {
        this[ZOOKEEPER_ENGINE] = value;
    },
    
    // 是否生产环境
    get isProd() {
        return this.config.env === 'prod';
    },

    /**
     * 单例启动RPC服务
     */
    startZookeeperService() {
        rpcEngine(this);
        simulateEngine(this);
    },

    /**
     * 更新方法签名
     * @param {*} key  系统KEY
     * @param {*} serviceClass 服务类名KEY
     * @param {*} signature 服务类名方法签名
     */
    updateRpcSignature(key, serviceClass, signature) {
        if (!this.signatureData[key]) {
            this.signatureData[key] = {};
        }
        this.signatureData[key][serviceClass] = signature;
    },

    /**
     * 获取Dubbo服务实例
     * @param {*} key
     */
    getDubboService(key) {
        return this.zookeeperEngine.getService(key);
    },
};
