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
    promiseSeries,
    configure_fns,
    configure_resolve

  beforeEach(() => {
    ensureDir = sinon.fake.resolves()
    config_str = 'some config'
    templates = {
      main: '# some content',
      format: sinon.fake.returns(config_str)
    }
    sinon.stub(fs, 'writeFile').callsFake((file, data, cb) => {
      cb()
    })
    sinon.stub(fs, 'readFile').callsFake((file, enc, cb) => {
      cb(null, templates.main)
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

      expect(fs.readFile.lastCall.args[0]).to.equal('/etc/network/interfaces')
      expect(fs.readFile.lastCall.args[1]).to.equal('utf8')

      expect(fs.writeFile.lastCall.args[0]).to.equal('/etc/network/interfaces')
      expect(fs.writeFile.lastCall.args[1]).to.equal(templates.main + '\n\n' + config_str + '\n')

      sinon.assert.calledWithExactly(templates.format, cfg)
    })

  })

  describe('configure()', () => {

    it('should accept array params and write config', async () => {
      var set_interface_stub = sinon.stub(interfaces_d, 'setInterface').resolves()
      var eth0 = {interface: 'eth0', dhcp: true}
      var eth1 = {interface: 'eth1', dhcp: true}
      var eth2 = {interface: 'eth2', dhcp: true}
      var eth3 = {interface: 'eth3', dhcp: true}
      var br0 = {interface: 'br0', dhcp: true, bridge_ports: ['eth2', 'eth3']}
      var configs = [eth0, eth1, eth2, eth3, br0]
      var ret = interfaces_d.configure(configs)
      await Promise.resolve()

      expect(fs.writeFile.firstCall.args[0]).to.equal('/etc/network/interfaces')
      expect(fs.writeFile.firstCall.args[1]).to.equal(templates.main)

      expect(configure_fns).to.have.lengthOf(5)

      configure_fns[0]()
      expect(set_interface_stub.lastCall.args).to.eql([eth0])
      configure_fns[1]()
      expect(set_interface_stub.lastCall.args).to.eql([eth1])
      configure_fns[2]()
      expect(set_interface_stub.lastCall.args).to.eql([Object.assign(eth2, {manual: true, dhcp: false})])
      configure_fns[3]()
      expect(set_interface_stub.lastCall.args).to.eql([Object.assign(eth3, {manual: true, dhcp: false})])
      configure_fns[4]()
      expect(set_interface_stub.lastCall.args).to.eql([br0])
      configure_resolve()
      set_interface_stub.restore()

      return ret
    })

  })

})

