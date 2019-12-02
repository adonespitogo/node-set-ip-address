'use strict'

var interfaces_d = require('./interfaces.d/index.js')
var dhcpcd = require('./dhcpcd/index.js')
var netplan = require('./netplan/index.js')
var { exec } = require('child_process')
var { promisify } = require('util')
var execPromise = promisify(exec)

exports.configure = async (configs) => {
  configs = configs.sort((a, b) => {
    return a.vlanid && !b.vlanid ? 1 : 0;
  })
  await Promise.all([
    dhcpcd.configure(configs),
    interfaces_d.configure(configs),
    netplan.configure(configs)
  ])

  return exports.restartService()

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
  var netplan_restart = execPromise('netplay try')
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
