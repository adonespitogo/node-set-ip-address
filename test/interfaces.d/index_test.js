'use strict'

var sinon = require('sinon')
var proxyquire = require('proxyquire')
var { expect } = require('chai')
var fs = require('fs')

describe('interfaces.d/index.js', () => {

  var interfaces_d,
    templates,
    config_str

  beforeEach(() => {
    config_str = 'some config'
    templates = {
      format: sinon.fake.returns(config_str)
    }
    sinon.stub(fs, 'writeFile').callsFake((file, data, cb) => {
      cb()
    })
    interfaces_d = proxyquire('../../src/interfaces.d/index.js', {
      fs,
      './templates.js': templates
    })
  })

  afterEach(() => {
    fs.writeFile.restore()
  })

  it('should write config file', async () => {
    var cfg = {ip_address: '10.0.0.1'}
    var iface = 'eth0'
    var new_cfg = Object.assign({interface: iface}, cfg)
    await interfaces_d.setInterface(iface, cfg)
    sinon.assert.calledWithExactly(templates.format, cfg)
    expect(fs.writeFile.lastCall.args[0]).to.equal('/etc/network/interfaces.d/eth0')
    expect(fs.writeFile.lastCall.args[1]).to.equal(config_str)
  })

})
