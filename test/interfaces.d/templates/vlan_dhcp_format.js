module.exports = `
auto  eth0.10
allow-hotplug  eth0.10
iface  eth0.10  inet  dhcp
  vlan-raw-device eth0
`
