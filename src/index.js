'use strict'

var interfaces_d = require('./interfaces.d/index.js')
var dhcpcd = require('./dhcpcd/index.js')
var netplan = require('./netplan/index.js')

exports.configure = (configs) => {
  configs = configs.sort((a, b) => {
    return a.vlanid && !b.vlanid ? 1 : 0;
  })
  return Promise.all([
    dhcpcd.configure(configs),
    interfaces_d.configure(configs),
    netplan.configure(configs)
  ])
}
