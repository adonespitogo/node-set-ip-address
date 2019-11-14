# set-ip-address
Node module for setting up network interface(s) ip address.

Supported linux network configurations:
 - dhcpcd (/etc/dhcpcd.conf)
 - ifdownup (/etc/network/interfaces)
 - netplan (/etc/netplan/)
 
Install
---

```
npm i --save set-ip-address
```

Usage
---

```js
var set_ip_address = require('set-ip-address')

var eth0 = {
  interface: 'eth0',
  ip_address: '10.0.0.1',
  prefix: 20,
  gateway: '10.0.0.1',
  nameservers: ['8.8.8.8']
}

var eth1 {
  interface: 'eth1',
  dhcp: true
}

set_ip_address.configure([eth0, eth1]).then(() => console.log('done writing config files')

```

TODO:
---
 - validate config input

LICENSE
---

[MIT](LICENSE)
