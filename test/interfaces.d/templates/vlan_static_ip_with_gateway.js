module.exports = `
auto  eth0.10
allow-hotplug  eth0.10
iface  eth0.10  inet  static
  address  10.0.0.1
  netmask  255.255.240.0
  gateway  10.0.0.1
  vlan-raw-device eth0
`
