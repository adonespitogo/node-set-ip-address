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
  if (interfaceConfig.ip_address) {
    interfaceConfig.dhcp4 = false
    interfaceConfig.dhcp6 = false
    interfaceConfig.addresses = [interfaceConfig.ip_address + '/' + interfaceConfig.prefix]
    if (interfaceConfig.nameservers)
      interfaceConfig.nameservers = {addresses: interfaceConfig.nameservers}
    if (interfaceConfig.gateway)
      interfaceConfig.gateway4 = interfaceConfig.gateway
    delete interfaceConfig.gateway
    delete interfaceConfig.interface
    delete interfaceConfig.ip_address
    delete interfaceConfig.prefix
  } else {
    interfaceConfig = {dhcp4: true}
  }
  if (!interfaceConfig.vlanid)
    cfg.network.ethernets[iface] = interfaceConfig
  else {
    interfaceConfig.id = interfaceConfig.vlanid
    interfaceConfig.link = iface
    delete interfaceConfig.vlanid
    cfg.network.vlans[`${iface}.${interfaceConfig.id}`] = interfaceConfig
  }
  return cfg
}
