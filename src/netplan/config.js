'use strict'

exports.generate = (currentConfig, interfaceConfig) => {
  var iface = interfaceConfig.interface
  var cfg = {
    network: {
      version: 2,
      renderer: 'networkd',
      ethernets: currentConfig.network.ethernets || {},
      vlans: currentConfig.network.vlans || {}
    }
  }
  var config = {}
  if (interfaceConfig.ip_address && !interfaceConfig.dhcp) {
    config.dhcp4 = false
    config.dhcp6 = false
    config.addresses = [interfaceConfig.ip_address + '/' + interfaceConfig.prefix]
    if (interfaceConfig.nameservers)
      config.nameservers = {addresses: interfaceConfig.nameservers}
    if (interfaceConfig.gateway)
      config.gateway4 = interfaceConfig.gateway
  } else {
    config.dhcp4 = true
  }
  if (!interfaceConfig.vlanid)
    cfg.network.ethernets[iface] = config
  else {
    config.id = interfaceConfig.vlanid
    config.link = iface
    cfg.network.vlans[`${iface}.${config.id}`] = config
  }
  return cfg
}
