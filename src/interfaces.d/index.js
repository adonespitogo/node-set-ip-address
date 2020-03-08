'use strict'

var util = require('util')
var fs = require('fs')
var promiseSeries = require('promise.series')
var writeFile = util.promisify(fs.writeFile)
var readFile = util.promisify(fs.readFile)
var templates = require('./templates.js')
var file = `/etc/network/interfaces`

exports.setInterface = async (config) => {
  var iface = config.interface
  var config_str = templates.format(config)
  var content = await readFile(file, 'utf8')
  await writeFile(file, content + '\n\n' + config_str + '\n')
}

exports.configure = async (configs) => {

  await writeFile(file, templates.main)

  var bridge_ports = configs.reduce((list, c) => {
    if (Array.isArray(c.bridge_ports)) {
      c.bridge_ports.forEach(p => {
        if (!list.includes(p))
          list.push(p)
      })
    }
    return list
  }, [])

  return promiseSeries(configs.map(cfg => {
    var c = Object.assign({}, cfg)
    return async () => {
      if (bridge_ports.includes(cfg.interface))
        await exports.setInterface(Object.assign(c, {dhcp: false, manual: true}))
      else
        await exports.setInterface(c)
    }
  }))
}
