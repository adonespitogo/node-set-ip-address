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
`

exports.generateStatic = (config) => {
  var result = exports.static
    .replace(/\[INTERFACE\]/, config.interface)
    .replace(/\[ADDRESS\]/, config.ip_address)
    .replace(/\[PREFIX\]/, config.prefix)
    .replace(/\[GATEWAY\]\n/, config.gateway? 'static routers=' + config.gateway + '\n': '')

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

  var bridged = configs.reduce((list, cfg) => {
    if (Array.isArray(cfg.bridge)) {
      cfg.bridge.forEach(iface => {
        if (!list.includes(iface))
          list.push(iface)
      })
    }
    return list
  }, [])

  configs.forEach(c => {
    var is_vlan = typeof c.vlanid == 'number'
    if (!c.dhcp && !is_vlan && !bridged.includes(c.interface) && !Array.isArray(c.bridge))
      result += `\n\n${exports.generateStatic(Object.assign({}, c)).trim()}`
  })

  var ret = exports.main.trim() + result

  if (bridged.length) {
    ret += `\n\ndenyinterfaces ${bridged.join(' ')}`
  }

  return ret

}

