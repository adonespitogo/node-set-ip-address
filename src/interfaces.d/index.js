'use strict'

var util = require('util')
var fs = require('fs')
var ensureDir = require('make-dir')
var writeFile = util.promisify(fs.writeFile)
var templates = require('./templates.js')

exports.setInterface = async (config) => {
  var iface = config.interface
  var config_str = templates.format(config)
  var file = `/etc/network/interfaces.d/${config.vlanid ? `${config.interface}.${config.vlanid}` : config.interface}`
  await ensureDir('/etc/network/interfaces.d')
  return writeFile(file, config_str)
}

exports.configure = async (configs) => {
  return Promise.all(configs.map(c => exports.setInterface(c)))
}
