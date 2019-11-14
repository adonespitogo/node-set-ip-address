'use strict'

var util = require('util')
var fs = require('fs')
var writeFile = util.promisify(fs.writeFile)
var templates = require('./templates.js')

exports.setInterface = (iface, config) => {
  config.interface = iface
  var config_str = templates.format(config)
  var file = `/etc/network/interfaces.d/${iface}`
  return writeFile(file, config_str)
}
