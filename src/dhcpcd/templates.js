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

exports.generateStatic = (config) => {
  var is_vlan = typeof config.vlanid == 'number'
  var result = exports.static
    .replace(/\[INTERFACE\]/, config.interface + (is_vlan ? `.${config.vlanid}` : ''))
    .replace(/\[ADDRESS\]/, config.ip_address)
    .replace(/\[PREFIX\]/, config.prefix)
    .replace(/\[GATEWAY\]\n/, config.gateway? 'static routers=' + config.gateway + '\n': '')

  if(config.noarp)
    result = result.replace(/\[NOARP\]/, 'noarp')
  else
    result = result.replace(/\[NOARP]\n/, '')

  config.nameservers = config.nameservers || []
  if (config.nameservers.length) {
    var dns = ''
    config.nameservers.forEach(s => {
      dns += ' ' + s
    })
    result = result.replace(/\[DNS\]/, 'static domain_name_servers='+ dns.trim())
  } else
    result = result.replace(/\[DNS\]\n/, '')

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
