module.exports = `
auto  eth0.0
allow-hotplug  eth0.0
iface  eth0.0  inet  static
  address  10.0.0.1
  netmask  255.255.240.0
  vlan-raw-device eth0
`
