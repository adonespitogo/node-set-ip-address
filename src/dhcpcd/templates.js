var trim_ip_address = require('../helpers/trim_ip_address.js')

exports.main = `
hostname

clientid

persistent

option rapid_commit

option domain_name_servers, domain_name, domain_search, host_name
option classless_static_routes
option interface_mtu

require dhcp_server_identifier

slaac private

`
exports.static = `
interface [INTERFACE]
static ip_address=[ADDRESS]/[PREFIX]
[GATEWAY]
[DNS]
[NOARP]
`
exports.formatDNS = ns => {
  if (!ns || (ns && !ns.length)) return '';

  var dns_nameservers = 'static domain_name_servers=';
  var r = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g

  if (Array.isArray(ns)) {
    var addresses = ns.reduce((result, item) => {
      var addrs = item.match(r)
      if (addrs && addrs.length) {
        return result + ' ' + item.match(r).join(' ')
      } else {
        return result
      }
    }, '').trim()
    return addresses ? dns_nameservers + addresses + '\n' : ''
  } else if (typeof ns === 'string') {
    var addresses = ns.match(r)
    return addresses && addresses.length ? dns_nameservers + addresses.join(' ') + '\n' : ''
  } else {
    return ''
  }
}

exports.generateStatic = (config) => {
  var is_vlan = typeof config.vlanid == 'number'
  var result = exports.static
    .replace(/\[INTERFACE\]/, config.interface + (is_vlan ? `.${config.vlanid}` : ''))
    .replace(/\[ADDRESS\]/, !config.manual ? trim_ip_address(config.ip_address) : '')
    .replace(/\[PREFIX\]/, config.prefix)
    .replace(/\[GATEWAY\]\n/, config.gateway? 'static routers=' + config.gateway + '\n': '')

  if(config.noarp)
    result = result.replace(/\[NOARP\]/, 'noarp')
  else
    result = result.replace(/\[NOARP]\n/, '')

  result = result.replace(/\[DNS\]\n/, exports.formatDNS(config.nameservers))
  return result
}

exports.generateConfig = (configs) => {

  var result = ''

  var bridge_ports = configs.reduce((list, cfg) => {
    if (Array.isArray(cfg.bridge_ports)) {
      cfg.bridge_ports.forEach(iface => {
        if (!list.includes(iface))
          list.push(iface)
      })
    }
    return list
  }, [])

  configs.forEach(c => {
    var is_vlan = typeof c.vlanid === 'number'
    var iface_name = is_vlan ? c.interface + `.${c.vlanid}` : c.interface
    if (!c.dhcp && !bridge_ports.includes(iface_name))
      result += `\n\n${exports.generateStatic({...c}).trim()}`
  })

  var ret = exports.main.trim() + result

  if (bridge_ports.length) {
    ret += `\n\ndenyinterfaces ${bridge_ports.join(' ')}`
  }

  return ret

}
