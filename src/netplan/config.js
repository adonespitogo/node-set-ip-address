'use strict'

exports.generate = (currentConfig, interfaceConfig) => {
  var iface = interfaceConfig.interface
  var cfg = {
    network: {
      version: 2,
      renderer: 'networkd',
      ethernets: currentConfig.network.ethernets || {}
    }
  }
  if (interfaceConfig.ip_address) {
    interfaceConfig.dhcp4 = false
    interfaceConfig.dhcp6 = false
    interfaceConfig.addresses = [interfaceConfig.ip_address + '/' + interfaceConfig.prefix]
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
  cfg.network.ethernets[iface] = interfaceConfig
  return cfg
}
