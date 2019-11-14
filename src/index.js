'use strict'

var interfaces_d = require('./interfaces.d/index.js')
var dhcpcd = require('./dhcpcd/index.js')
var netplan = require('./netplan/index.js')

exports.configure = (configs) => {
  return Promise.all([
    dhcpcd.configure(configs),
    interfaces_d.configure(configs),
    netplan.configure(configs)
  ])
}
