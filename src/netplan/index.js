'use strict'

var fs = require('fs')
var yaml = require('js-yaml')
var config = require('./config.js')
var util = require('util')
var readdir = util.promisify(fs.readdir)
var writeFile = util.promisify(fs.writeFile)
var ensureDir = require('make-dir')

exports.cfg_stack = {
  network: {
    version: 2,
    renderer: 'networkd'
  }
}

exports.getYamlFileName = async () => {
  var files = await readdir('/etc/netplan')
  return '/etc/netplan/' + files[0]
}

exports.setInterface = (cfg) => {
  exports.cfg_stack = config.generate(exports.cfg_stack, cfg)
}

exports.writeConfig = async () => {
  var cfg_yaml = yaml.safeDump(exports.cfg_stack, {noCompatMode: true})
  var filename = await exports.getYamlFileName()
  await ensureDir('/etc/netplan')
  return writeFile(filename, cfg_yaml) 
}

exports.configure = (configs) => {
  configs.forEach(c => exports.setInterface(c))
  return exports.writeConfig()
}

