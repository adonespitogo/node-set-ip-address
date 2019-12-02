'use strict'

var util = require('util')
var fs = require('fs')
var promiseSeries = require('promise.series')
var ensureDir = require('make-dir')
var writeFile = util.promisify(fs.writeFile)
var readFile = util.promisify(fs.readFile)
var templates = require('./templates.js')

exports.setInterface = async (config) => {
  var iface = config.interface
  var config_str = templates.format(config)
  var file = `/etc/network/interfaces.d/${config.interface}`
  await ensureDir('/etc/network/interfaces.d')
  if (config.vlanid) {
    var content = await readFile(file, 'utf8')
    return writeFile(file, content + '\n' + config_str)
  }
  else
    return writeFile(file, config_str)
}

exports.configure = async (configs) => {
  return promiseSeries(configs.map(c => () => exports.setInterface(Object.assign({}, c))))
}
