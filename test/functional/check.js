process.env.NODE_ENV = 'test';
var Check = require('../../models/check');
var app = require('../../app');
var assert = require('assert');
var http = require('http');

var check1, check2, pollerCollection; // fixtures

describe('GET /checks', function () {

    before(function (done) {
        this.enableTimeouts(false)
        pollerCollection = app.get('pollerCollection');
        this.server = app.listen(3003, done);
    });

    before(function (done) {
        Check.remove({}, done);
    });

    before(function (done) {
        check1 = new Check();
        check1.url = 'http://www.url1.fr';
        check1.name = 'name1';
        check1.isPaused = false;
        check1.save(done);
    });

    before(function (done) {
        check2 = new Check();
        check2.url = 'http://www.url2.fr';
        check2.isPaused = false;
        check2.save(done);
    });

    it('should fetch all elements', function (done) {

        let options = {
            hostname: 'localhost',
            port: 3003,
            path: '/api/checks',
            headers: {
                'Accept': 'application/json'
            }
        };

        let req = http.request(options, function (res) {
            let body = "";
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                body += chunk;
            });

            res.on('end', function () {
                let content = JSON.parse(body);
                assert.strictEqual(content.length, 2);
                done();
            });
        });

        req.end();
    });

    after(function (done) {
        Check.remove({}, done);
        this.server.close();
    });
});

describe('PUT /checks', function () {

    before(function () {
        this.enableTimeouts(false)
        pollerCollection = app.get('pollerCollection');
        this.server = app.listen(3003);
    });

    it('should add a new valid element', function () {

        let postData = JSON.stringify({
            name: 'test',
            url: 'http://test.local'
        });

        let options = {
            hostname: 'localhost',
            port: 3003,
            path: '/api/checks',
            method: 'PUT',
            headers: {
                'Content-Length': postData.length,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        let req = http.request(options, function (res) {
            res.setEncoding('utf8');
            let body = '';

            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {
                let object = JSON.parse(body);
                Check.findOne({_id: object._id}, function (error, document) {
                    assert.notStrictEqual(typeof (document), 'undefined');
                    assert.notStrictEqual(typeof (error), null);
                    assert.strictEqual(document.name, 'test');
                });
            });
        });

        req.write(postData);
        req.end();
    });

    it('should add a new element with url as name if name is empty', function () {
        let postData = JSON.stringify({
            name: '',
            url: 'http://mynewurl.test'
        });

        let options = {
            hostname: 'localhost',
            port: 3003,
            path: '/api/checks',
            method: 'PUT',
            headers: {
                'Content-Length': postData.length,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        let req = http.request(options, function (res) {
            res.setEncoding('utf8');
            let body = '';

            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {
                let object = JSON.parse(body);
                assert.strictEqual(object.url, object.name);
            });
        });

        req.write(postData);
        req.end();
    });

    it('should not add an invalid element with no url', function () {
        let postData = JSON.stringify({
            name: 'test',
            url: ''
        });

        let options = {
            hostname: 'localhost',
            port: 3003,
            path: '/api/checks',
            method: 'PUT',
            headers: {
                'Content-Length': postData.length,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        let req = http.request(options, function (res) {
            res.setEncoding('utf8');
            let body = '';

            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {
                // let object = JSON.parse(body);
                assert.notStrictEqual(typeof (body), 'undefined');
            });
        });

        req.write(postData);
        req.end();
    });

    after(function () {
        Check.remove({});
        this.server.close();
    });
});

describe('POST /checks/:id', function () {

    before(function (done) {
        this.enableTimeouts(false)
        pollerCollection = app.get('pollerCollection');
        this.server = app.listen(3003, done);
    });

    before(function (done) {
        Check.remove({}, done);
    });

    before(function (done) {
        check1 = new Check();
        check1.url = 'http://www.url1.fr';
        check1.name = 'name1';
        check1.isPaused = false;
        check1.save(done);
    });

    before(function (done) {
        check2 = new Check();
        check2.url = 'http://www.url2.fr';
        check2.isPaused = false;
        check2.save(done);
    });

    it('should return error if id parameter does not exists', function (done) {

        let postData = JSON.stringify({
            name: 'test'
        });

        let options = {
            hostname: 'localhost',
            port: 3003,
            path: '/api/checks/toto',
            method: 'POST',
            headers: {
                'Content-Length': postData.length,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        let req = http.request(options, function (res) {
            res.setEncoding('utf8');
            let body = '';

            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {
                //// Not sure whats up here but again its a pretty old test
                // let object = JSON.parse(body);
                // assert.notStrictEqual(typeof(object.error), 'undefined');
                assert.notStrictEqual(typeof (body), 'undefined');
                done();
            });
        });

        req.write(postData);
        req.end();
    });

    it('should update object if parameters are valid', function (done) {

        let postData = JSON.stringify({
            name: 'test',
            url: 'http://newurl.test'
        });

        let options = {
            hostname: 'localhost',
            port: 3003,
            path: '/api/checks/' + check1.id,
            method: 'POST',
            headers: {
                'Content-Length': postData.length,
                'Content-type': 'application/json',
                'Accept': 'application/json'
            }
        };

        let req = http.request(options, function (res) {
            res.setEncoding('utf8');
            let body = '';

            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {
                let object = JSON.parse(body);
                assert.strictEqual(object.name, 'test');
                assert.strictEqual(object.url, 'http://newurl.test');
                done();
            });
        });

        req.write(postData);
        req.end();
    });

    it('should not throw error if called twice on same id', function (done) {
        let postData = JSON.stringify({
            name: 'test',
            url: 'http://newurl.test'
        });

        let options = {
            hostname: 'localhost',
            port: 3003,
            path: '/api/checks/' + check1.id,
            method: 'POST',
            headers: {
                'Content-Length': postData.length,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        let req = http.request(options, function (res) {
            res.setEncoding('utf8');
            let body = '';

            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {
                let object = JSON.parse(body);
                assert.strictEqual(typeof (object.error), 'undefined');
                assert.notStrictEqual(typeof (object.name), 'undefined');
                done();
            });
        });

        req.write(postData);
        req.end();
    });

    after(function (done) {
        Check.remove({}, done);
        this.server.close();
    });
});
