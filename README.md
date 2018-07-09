# np-ip

> Check losts of functions of ip


## Install

```
$ npm install np-ip
```


## Usage

```js
const ipAddr = require('np-ip');

ipAddr.binary(10);
//=> 00000000000000000000000000001010

ipAddr.isValidIP('127.0.0.1');
//=> true

ipAddr.isPrivateIP('192.168.1.134');
//=> true

ipAddr.isPublicIP('192.168.1.134');
//=> false

ipAddr.toLong('127.0.0.1');
//=> 2130706433

ipAddr.fromLong(2130706433);
//=> 127.0.0.1

ipAddr.checkIpType('192.168.1.134');
//=>{ isValidIP: true, type: 'C' }

ipAddr.isCidr('192.168.1.134',32);
//=> true

ipAddr.subnet('192.168.1.134',26);
//=>{ isValidIP: true,
//   isValidMask: true,
//   subnet:
//    { internetAddr: '192.168.1.128',
//      broadcastAddr: '192.168.1.191',
//      firstAddr: '192.168.1.129',
//      lastAddr: '192.168.1.190',
//      subnetMask: '255.255.255.192',
//      hostNum: 62,
//      length: 64,
//      contains: [Function] } }

ipAddr.subnet('192.168.1.134',26).contains('192.168.1.190');
//=> true

ipAddr.checkRange('192.168.1.134',26,'192.168.1.190');
//=>{ isValidIP: true, isValidMask: true, isInRange: true }


```


# np-ip
