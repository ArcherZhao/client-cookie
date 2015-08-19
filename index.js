'use strict';
const util = require('util');
const EventEmitter = require('events');
/**
 * Create an cookie instance.
 *
 * @param {String} name
 * @return {Object} value
 * @api public
 */

var Cookie = module.exports = function (name) {
  if (!(this instanceof Cookie)) {
    return new Cookie(name);
  }
  this.id = name;
  this.cookies = {};
  this.cache = new Cache;
  EventEmitter.call(this);
  var self = this;
  this.on('remove', function (domain) {
    self.cache.clear(domain);
  });
};

util.inherits(Cookie, EventEmitter);

function Cache() {
  this.domains = {};
};

Cache.prototype.get = function (domain) {
  return this.domains[domain];
};

Cache.prototype.set = function (domain, cookies) {
  this.domains[domain] = cookies;
  return this;
};

Cache.prototype.clear = function (domain) {
  if (domain) {
    let domains = this.domains;
    let reg = new RegExp(domain + '$');
    Object.keys(domains).filter(function (e, i) {
      let index = e.search(reg);
      return index === 0 || (index > 0 && (e.charAt(index - 1) == '.'));
    }).forEach(function (e, i) {
      delete domains[e];
    });
  } else {
    this.domains = {};
  }
  return this;
};

/**
 * get the value of the cookie inputed.
 *
 * @param {String} domain
 * @param {String} name (option)
 * @return {String} value
 * @api public
 */

Cookie.prototype.get = function (domain, name) {

  if (!name) {
    return this.cache.get(domain) !== undefined ? this.cache.get(domain) : this.join(domain);

  } else {
    let domains = this.matchDomain(domain);
    let length = domains.length;
    for (let i = 0; i < length; i++) {
      if (this.cookies[domains[i]][name]) {
        return this.cookies[domains[i]][name].value;
      }
    }
  }
  return undefined;
};

/**
 * get a string of the specified domain cookies.
 *
 * @param {String} domain
 * @return {String} value
 * @api public
 */

Cookie.prototype.join = function (domain) {
  var cookies = {};
  var pairs = [];
  if (domain) {
    var domains = this.matchDomain(domain);
    for (let i = domains.length - 1; i >= 0; i--) {
      let domainCookie = this.cookies[domains[i]];
      for (let key in domainCookie) {
        if (domainCookie.hasOwnProperty(key)) {
          cookies[key] = domainCookie[key];
        }
      }
    }
    for (let key in cookies) {
      if (cookies.hasOwnProperty(key)){
        pairs.push(key + '=' + cookies[key].value);
      }
    }
    pairs.length > 0 && this.cache.set(domain, pairs.join('; '));
  }
  return this.cache.get(domain);
}

/**
 * set cookies.
 *
 * @param {String}{Array} cookie
 * @return {Cookie} value
 * @api public
 */

Cookie.prototype.set = function (cookie) {

    for (let domain of _setCookie(cookie, this)) {
      this.cache.clear(domain);
    };
    return this;
  }
  /**
   * remove cookies.
   *
   * @param {String} domain (option)
   * @param {String} name (option)
   * @return {void} value
   * @api public
   */

Cookie.prototype.remove = function (domain, name) {
  if (domain) {
    let cookies = this.cookies[domain];
    if (cookies) {
      if (!name) {
        for (let name in cookies) {
          if (cookies.hasOwnProperty(name)) {
            clearTimeout(cookies[name].timeOut);
          }
        }
        delete this.cookies[domain];
        this.emit('remove', domain);
      } else {

        if (cookies[name]) {
          clearTimeout(cookies[name].timeOut);
          delete cookies[name];
          this.emit('remove', domain);
        }
      }
    }
  } else {

    for (domain in this.cookies) {
      if (this.cookies.hasOwnProperty(domain)) {
        let domainObj = this.cookies[domain];
        for (name in domainObj) {
          if (domainObj.hasOwnProperty(name)) {
            clearTimeout(domainObj[name].timeOut);
          }
        }
        delete this.cookies[domain];
      }
    }
    this.emit('remove');
  }
};

/*
 * return an array which contented the domains matched the given domain.
 * return an instance of domain.
 * @param {String} domain
 * @return {Array} value
 * @api private
 */

Cookie.prototype.matchDomain = function (domain) {
  return Object.keys(this.cookies).filter(function (e, i) {

    let index = domain.search(new RegExp(e + '$'));
    return index === 0 || (index > 0 && (domain.charAt(index - 1) == '.'));

  }).sort(function (a, b) {
    return b.length - a.length;
  });
};

/*
 * Internal function used to set cookies.
 * return an instance of Set.
 * @param {String}{Array} cookie
 * @param {Cookie} self
 * @return {Set} value
 * @api private
 */

var domainReg = /(;\sdomain\=)\./;

function _setCookie(cookie, self) {
  var set = new Set();
  if (typeof cookie == 'string') {
    var cookieObj = _parseCookie(cookie);
    var delay = cookieObj.expires && (new Date(cookieObj.expires).getTime() - new Date().getTime()) || Infinity;
    cookieObj.timeOut = delay < 2147483647 ? setTimeout(function () {

      delete self.cookies[cookieObj.domain][cookieObj.name];
      self.emit('remove', cookieObj.domain);
    }, delay) : null;

    self.remove(cookieObj.domain, cookieObj.name);
    !self.cookies[cookieObj.domain] && (self.cookies[cookieObj.domain] = {});
    self.cookies[cookieObj.domain][cookieObj.name] = cookieObj;

    set.add(cookieObj.domain);

  } else if (cookie instanceof Array) {
    cookie.forEach(function (e, i) {
      for (let domain of _setCookie(e, self)) {
        set.add(domain);
      };
    });
  }
  return set;
};

/*
 * Internal function used to set cookies.
 * return an instance of Set.
 * @param {String} cookie
 * @return {Object} value
 * @api private
 */

function _parseCookie(cookie) {
  /*_parseCookie function receive an string of cookie.
   *for example:
   *'key1=value1; domain=xxx.com; path=/; expires=Tue, 21 Jun 2016 13:41:51 GMT; httpOnly'
   */
  let arr = cookie.replace(domainReg, '$1').split('; ');
  let keyVal = arr.shift().split('=');
  let cookieObj = {
    name: keyVal[0],
    value: keyVal[1]
  };
  arr.forEach(function (e, i, a) {

    let pair = e.split('=');
    cookieObj[pair[0]] = pair[1] !== undefined ? pair[1] : true;

  });
  return cookieObj;
};