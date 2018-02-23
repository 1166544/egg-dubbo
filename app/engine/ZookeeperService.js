'use strict';
const NZD = require('../libs/zookeeper');
const javaParser = require('js-to-java');
const path = require('path');

module.exports = (app) => {

    class ZookeeperService {

        constructor() {
            this.app = app;
            this.zookeeperList = {};
            this.startZookeeper();
        }

        /**
         * 获取DUBBO服务调用
         * @param {*} key
         */
        getService(key) {
            return this.zookeeperList[key] || null;
        }

        /**
         * 启动Zookeeper
         */
        startZookeeper() {
            const zookeeperConfig = this.app.config.dubbo.list;
            const directory = path.join(this.app.config.baseDir, 'app/service');

            this.app.loader.loadToApp(directory, 'rpcService', {

                // model为 export 的对象,opt为对象，只包含当前文件的路径
                initializer(model, opt) {
                    model(app);
                },

                // 忽略目录
                ignore: 'system/**',
            });

            // 注册多个应用服务
            for (const key in zookeeperConfig) {
                if (zookeeperConfig[key]) {
                    const zookeeperItem = zookeeperConfig[key];
                    const dependenceAppData = this.app.signatureData[key];
                    const dependenceData = this.getDependenceData(dependenceAppData);
                    const opt = {
                        application: {
                            name: zookeeperItem.applicationName,
                        },
                        register: zookeeperItem.register,
                        dubboVer: zookeeperItem.dubboVer,
                        dependencies: dependenceData,
                    };

                    opt.java = javaParser;
                    const Dubbo = new NZD(opt);

                    // 保存服务引用
                    this.zookeeperList[key] = Dubbo;
                }
            }

        }

        /**
         * 解释转换注册方法数据
         * methodSignature: {
         *     getSimpleGoods: (goodsId) => [{
         *         '$class': 'java.lang.Long', '$': goodsId
         *     }],
         *     getGoodsDetail: (goodsId, pageId) => [{
         *         '$class': 'java.lang.Long', '$': goodsId
         *     }]
         * }
         * @param {*} dependenceAppData
         */
        getDependenceData(dependenceAppData) {
            const dependenceData = {};

            for (const key in dependenceAppData) {

                if (dependenceAppData[key]) {
                    const dependenceAppItem = dependenceAppData[key];

                    dependenceData[key] = {
                        interface: dependenceAppItem.interfaceUrl,
                        version: dependenceAppItem.version,
                        timeout: dependenceAppItem.timeout,
                        methodSignature: dependenceAppItem.methodSignature,
                    };
                }
            }

            return dependenceData;
        }

    }

    return new ZookeeperService();

};
