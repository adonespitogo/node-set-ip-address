module.exports = `
auto  eth0
allow-hotplug  eth0
iface  eth0  inet  static
  address  10.0.0.1
  netmask  255.255.240.0
  dns-nameservers  10.0.0.1 8.8.4.4 1.1.1.1
  gateway  10.0.0.1
`
