# client-cookie
This package is used to handling cookies for requesting by client of nodejs or iojs...

额……我渣渣的英语水平都不够装一次B的……orz

### install

>npm install client-cookie
    
    var clientCookie = require('client-cookie');
    var cookieStore = new clientCookie('id');  // use of "new" is optional

###API

#### cookieStore.id

获取创建的cookie对象的名字。

#### cookieStore.get(domain[, name])

获取指定域的cookie值，如果传入`name`参数，返回对应的cookie值，没有`name`则返回拼装好的名值对字符串，并加入缓存，优先从缓存中获取。

#### cookieStore.join(domain)

获取指定域的cookie拼装好的名值对字符串，并加入缓存。

#### cookieStore.remove(\[domain][, name])

删除制定域的cookie，如果传入`name`参数，则删除对应的cookie值。如果没有传入`domain`参数，则删除保存的所有域下的cookie。

#### cookieStore.set(cookie)

设置cookie，可以接受cookie字符串或cookie字符串数组。可以解析**http**模块获取的`headers.set-cookie`字段的值以及`rawHeaders`字段的`set-cookie`值。
如：

    [
      'key1=value1; domain=xxx.com; path=/; expires=Tue, 21 Jun 2016 13:41:51 GMT; httpOnly',
      'key1=value2; domain=xxx.com; path=/; expires=Tue, 21 Jun 2016 13:41:51 GMT; httpOnly',
      'key1=value3; domain=xxx.com; path=/; expires=Tue, 21 Jun 2016 13:41:51 GMT; httpOnly',
      ...
    ]
or

    'key1=value1; domain=xxx.com; path=/; expires=Tue, 21 Jun 2016 13:41:51 GMT; httpOnly'
返回值为cookieStore对象。

#### cookieStore.matchDomain(domain)

获取保存的cookie中，`domain`参数匹配到的所有域的数组。可以接受高级域名，然后会返回保存的匹配到该域名的所有低级域名组成的数组。