'use strict'

var interfaces_d = require('./interfaces.d/index.js')
var dhcpcd = require('./dhcpcd/index.js')
var netplan = require('./netplan/index.js')
var { exec } = require('child_process')
var { promisify } = require('util')
var execPromise = promisify(exec)

exports.configure = async (configs) => {

  if (typeof configs == 'object' && !Array.isArray(configs))
    configs = [configs]

  var vlans_table = {}

  configs.forEach(c => {
    if (typeof c.vlanid == 'number') {
      var k = `${c.interface}.${c.vlanid}`
      if (vlans_table[k])
        throw new Error("Can't have same VLAN ID on interface " + c.interface)
      vlans_table[k] = true
    }
  })

  configs = configs.sort((a, b) => {
    return a.vlanid && !b.vlanid ? 1 : 0;
  })
  await Promise.all([
    dhcpcd.configure(configs),
    interfaces_d.configure(configs),
    netplan.configure(configs)
  ])

}

exports.restartService = async () => {
  var error
  var network_service_restarted = false
  var networking_restart = execPromise('service networking restart')
    .then(() => network_service_restarted = true)
    .catch(e => {
      console.log(e)
      error = e
    })
  var netplan_restart = execPromise('netplan try')
    .then(() => execPromise('netplan apply'))
    .then(() => network_service_restarted = true)
    .catch(e => {
      console.log(e)
      error = e
    })

  await Promise.all([networking_restart, netplan_restart])

  if (!network_service_restarted)
    return Promise.reject(error)

}
