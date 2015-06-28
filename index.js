
/**
 * Create an cookie instance.
 *
 * @param {String} name
 * @return {Object} cookies
 * @api public
 */

var Cookie = module.exports = function (name) {
  'use strict';
  if (!(this instanceof Cookie)) {
    return new Cookie(name);
  }
  this.id = name;
  this.cookies = {};
  this.cache = {};
};

/**
 * get the value of the cookie inputed.
 *
 * @param {String} name
 * @param {String} domain
 * @return {String} value
 * @api public
 */

Cookie.prototype.get = function (name, domain) {
  'use strict';
  if (domain) {
    return this.cookies[domain][name];
  } else {
    for (var i in this.cookies) {
      if (this.cookies.hasOwnProperty(i) && this.cookies[i][name]) {
        return this.cookies[i][name];
      }
    }
  }
};

/**
 * get a string of the specified domain cookies.
 *
 * @param {String} domain
 * @return {String} value
 * @api public
 */

Cookie.prototype.join = function (domain) {
  var pairs = [];
  if (domain) {
    var domainCookie = this.cookies[domain];
    for (var i in domainCookie) {
      pairs.push(i + '=' + domainCookie[i]);
    }
  }
  return pairs.join('; ');
}

/**
 * set cookies.
 *
 * @param {String}{Array} cookie
 * @return {String} value
 * @api public
 */

Cookie.prototype.set = function(cookie){

  for (let domain of _setCookie(cookie, this)) {
    this.cache[domain] = this.join(domain);
  };
  return this;
}

/*
 * Internal function used to set cookies.
 * return an instance of Set.
 * @param {String} domain
 * @return {Set} value
 * @api private
 */

function _setCookie (cookie, self) {
  'use strict';

  /*_setCookie function can receive an array of cookies.
   *for example:
   *[
   *  'key1=value1; domain=xxx.com; path=/; expires=Tue, 21 Jun 2016 13:41:51 GMT; httpOnly',
   *  'key2=value2; domain=xxx.com; path=/; expires=Tue, 21 Jun 2016 13:41:51 GMT',
   *  ...
   *]
   */
  if (cookie instanceof Array) {
    let set = new Set();
    cookie.forEach(function (e, i) {
       for(let domain of _setCookie(e, self)) {
         set.add(domain);
       };
    });
    return set;
  }

  /*_setCookie function can receive an string of cookies.
   *for example:
   *'key1=value1; domain=xxx.com; path=/; expires=Tue, 21 Jun 2016 13:41:51 GMT; httpOnly'
   */
  if (typeof cookie == 'string') {
    let arr = cookie.split('; ');
    var keyVal = arr.shift().split('=');
    cookie = {value: keyVal[1]};
    arr.forEach(function (e, i, a) {

      let pair = e.split('=');
      cookie[pair[0]] = pair[1] || true;

    });
  }

  !self.cookies[cookie.domain] && (self.cookies[cookie.domain] = {});
  self.cookies[cookie.domain][keyVal[0]] = cookie;

  return new Set().add(cookie.domain);
};
