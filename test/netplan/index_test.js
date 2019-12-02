'use strict'

var sinon = require('sinon')
var proxyquire = require('proxyquire')
var { expect } = require('chai')

describe('netplan', () => {

  var netplan,
    cfg_yaml,
    config,
    yaml,
    dump_ouput,
    fs,
    filename,
    ensureDir

  beforeEach(() => {
    ensureDir = sinon.fake.resolves()
    cfg_yaml = 'some config'
    dump_ouput = 'some yaml output'
    yaml = {safeDump: sinon.fake(() => dump_ouput)}
    config = {generate: sinon.fake.returns(cfg_yaml)}
    filename = 'some file'
    fs = {
      readdir: sinon.fake((dir, cb) => cb(null, [filename])),
      writeFile: sinon.fake((file, data, cb) => {
        cb()
      })
    }
    netplan = proxyquire('../../src/netplan/index.js', {
      fs,
      'make-dir': ensureDir,
      'js-yaml': yaml,
      './config': config
    })
  })

  describe('getYamlFileName()', () => {
    it('should return the yaml file name', async () => {
      var f = await netplan.getYamlFileName()
      sinon.assert.calledWithExactly(ensureDir, '/etc/netplan')
      expect(fs.readdir.lastCall.args[0]).to.equal('/etc/netplan')
      expect(f).to.equal('/etc/netplan/' + filename)
    })
    it('should return random file name', async () => {
      fs = {
        readdir: sinon.fake((dir, cb) => cb(null, []))
      }
      netplan = proxyquire('../../src/netplan/index.js', {
        fs,
        'make-dir': ensureDir,
      })
      var f = await netplan.getYamlFileName()
      sinon.assert.calledWithExactly(ensureDir, '/etc/netplan')
      expect(fs.readdir.lastCall.args[0]).to.equal('/etc/netplan')
      expect(f).to.equal('/etc/netplan/01-networkcfg.yaml')
    })
  })

  describe('setInterface()', () => {

    it('should stack config for single interface', () => {
      var eth0 = {
        interface: 'eth0'
      }
      var arg1 = netplan.cfg_stack
      netplan.setInterface(eth0)
      sinon.assert.calledWithExactly(config.generate, arg1, eth0)
      expect(netplan.cfg_stack).to.eql(cfg_yaml)
    })

  })

  describe('writeConfig()', () => {

    beforeEach(() => {
      sinon.stub(netplan, 'getYamlFileName').returns('/etc/netplan/' + filename)
    })

    afterEach(() => {
      netplan.getYamlFileName.restore()
    })

    it('should write config to /etc/netplan', async () => {
      await netplan.writeConfig()
      sinon.assert.calledWithExactly(ensureDir, '/etc/netplan')
      sinon.assert.calledWithExactly(yaml.safeDump, netplan.cfg_stack, {noCompatMode: true})
      expect(fs.writeFile.lastCall.args[0]).to.equal('/etc/netplan/' + filename)
      expect(fs.writeFile.lastCall.args[1]).to.equal(dump_ouput)
    })

  })

  describe('configure()', () => {
    var set_interface_stub, write_stub
    beforeEach(() => {
      set_interface_stub = sinon.stub(netplan, 'setInterface').returns()
      write_stub = sinon.stub(netplan, 'writeConfig').resolves()
    })
    afterEach(() => {
      set_interface_stub.restore()
      write_stub.restore()
    })
    it('should accept array arg', async () => {
      netplan.cfg_stack = {
        network: {
          ethernets: ['some config'],
          vlans: ['some vlans']
        }
      }
      var eth0 = {interface: 'eth0', ip_address: '10.0.0.1'}
      var eth1 = {interface: 'eth1', ip_address: '10.0.0.1'}
      var configs = [eth0, eth1]
      await netplan.configure(configs)
      expect(set_interface_stub.firstCall.args).to.eql([eth0])
      expect(set_interface_stub.lastCall.args).to.eql([eth1])
      expect(netplan.cfg_stack.network.ethernets).to.eql({})
      expect(netplan.cfg_stack.network.vlans).to.eql({})
      sinon.assert.calledOnce(write_stub)
      sinon.assert.callOrder(set_interface_stub, write_stub)
    })

  })

})
