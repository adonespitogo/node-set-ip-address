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
  await ensureDir('/etc/netplan')
  var files = await readdir('/etc/netplan')
  return '/etc/netplan/' + (files[0] || '01-networkcfg.yaml')
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
  exports.cfg_stack.network.ethernets = {}
  exports.cfg_stack.network.vlans = {}
  configs.forEach(c => {
    var cfg = Object.assign({}, c)
    return exports.setInterface(cfg)
  })
  return exports.writeConfig()
}

