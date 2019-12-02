# set-ip-address
Node module for setting up network interface(s) ip address.

[![Build Status](https://travis-ci.com/adonespitogo/node-set-ip-address.svg?branch=master)](https://travis-ci.com/adonespitogo/node-set-ip-address)

Supported linux network configurations:
 - dhcpcd (/etc/dhcpcd.conf)
 - ifdownup (/etc/network/interfaces)
 - netplan (/etc/netplan/)
 
Install
---

```
npm i --save set-ip-address
```

Basic Usage
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

Configure VLAN
---

You can create vlan interface by passing `vlanid` option. Make sure to load `8021q` module to the kernel:

```
sudo modprobe 8021q
```

```js
var set_ip_address = require('set-ip-address')

var eth0 = {
  interface: 'eth0',
  ip_address: '10.0.0.1',
  prefix: 20,
  gateway: '10.0.0.1',
  nameservers: ['8.8.8.8']
}

var vlan1 {
  interface: 'eth0',
  vlanid: 10,
  ip_address: '20.0.0.1',
  prefix: 20,
  gateway: '20.0.0.1',
  nameservers: ['8.8.8.8']
}

set_ip_address
  .configure([eth0, vlan1])
  .then(() => console.log('done writing config files')

  // NOTE:
  // eth0.10 vlan interface configuration will be
  // created in /etc/network/interfaces.d/eth0
  // and in /etc/netplan/whatever-your-conguration-file.yml
```

TODO:
---
 - validate config input
 - restart network interfaces after config change

LICENSE
---

[MIT](LICENSE)
