# set-ip-address
Node module for setting up network interface(s) ip address, dns, and default routes of physical network interfaces, VLAN, and bridged interfaces.

[![Build Status](https://travis-ci.com/adonespitogo/node-set-ip-address.svg?branch=master)](https://travis-ci.com/adonespitogo/node-set-ip-address)

Supported linux network configurations:
 - netplan (/etc/netplan/)

Install
---

```
yarn add set-ip-address
```

OR


```
npm i --save set-ip-address
```

Basic Usage
---

```js
var set_ip_address = require('set-ip-address')
```

```js
var eth0 = {
  interface: 'eth0',
  ip_address: '10.0.0.1',
  prefix: 20,
  gateway: '10.0.0.1',
  nameservers: ['8.8.8.8'], // nameservers can also be a string separated by space/comma, ex: `"1.1.1.1, 8.8.8.8 8.8.4.4"`
  optional: true // (netplan) - dont wait for interfaces to avoid boot delay
}

var eth1 {
  interface: 'eth1',
  dhcp: true
}

set_ip_address.configure([eth0, eth1]).then(() => console.log('done writing config files')

```

Create and Configure VLAN Interface
---

You can create vlan interfaces by passing `vlanid` option. Make sure to load `8021q` module to the kernel:

```
sudo modprobe 8021q
```

```js
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

set_ip_address.configure([eth0, vlan1]).then(() => console.log('done writing config files')

```

Create and Configure Bridged Interfaces
---

```js
var eth0 = {
  interface: 'eth0',
  manual: true
}

var vlan1 {
  interface: 'eth0',
  vlanid: 10,
  manual: true
}

var br0 = {
  interface: 'br0',
  ip_address: '10.0.0.1',
  prefix: 20,
  gateway: '10.0.0.1',
  nameservers: ['8.8.8.8'],
  bridge_ports: ['eth0', 'eth0.10'],
  bridge_opts: {
    stp: true
  }
}

set_ip_address
  .configure([eth0, vlan1, br0])
  .then(() => console.log('done writing config files')
```

Create and Configure PPPoE Interface
---

```js
var ppp = {
  provider: 'dsl-provider',
  physical_interface: 'eth0'
}

set_ip_address
  .configure([ppp])
  .then(() => console.log('done writing config files')

```

Restart Networking Service
---

```js
set_ip_address.restartService()
  .then(() => console.log('network service restarted'))
```

LICENSE
---

[MIT](LICENSE)

