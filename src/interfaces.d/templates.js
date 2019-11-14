exports.static = `
auto  [INTERFACE],
iface  [INTERFACE]  inet  static
  address  [ADDRESS]/[PREFIX]
  [GATEWAY]
`
exports.dhcp = `
auto  [INTERFACE]
allow-hotplug  [INTERFACE]
iface  [INTERFACE]  inet  dhcp
`
exports.staticFormat = (config) => {
  return exports.static
    .replace(/\[INTERFACE\]/g, config.interface)
    .replace(/\[ADDRESS\]/, config.ip_address)
    .replace(/\[PREFIX\]/, config.prefix)
    .replace(/\[GATEWAY\]/, config.gateway? `gateway  ${config.gateway}`: '')
    .trim()
}

exports.dhcpFormat = (config) => {
  return exports.dhcp
    .replace(/\[INTERFACE\]/g, config.interface)
    .trim()
}
