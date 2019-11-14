'use strict'

var sinon = require('sinon')
var proxyquire = require('proxyquire')
var { expect } = require('chai')
var fs = require('fs')

describe('interfaces.d/index.js', () => {

  var interfaces_d,
    templates,
    config_str,
    ensureDir

  beforeEach(() => {
    ensureDir = sinon.fake.resolves()
    config_str = 'some config'
    templates = {
      format: sinon.fake.returns(config_str)
    }
    sinon.stub(fs, 'writeFile').callsFake((file, data, cb) => {
      cb()
    })
    interfaces_d = proxyquire('../../src/interfaces.d/index.js', {
      'ensure-dir': ensureDir,
      fs,
      './templates.js': templates
    })
  })

  afterEach(() => {
    fs.writeFile.restore()
  })

  it('should write config file', async () => {
    var cfg = {ip_address: '10.0.0.1', interface: 'eth0'}
    await interfaces_d.setInterface(cfg)
    sinon.assert.calledWithExactly(templates.format, cfg)
    sinon.assert.calledWithExactly(ensureDir, '/etc/network/interfaces.d')
    expect(fs.writeFile.lastCall.args[0]).to.equal('/etc/network/interfaces.d/eth0')
    expect(fs.writeFile.lastCall.args[1]).to.equal(config_str)
  })

  it('should accept array params and write config', async () => {
    var set_interface_stub = sinon.stub(interfaces_d, 'setInterface').resolves()
    var eth0 = {interface: 'eth0'}
    var eth1 = {interface: 'eth1'}
    var configs = [eth0, eth1]
    await interfaces_d.configure(configs)
    expect(set_interface_stub.firstCall.args).to.eql([eth0])
    expect(set_interface_stub.lastCall.args).to.eql([eth1])
    set_interface_stub.restore()
  })

})
