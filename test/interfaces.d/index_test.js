'use strict'

var sinon = require('sinon')
var proxyquire = require('proxyquire')
var { expect } = require('chai')
var fs = require('fs')

describe('interfaces.d/index.js', () => {

  var interfaces_d,
    templates,
    config_str,
    ensureDir,
    eth0_content,
    promiseSeries,
    configure_fns,
    configure_resolve

  beforeEach(() => {
    eth0_content = 'some eth0 content'
    ensureDir = sinon.fake.resolves()
    config_str = 'some config'
    templates = {
      format: sinon.fake.returns(config_str)
    }
    sinon.stub(fs, 'writeFile').callsFake((file, data, cb) => {
      cb()
    })
    sinon.stub(fs, 'readFile').callsFake((file, enc, cb) => {
      cb(null, eth0_content)
    })
    promiseSeries = sinon.fake(fns => {
      configure_fns = fns
      return new Promise(r => configure_resolve = r)
    })
    interfaces_d = proxyquire('../../src/interfaces.d/index.js', {
      fs,
      'promise.series': promiseSeries,
      'make-dir': ensureDir,
      './templates.js': templates
    })
  })

  afterEach(() => {
    fs.writeFile.restore()
    fs.readFile.restore()
  })

  describe('setInterface()', () => {


    it('should write config file', async () => {
      var cfg = {ip_address: '10.0.0.1', interface: 'eth0'}
      await interfaces_d.setInterface(cfg)
      sinon.assert.calledWithExactly(templates.format, cfg)
      sinon.assert.calledWithExactly(ensureDir, '/etc/network/interfaces.d')
      expect(fs.writeFile.lastCall.args[0]).to.equal('/etc/network/interfaces.d/eth0')
      expect(fs.writeFile.lastCall.args[1]).to.equal(config_str)
    })

    it('should write config file for vlan interface', async () => {
      var cfg = {ip_address: '10.0.0.1', interface: 'eth0', vlanid: 10}
      await interfaces_d.setInterface(cfg)
      sinon.assert.calledWithExactly(templates.format, cfg)
      sinon.assert.calledWithExactly(ensureDir, '/etc/network/interfaces.d')
      expect(fs.writeFile.lastCall.args[0]).to.equal('/etc/network/interfaces.d/eth0')
      expect(fs.writeFile.lastCall.args[1]).to.equal(eth0_content + '\n' + config_str)
    })

  })

  describe('configure()', () => {

    it('should accept array params and write config', (done) => {
      var set_interface_stub = sinon.stub(interfaces_d, 'setInterface').resolves()
      var eth0 = {interface: 'eth0'}
      var eth1 = {interface: 'eth1'}
      var configs = [eth0, eth1]
      interfaces_d.configure(configs)
        .then(() => done())
        .catch(e => done(e))
      expect(configure_fns).to.have.lengthOf(2)
      configure_fns[0]()
      expect(set_interface_stub.lastCall.args).to.eql([eth0])
      configure_fns[1]()
      expect(set_interface_stub.lastCall.args).to.eql([eth1])
      set_interface_stub.restore()
      configure_resolve()
    })

  })

})
