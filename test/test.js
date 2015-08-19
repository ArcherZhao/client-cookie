var assert = require('assert');
var Cookie = require('..');

var cookie = new Cookie('test');

var time1 = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30).toUTCString();
var time2 = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7).toUTCString();
var time4 = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30).toUTCString();

describe("cookie", function () {

  describe("#set()", function () {

    it("receive an array of cookies, should return an cookie object", function () {
      cookie.set([
        'key1=value1; domain=xxx.com; path=/; expires=' + time1 + '; httpOnly',
        'key2=value2; domain=xx.xxx.com; path=/; expires=' + time2 + '; httpOnly',
        'key3=value3; domain=.xxx.com; path=/'
      ]);
      assert.deepStrictEqual(cookie.cookies, {
        'xxx.com': {
          'key1': {
            name: 'key1',
            value: 'value1',
            path: '/',
            domain: 'xxx.com',
            expires: time1,
            httpOnly: true,
            timeOut: null
          },
          'key3': {
            name: 'key3',
            value: 'value3',
            path: '/',
            domain: 'xxx.com',
            timeOut: null
          }
        },
        'xx.xxx.com': {
          'key2': {
            name: 'key2',
            value: 'value2',
            path: '/',
            domain: 'xx.xxx.com',
            expires: time2,
            httpOnly: true,
            timeOut: cookie.cookies['xx.xxx.com'].key2.timeOut || "不为null"
          }
        }
      })
    });
    it("receive a string of cookies, should return an cookie object", function () {
      cookie.set('key4=value4; domain=xxx.com; path=/; expires=' + time4 + '; httpOnly');
      assert.deepStrictEqual(cookie.cookies, {
        'xxx.com': {
          'key1': {
            name: 'key1',
            value: 'value1',
            path: '/',
            domain: 'xxx.com',
            expires: time1,
            httpOnly: true,
            timeOut: null
          },
          'key3': {
            name: 'key3',
            value: 'value3',
            path: '/',
            domain: 'xxx.com',
            timeOut: null
          },
          'key4': {
            name: 'key4',
            value: 'value4',
            path: '/',
            domain: 'xxx.com',
            expires: time4,
            httpOnly: true,
            timeOut: null
          }
        },
        'xx.xxx.com': {
          'key2': {
            name: 'key2',
            value: 'value2',
            path: '/',
            domain: 'xx.xxx.com',
            expires: time2,
            httpOnly: true,
            timeOut: cookie.cookies['xx.xxx.com'].key2.timeOut || "不为null"
          }
        }
      })
    })
  });

  describe("#matchDomain()", function () {
    it("get an array of domains which matched the given domain", function () {

      cookie.set('key5=value5; domain=yyy.com; path=/; expires=' + time4 + '; httpOnly');
      assert.deepStrictEqual(cookie.matchDomain('xx.xxx.com'), [
        'xx.xxx.com',
        'xxx.com'
      ])
    });
  });

  describe("#get()", function () {
    it('get a string of cookies belong to the received domain', function () {
      assert.strictEqual(cookie.get('xxx.com'), 'key1=value1; key3=value3; key4=value4', 'low level check');

      cookie.set('key2=value4; domain=xxx.com; path=/; expires=' + time4 + '; httpOnly');
      assert.strictEqual(cookie.get('xx.xxx.com'), 'key1=value1; key3=value3; key4=value4; key2=value2', 'high level check');

      assert.strictEqual(cookie.get('xx.xxx.com', 'key2'), 'value2');
    });
  });

  describe('cache', function () {
    it('cache should has the \'xx.xxx.com\' cached', function () {
      assert.deepStrictEqual(cookie.cache.domains, {
        'xx.xxx.com': 'key1=value1; key3=value3; key4=value4; key2=value2'
      });
    })
  });

  describe('#remove()', function () {
    it('should remove the cookie', function () {
      cookie.remove('xxx.com', 'key3');
      assert.strictEqual(cookie.get('xx.xxx.com'), 'key1=value1; key4=value4; key2=value2');
      assert.strictEqual(cookie.get('xxx.com'), 'key1=value1; key4=value4; key2=value4');

      cookie.remove('xx.xxx.com');
      assert.strictEqual(cookie.get('xx.xxx.com'), 'key1=value1; key4=value4; key2=value4');

      assert.deepStrictEqual(cookie.get('yyy.com'), 'key5=value5');
      cookie.remove('yyy.com');
      assert.strictEqual(cookie.get('yyy.com'), undefined);
    });
  });

  describe('Timeout', function () {
    var time = new Date(new Date().getTime() + 1000).toUTCString();
    it('should remove automatically when the expires is comming', function (done) {
      cookie.set('key1=value4; domain=xxx.com; path=/; expires=' + time + '; httpOnly');

      assert.strictEqual(cookie.get('xxx.com'), 'key4=value4; key2=value4; key1=value4');
      setTimeout(function () {
        assert.strictEqual(cookie.get('xxx.com'), 'key4=value4; key2=value4');
        done();
      }, 1200);
    })
  })
});