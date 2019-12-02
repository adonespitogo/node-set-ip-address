exports.static = `
auto  [INTERFACE]
iface  [INTERFACE]  inet  static
  address  [ADDRESS]/[PREFIX]
[GATEWAY]
[VLAN]
`
exports.dhcp = `
auto  [INTERFACE]
allow-hotplug  [INTERFACE]
iface  [INTERFACE]  inet  dhcp
[VLAN]
`
exports.staticFormat = (config) => {
  return exports.static
    .replace(/\[INTERFACE\]/g, config.vlanid? `${config.interface}.${config.vlanid}` : config.interface)
    .replace(/\[ADDRESS\]/, config.ip_address)
    .replace(/\[PREFIX\]/, config.prefix)
    .replace(/\[GATEWAY\]\n/, config.gateway? `  gateway  ${config.gateway}\n`: '')
    .replace(/\[VLAN\]/, config.vlanid? `  vlan-raw-device ${config.interface}` : '')
    .trim()
}

exports.dhcpFormat = (config) => {
  return exports.dhcp
    .replace(/\[INTERFACE\]/g, config.vlanid? `${config.interface}.${config.vlanid}` : config.interface)
    .replace(/\[VLAN\]/, config.vlanid? `  vlan-raw-device ${config.interface}` : '')
    .trim()
}

exports.format = (config) => {
  return config.dhcp
    ? exports.dhcpFormat(config)
    : exports.staticFormat(config)
}

