module.exports = `
auto  eth0.0
allow-hotplug  eth0.0
iface  eth0.0  inet  dhcp
  vlan-raw-device eth0
`
