'use strict';

const mock = require('egg-mock');

describe('test/egg-dubbo.test.js', () => {
    let app;

    before(() => {
        app = mock.app({
            baseDir: 'apps/egg-dubbo-test',
        });
        
        return app.ready();
    });

    after(() => app.close());
    afterEach(mock.restore);

    it('should GET /', () => app.httpRequest()
            .get('/')
            .expect('hi, eggDubbo')
            .expect(200));
});
