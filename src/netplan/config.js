'use strict'

exports.generate = (currentConfig, interfaceConfig) => {
  var iface = interfaceConfig.interface
  var is_vlan = typeof interfaceConfig.vlanid == 'number'
  var cfg = {
    network: {
      version: 2,
      renderer: 'networkd',
      ethernets: currentConfig.network.ethernets || {},
      vlans: currentConfig.network.vlans || {},
      bridges: currentConfig.network.bridges || {},
    }
  }
  var config = {}

  if (interfaceConfig.optional)
    config.optional = true

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
    config['dhcp-identifier'] = 'mac'
  }
  if (!is_vlan) {
    if (Array.isArray(interfaceConfig.bridge_ports)) {
      interfaceConfig.bridge_opts = interfaceConfig.bridge_opts || {}
      interfaceConfig.bridge_ports.forEach(p => {
        if (!cfg.network.vlans[p]) {
          cfg.network.ethernets[p] = {
            dhcp4: false,
            dhcp6: false
          }
        } else {
          var vlan = cfg.network.vlans[p]
          cfg.network.vlans[p] = {
            id: vlan.id,
            link: vlan.link,
            dhcp4: false,
            dhcp6: false
          }
        }
      })
      var opts = interfaceConfig.bridge_opts
      var { stp } = opts
      config.interfaces = interfaceConfig.bridge_ports
      config.parameters = { stp: !!stp }
      cfg.network.bridges[iface] = config
    } else if (!interfaceConfig.ppp)
      cfg.network.ethernets[iface] = config
  }
  else {
    config.id = interfaceConfig.vlanid
    config.link = iface
    cfg.network.vlans[interfaceConfig.ifname] = config
  }

  return cfg
}
