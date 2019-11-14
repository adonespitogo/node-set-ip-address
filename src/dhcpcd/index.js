'use strict'

var fs = require('fs')
var util = require('util')
var writeFile = util.promisify(fs.writeFile)
var templates = require('./templates.js')

exports.configure = (configs) => {
  var config_str = templates.generateConfig(configs)
  var file = '/etc/dhcpcd.conf'
  return writeFile(file, config_str)
}
