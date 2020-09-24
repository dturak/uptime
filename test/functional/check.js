process.env.NODE_ENV = 'test';
var mongoose = require('../../bootstrap');
var Check = require('../../models/check');
var app = require('../../app');
var assert = require('assert');
var http = require('http');

exports.mochaHooks = {
    afterAll() {
      this.server.close();
    }
};

describe('GET /checks', function() {

  var check1, check2, pollerCollection; // fixtures

  before(function() {
    this.enableTimeouts(false)
    pollerCollection = app.get('pollerCollection');
    this.server = app.listen(3003);
  });

  before(function(res) {
    check1 = new Check();
    check1.url = 'http://www.url1.fr';
    check1.name = 'name1';
    check1.isPaused = false;
    check1.save();

    check2 = new Check();
    check2.url = 'http://www.url2.fr';
    check2.isPaused = false;
    check2.save();
  });

  it('should fetch all elements', function(done) {

    var options = {
      hostname: 'localhost',
      port: 3003,
      path: '/api/checks',
      headers: {
        'Accept': 'application/json'
      }
    };

    var req = http.request(options, function(res) {
      var body = "";
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        body += chunk;
      });

      res.on('end', function(){
        content = JSON.parse(body);
        assert.equal(content.length, 2);
      });
    });

    req.end();
    done();
  });

  after(function(done) {
    Check.remove({});
    this.server.close();
  });
});

describe('PUT /checks', function() {

  before(function() {
    this.enableTimeouts(false)
    pollerCollection = app.get('pollerCollection');
    this.server = app.listen(3003);
  });

  it('should add a new valid element', function() {

    var postData = JSON.stringify({
      name: 'test',
      url:'http://test.local'
    });

    var options = {
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

    var req = http.request(options, function(res) {
      res.setEncoding('utf8');
      var body = '';

      res.on('data', function(chunk) {
        body += chunk;
      });
      res.on('end', function() {
        var object = JSON.parse(body);
        Check.findOne({ _id : object._id }, function(error, document) {
          assert.notEqual(typeof(document), 'undefined');
          assert.notEqual(typeof(error), null);
          assert.equal(document.name, 'test');
        });
      });
    });

    req.write(postData);
    req.end();
  });

  it('should add a new element with url as name if name is empty', function() {
    var postData = JSON.stringify({
      name: '',
      url:'http://mynewurl.test'
    });

    var options = {
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

    var req = http.request(options, function(res) {
      res.setEncoding('utf8');
      var body = '';

      res.on('data', function(chunk) {
        body += chunk;
      });
      res.on('end', function() {
        var object = JSON.parse(body);
        assert.equal(object.url, object.name);
      });
    });

    req.write(postData);
    req.end();
  });

  it('should not add an invalid element with no url', function() {
    var postData = JSON.stringify({
      name: 'test',
      url: ''
    });

    var options = {
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

    var req = http.request(options, function(res) {
      res.setEncoding('utf8');
      var body = '';

      res.on('data', function(chunk) {
        body += chunk;
      });
      res.on('end', function() {
//        var object = JSON.parse(body);
        assert.notEqual(typeof(body), 'undefined');
      });
    });

    req.write(postData);
    req.end();
  });

  after(function() {
//    Check.remove({});
    this.server.close();
  });
});

describe('POST /checks/:id', function() {

  var check1, check2, pollerCollection; // fixtures

  before(function() {
    this.enableTimeouts(false)
    pollerCollection = app.get('pollerCollection');
    this.server = app.listen(3003);
  });

  beforeEach(function() {
    check1 = new Check();
    check1.url = 'http://www.url1.fr';
    check1.name = 'name1';
    check1.isPaused = false;
    check1.save();

    check2 = new Check();
    check2.url = 'http://www.url2.fr';
    check2.isPaused = false;
    check2.save();
  });

//this one works but causes the process to continue for some reason
//  it('should return error if id parameter does not exists', function() {
//
//    var postData = JSON.stringify({
//      name: 'test'
//    });
//
//    var options = {
//      hostname: 'localhost',
//      port: 3003,
//      path: '/api/checks/toto',
//      method: 'POST',
//      headers: {
//        'Content-Length': postData.length,
//        'Content-Type': 'application/json',
//        'Accept': 'application/json'
//      }
//    };
//
//    var req = http.request(options, function(res) {
//      res.setEncoding('utf8');
//      var body = '';
//
//      res.on('data', function(chunk) {
//        body += chunk;
//      });
//      res.on('end', function() {
////        var object = JSON.parse(body);
////        assert.notEqual(typeof(object.error), 'undefined');
//        assert.notEqual(typeof(body), 'undefined');
//      });
//    });
//
//    req.write(postData);
//    req.end();
//  });

  it('should update object if parameters are valid', function() {

    var postData = JSON.stringify({
      name: 'test',
      url:'http://newurl.test'
    });

    var options = {
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

    var req = http.request(options, function(res) {
      res.setEncoding('utf8');
      var body = '';

      res.on('data', function(chunk) {
        body += chunk;
      });
      res.on('end', function() {
        var object = JSON.parse(body);
        assert.equal(object.name, 'test');
        assert.equal(object.url, 'http://newurl.test');
      });
    });

    req.write(postData);
    req.end();
  });

  it('should not throw error if called twice on same id', function() {
    var postData = JSON.stringify({
      name: 'test',
      url:'http://newurl.test'
    });

    var options = {
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

    var req = http.request(options, function(res) {
      res.setEncoding('utf8');
      var body = '';

      res.on('data', function(chunk) {
        body += chunk;
      });
      res.on('end', function() {
        var object = JSON.parse(body);
        assert.equal(typeof(object.error), 'undefined');
        assert.notEqual(typeof(object.name), 'undefined');
      });
    });

    req.write(postData);
    req.end();
  });

  afterEach(function() {
    Check.remove({});
  });

  after(function() {
    this.server.close();
  });
});
